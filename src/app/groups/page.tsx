import type { Metadata } from 'next'
import GroupsClient from '@/components/GroupsClient'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.moliosempire.com/groups' },
  title: 'المجموعات | Molios Empire',
  description:
    'اكتشف مجموعات Molios Empire و انضم لمجتمع التجار و صناع المحتوى المغاربة. أنشئ مجموعتك الخاصة.',
  openGraph: {
    title: 'المجموعات | Molios Empire',
    description: 'انضم لمجموعات المجتمع أو أنشئ مجموعتك.',
    url: 'https://www.moliosempire.com/groups',
    siteName: 'Molios Empire',
  },
}

export default function GroupsPage() {
  return <GroupsClient />
}
