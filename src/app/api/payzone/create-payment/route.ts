import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const PAYZONE_BASE = 'https://paiement.payzone.ma'
const ORIGINATOR = process.env.PAYZONE_ORIGINATOR_ID || ''
const PASSWORD = process.env.PAYZONE_PASSWORD || ''
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.moliosempire.com'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  try {
    const { userId, plan } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 400 })
    }

    if (!ORIGINATOR || !PASSWORD) {
      return NextResponse.json({ error: 'PayZone غير مُعد' }, { status: 500 })
    }

    // جلب المستخدم و البروفايل
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    const email = userData.user.email || ''
    const name = profile?.full_name || profile?.username || 'Molios Empire User'

    const orderId = `premium_${userId}_${Date.now()}`

    // إنشاء الدفع عبر PayZone
    const payzoneRes = await fetch(`${PAYZONE_BASE}/transaction/prepare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${ORIGINATOR}:${PASSWORD}`).toString('base64'),
      },
      body: JSON.stringify({
        apiVersion: '002.70',
        shopper: {
          shopperId: userId,
          firstName: name.split(' ')[0] || 'User',
          lastName: name.split(' ').slice(1).join(' ') || '',
          email: email,
          language: 'ar',
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        },
        order: {
          orderId: orderId,
          currency: 'MAD',
          amount: '29.90',
          description: 'اشتراك Molios Empire Premium - شهري',
        },
        paymentMode: 'Single',
        operation: 'Sale',
        ctrlRedirectURL: `${SITE_URL}/pricing?success=1`,
        ctrlCallbackURL: `${SITE_URL}/api/payzone/callback`,
        ctrlCustomData: JSON.stringify({ userId, plan }),
      }),
    })

    const payzoneData = await payzoneRes.json()

    if (payzoneData.status !== 'OK' && payzoneData.status !== 'SUCCESS') {
      return NextResponse.json(
        { error: payzoneData.message || 'فشل إنشاء الدفع' },
        { status: 400 }
      )
    }

    const merchantToken = payzoneData.merchantToken || payzoneData.transactionID

    // حفظ الـ token ف قاعدة البيانات
    await supabase.from('premium_subscriptions').upsert({
      user_id: userId,
      merchant_token: merchantToken,
      status: 'pending',
      amount: 29.90,
      currency: 'MAD',
      interval: 'month',
    }, { onConflict: 'user_id' })

    const paymentUrl = payzoneData.redirectURL || payzoneData.paymentURL

    return NextResponse.json({ url: paymentUrl, merchantToken })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
