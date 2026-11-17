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

// POST /api/groups/join-paid — دفع اشتراك مجموعة
export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  try {
    const { userId, groupId } = await req.json()
    if (!userId || !groupId) return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
    if (!ORIGINATOR || !PASSWORD) return NextResponse.json({ error: 'PayZone غير مُعد' }, { status: 500 })

    const { data: group } = await supabase.from('groups').select('*').eq('id', groupId).single()
    if (!group) return NextResponse.json({ error: 'المجموعة غير موجودة' }, { status: 404 })
    if (!group.is_paid || !group.price) return NextResponse.json({ error: 'المجموعة مجانية' }, { status: 400 })

    const { data: userData } = await supabase.auth.admin.getUserById(userId)
    const email = userData?.user?.email || ''
    const name = userData?.user?.user_metadata?.full_name || 'Molios Empire User'

    const orderId = `group_${groupId}_${userId}_${Date.now()}`

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
          currency: group.currency || 'MAD',
          amount: Number(group.price).toFixed(2),
          description: `اشتراك مجموعة ${group.name}`,
        },
        paymentMode: 'Single',
        operation: 'Sale',
        ctrlRedirectURL: `${SITE_URL}/groups?joined=1`,
        ctrlCallbackURL: `${SITE_URL}/api/payzone/callback`,
        ctrlCustomData: JSON.stringify({ userId, groupId, type: 'group' }),
      }),
    })

    const data = await res.json()
    if (data.status !== 'OK' && data.status !== 'SUCCESS') {
      return NextResponse.json({ error: data.message || 'فشل إنشاء الدفع' }, { status: 400 })
    }

    const merchantToken = data.merchantToken || data.transactionID
    await supabase.from('group_payments').insert({
      group_id: groupId,
      user_id: userId,
      amount: group.price,
      merchant_token: merchantToken,
      status: 'pending',
    })

    return NextResponse.json({ url: data.redirectURL || data.paymentURL, merchantToken })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
