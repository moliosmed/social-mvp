'use client'

import { useEffect, useState } from 'react'

export default function Pwa() {
  const [installEvt, setInstallEvt] = useState<any>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
    setInstalled(window.matchMedia('(display-mode: standalone)').matches)
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setInstallEvt(e)
    }
    const onInstalled = () => {
      setInstalled(true)
      setInstallEvt(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed || !installEvt) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-2xl border border-gray-700 bg-gray-900/95 px-4 py-3 shadow-2xl">
      <span className="text-sm text-gray-200">ثبّت Molios Empire على هاتفك</span>
      <button
        onClick={async () => {
          try {
            await installEvt.prompt()
          } catch {}
          setInstallEvt(null)
        }}
        className="rounded-full bg-green-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-green-700"
      >
        تثبيت
      </button>
      <button
        onClick={() => setInstallEvt(null)}
        className="text-gray-400 hover:text-white"
        aria-label="إغلاق"
      >
        ✕
      </button>
    </div>
  )
}
