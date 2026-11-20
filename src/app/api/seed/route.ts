import { NextResponse } from 'next/server'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!

const SEED = [
  { user: 'f17bb09e-b181-44f3-8e17-1f67fe5b19e7', content: '🌍 مرحبا بكم فـ Molios Empire — الشبكة الاجتماعية العربية المغربية الأولى!\n\nمنشورات · تفاعلات · رسائل فورية · مجموعات · هاشتاجات · استطلاعات · قصص.\nانضم مجاناً: moliosempire.com' },
  { user: '200a6cb8-8ddc-44ad-a2d6-805136db8e9e', content: '💡 5 نصائح باش تربح من السوشيال ميديا:\n1. اختار مجال و بقّيه\n2. المحتوى أولاً\n3. تفاعل مع المتابعين\n4. انتظم\n5. استعمل المنصات الذكية\nزيد معرفتك: moliosempire.com/blog' },
  { user: 'f17bb09e-b181-44f3-8e17-1f67fe5b19e7', content: '🚀 إطلاق Molios Empire! شبكة اجتماعية عربية بالدار العربية، تصميم عصري، و تفاعل فوري.\nجرّب دابا: moliosempire.com' },
  { user: '12e4565d-73c9-4206-8622-6cee382d86ee', content: '🛒 التجارة الإلكترونية فالمغرب كبرات بزاف. دابا وقت باش تبدا مشروعك!\nدليل كامل: moliosempire.com/blog/ecommerce-morocco' },
  { user: '29a9869c-d5b5-4832-bab9-c1a21a0c6b23', content: '⚡ جرّبت الـ تفاعلات emoji ديال Molios Empire؟ واحد الرياكت بلا تحديث الصفحة.\nجرب دابا: moliosempire.com' },
  { user: '200a6cb8-8ddc-44ad-a2d6-805136db8e9e', content: '🎁 كل 3 دعوات = 7 أيام Premium مجاناً!\nدع أصدقاءك: moliosempire.com/?ref=moliosempire' },
  { user: 'f17bb09e-b181-44f3-8e17-1f67fe5b19e7', content: '📱 قصص، استطلاعات، مجموعات، شارات، رسائل فورية... كل شي فـ Molios Empire.\nاكتشف: moliosempire.com' },
  { user: 'c44ef26a-4453-48b8-89bb-2a256b08a44b', content: '🇲🇦 منصة عربية بجذور مغربية. فخورين بنبناء هادشي معا.\nانضم: moliosempire.com' },
]

export async function POST() {
  const res = await fetch(`${URL}/rest/v1/posts`, {
    method: 'POST',
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(
      SEED.map((s) => ({ user_id: s.user, content: s.content, created_at: new Date(Date.now() - Math.random() * 86400000).toISOString() }))
    ),
  })
  const data = await res.json()
  return NextResponse.json({ ok: res.ok, count: Array.isArray(data) ? data.length : 0, error: res.ok ? null : data })
}
