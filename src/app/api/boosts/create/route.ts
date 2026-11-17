import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const PAYZONE_BASE = 'https://paiement.payzone.ma'
const ORIGINATOR = process.env.PAYZONE_ORIGINATOR_ID || ''
const PASSWORD = process.env.PAYZONE_PASSWORD || ''
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.moliosempire.com'

const PLANS: Record<string, { amount: number; hours: number; label: string }> = {
  '24h': { amount: 10, hours: 24, label: '24 ساعة' },
  '72h': { amount: 30, hours: 72, label: '72 ساعة' },
  '7d': { amount: 50, hours: 168, label: '7 أيام' },
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST /api/boosts/create — إنشاء دفع PayZone لتعزيز منشور
export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  try {
    const { userId, postId, plan } = await req.json()
    const p = PLANS[plan]
    if (!userId || !postId || !p) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
    }
    if (!ORIGINATOR || !PASSWORD) {
      return NextResponse.json({ error: 'PayZone غير مُعد' }, { status: 500 })
    }

    const { data: post } = await supabase.from('posts').select('user_id').eq('id', postId).single()
    if (!post || post.user_id !== userId) {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 })
    }

    const { data: userData } = await supabase.auth.admin.getUserById(userId)
    const email = userData?.user?.email || ''
    const name = userData?.user?.user_metadata?.full_name || 'Molios Empire User'

    const orderId = `boost_${postId}_${Date.now()}`

    const res = await fetch(`${PAYZONE_BASE}/transaction/prepare`, {
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
          email,
          language: 'ar',
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        },
        order: {
          orderId,
          currency: 'MAD',
          amount: p.amount.toFixed(2),
          description: `تعزيز منشور - ${p.label}`,
        },
        paymentMode: 'Single',
        operation: 'Sale',
        ctrlRedirectURL: `${SITE_URL}/?boost=1`,
        ctrlCallbackURL: `${SITE_URL}/api/payzone/callback`,
        ctrlCustomData: JSON.stringify({ userId, postId, plan, type: 'boost' }),
      }),
    })

    const data = await res.json()
    if (data.status !== 'OK' && data.status !== 'SUCCESS') {
      return NextResponse.json({ error: data.message || 'فشل إنشاء الدفع' }, { status: 400 })
    }

    const merchantToken = data.merchantToken || data.transactionID
    await supabase.from('boosts').insert({
      post_id: postId,
      user_id: userId,
      plan,
      amount: p.amount,
      merchant_token: merchantToken,
      status: 'pending',
    })

    return NextResponse.json({ url: data.redirectURL || data.paymentURL, merchantToken })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
