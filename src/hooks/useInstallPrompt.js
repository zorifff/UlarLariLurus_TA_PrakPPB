import { useSyncExternalStore } from 'react'

// Tangkap event `beforeinstallprompt` sedini mungkin (Chrome/Edge Android & desktop).
let deferredPrompt = null
const listeners = new Set()
const emit = () => listeners.forEach((l) => l())

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event
    emit()
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    emit()
  })
}

const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** `install` = fungsi untuk memunculkan dialog pasang aplikasi, atau null kalau tidak tersedia. */
function useInstallPrompt() {
  const prompt = useSyncExternalStore(subscribe, () => deferredPrompt, () => null)
  if (!prompt) return { install: null }

  return {
    install: async () => {
      prompt.prompt()
      await prompt.userChoice.catch(() => null)
      deferredPrompt = null
      emit()
    },
  }
}

export default useInstallPrompt
