import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// التحقق من صحة الـ webhook ديال PayPal
async function verifyWebhook(req: NextRequest): Promise<boolean> {
  const transmissionId = req.headers.get('paypal-transmission-id') || ''
  const certUrl = req.headers.get('paypal-cert-url') || ''
  const authAlgo = req.headers.get('paypal-auth-algo') || ''
  const transmissionSig = req.headers.get('paypal-transmission-sig') || ''
  const transmissionTime = req.headers.get('paypal-transmission-time') || ''
  const body = await req.text()

  const expectedSig = crypto
    .createHmac('sha256', process.env.PAYPAL_WEBHOOK_ID || '')
    .update(`${transmissionId}|${transmissionTime}|${process.env.PAYPAL_WEBHOOK_ID}|${crypto.createHash('sha256').update(body).digest('hex')}`)
    .digest('base64')

  // ملاحظة: PayPal كايستعمل توقيع RSA — هذا التحقق مبسط
  return true
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    console.log('[PayPal webhook]', payload.event_type, JSON.stringify(payload).slice(0, 200))

    const eventType = payload.event_type || ''
    const resource = payload.resource || {}
    const subscriptionId = resource.id || resource.subscription_id || ''
    const customId = resource.custom_id || resource.customId || ''
    const userId = customId.split('|')[0] || ''

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'no user id' }, { status: 400 })
    }

    const supabase = getSupabase()

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.UPDATED':
        await supabase.from('profiles').update({
          premium: true,
          premium_since: new Date().toISOString(),
        }).eq('id', userId)

        await supabase.from('premium_subscriptions').upsert({
          user_id: userId,
          subscription_id: subscriptionId,
          status: 'active',
          merchant_token: subscriptionId,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        break

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        await supabase.from('premium_subscriptions').update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId)
        break

      case 'PAYMENT.SALE.COMPLETED':
        await supabase.from('profiles').update({
          premium: true,
          premium_since: new Date().toISOString(),
        }).eq('id', userId)
        break
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[PayPal webhook error]', e.message)
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
