import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  try {
    const { userId, subscriptionId } = await req.json()
    if (!userId || !subscriptionId) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
    }

    const supabase = getSupabase()

    // تفعيل الـ Premium
    await supabase.from('profiles').update({
      premium: true,
      premium_since: new Date().toISOString(),
    }).eq('id', userId)

    await supabase.from('premium_subscriptions').upsert({
      user_id: userId,
      subscription_id: subscriptionId,
      status: 'active',
      merchant_token: subscriptionId,
      amount: 29.90,
      currency: 'MAD',
      interval: 'month',
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
