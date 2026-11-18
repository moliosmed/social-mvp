import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/admin/stats — إحصائيات الموقع + الدخل (للمسؤولين فقط)
export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!url || !key) return NextResponse.json({ error: 'server not configured' }, { status: 500 })

  const admin = createClient(url, key)

  const auth = req.headers.get('authorization')
  if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: { user }, error } = await admin.auth.getUser(auth.replace('Bearer ', ''))
  if (error || !user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const admins = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean)
  if (!admins.includes(user.email || '')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  try {
    const [
      usersRes, postsRes, commentsRes, reactionsRes, groupsRes, messagesRes,
      boostsRes, groupPaymentsRes, premiumRes,
    ] = await Promise.all([
      admin.from('profiles').select('*', { count: 'exact', head: true }),
      admin.from('posts').select('*', { count: 'exact', head: true }),
      admin.from('comments').select('*', { count: 'exact', head: true }),
      admin.from('reactions').select('*', { count: 'exact', head: true }),
      admin.from('groups').select('*', { count: 'exact', head: true }),
      admin.from('messages').select('*', { count: 'exact', head: true }),
      admin.from('boosts').select('amount, status'),
      admin.from('group_payments').select('amount, status'),
      admin.from('profiles').select('*', { count: 'exact', head: true }).eq('premium', true),
    ])

    const boostRevenue = (boostsRes.data || []).filter((b: any) => b.status === 'active')
      .reduce((s: number, b: any) => s + Number(b.amount || 0), 0)
    const groupRevenue = (groupPaymentsRes.data || []).filter((g: any) => g.status === 'active')
      .reduce((s: number, g: any) => s + Number(g.amount || 0), 0)

    return NextResponse.json({
      counts: {
        users: usersRes.count || 0,
        posts: postsRes.count || 0,
        comments: commentsRes.count || 0,
        reactions: reactionsRes.count || 0,
        groups: groupsRes.count || 0,
        messages: messagesRes.count || 0,
        premiumUsers: premiumRes.count || 0,
      },
      revenue: {
        boosts: boostRevenue,
        groups: groupRevenue,
        total: boostRevenue + groupRevenue,
      },
      boosts: boostsRes.data || [],
      groupPayments: groupPaymentsRes.data || [],
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
