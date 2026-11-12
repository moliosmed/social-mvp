import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// PayZone كايبّلغ له هنا من بعد الدفع
export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  try {
    const payload = await req.json().catch(() => null)
    console.log('[PayZone callback]', JSON.stringify(payload))

    if (!payload) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // استخراج البيانات (PayZone كايبعت بأشكال مختلفة حسب الـ API version)
    const merchantToken =
      payload.merchantToken ||
      payload.transactionID ||
      payload.paymentID ||
      payload.orderId ||
      ''

    const status =
      (payload.status || payload.transactionStatus || payload.result || '')
        .toString()
        .toLowerCase()

    const customData = payload.ctrlCustomData
      ? (() => { try { return JSON.parse(payload.ctrlCustomData) } catch { return {} } })()
      : {}

    const userId = customData.userId || payload.shopper?.shopperId || ''

    // حالات النجاح المحتملة
    const successStatuses = ['authorized', 'success', 'captured', 'paid', 'ok', 'valid', 'accepted']
    const isSuccess = successStatuses.includes(status)

    if (isSuccess && userId) {
      // تفعيل الـ Premium
      await supabase
        .from('profiles')
        .update({ premium: true, premium_since: new Date().toISOString() })
        .eq('id', userId)

      await supabase
        .from('premium_subscriptions')
        .update({
          status: 'active',
          merchant_token: merchantToken,
          updated_at: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('user_id', userId)
    } else if (merchantToken) {
      await supabase
        .from('premium_subscriptions')
        .update({ status: 'pending', merchant_token: merchantToken, updated_at: new Date().toISOString() })
        .eq('merchant_token', merchantToken)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[PayZone callback error]', e.message)
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
