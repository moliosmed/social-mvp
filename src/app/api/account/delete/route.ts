import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

// POST /api/account/delete — حذف الحساب و كل البيانات (server-side)
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization')
    if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const token = auth.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const id = user.id

    // 1. الصور من Storage
    try {
      const { data: a } = await supabase.storage.from('avatars').list()
      const af = (a || []).filter((f: any) => f.name.startsWith(id)).map((f: any) => f.name)
      if (af.length) await supabase.storage.from('avatars').remove(af)
    } catch {}
    try {
      const { data: p } = await supabase.storage.from('posts').list()
      const pf = (p || []).filter((f: any) => f.name.startsWith(id)).map((f: any) => f.name)
      if (pf.length) await supabase.storage.from('posts').remove(pf)
    } catch {}

    // 2. البيانات (الترتيب مهم بسبب foreign keys)
    await supabase.from('messages').delete().eq('sender_id', id)
    await supabase.from('comment_likes').delete().eq('user_id', id)
    await supabase.from('comments').delete().eq('user_id', id)
    await supabase.from('likes').delete().eq('user_id', id)
    await supabase.from('notifications').delete().eq('user_id', id)
    await supabase.from('notifications').delete().eq('actor_id', id)
    await supabase.from('follows').delete().eq('follower_id', id)
    await supabase.from('follows').delete().eq('following_id', id)
    await supabase.from('posts').delete().eq('user_id', id)
    await supabase.from('conversations').delete().or(`participant_1.eq.${id},participant_2.eq.${id}`)
    await supabase.from('profiles').delete().eq('id', id)

    // 3. حذف مستخدم الـ auth
    await supabase.auth.admin.deleteUser(id)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Delete account error:', err)
    return NextResponse.json({ error: err?.message || 'error' }, { status: 500 })
  }
}
