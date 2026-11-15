import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Ambil data async. `fetcher` dipanggil ulang saat `deps` (nilai sederhana: id, angka, string)
 * berubah atau saat `reload()` dipanggil. Data lama tetap ada saat memuat ulang.
 * Kalau `fetcher` null, tidak memuat apa-apa.
 * @returns {{ data: any, loading: boolean, error: Error|null, reload: () => void }}
 */
function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: Boolean(fetcher), error: null })
  const [nonce, setNonce] = useState(0)
  const fetcherRef = useRef(fetcher)
  const depsKey = JSON.stringify(deps)

  // Simpan fetcher terbaru (dijalankan sebelum effect pemuat di bawah)
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    const run = fetcherRef.current
    if (!run) {
      setState((s) => ({ ...s, loading: false }))
      return undefined
    }
    let active = true
    setState((s) => ({ ...s, loading: true, error: null }))
    Promise.resolve()
      .then(run)
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((error) => active && setState((s) => ({ data: s.data, loading: false, error })))
    return () => {
      active = false
    }
  }, [depsKey, nonce])

  const reload = useCallback(() => setNonce((n) => n + 1), [])
  return { ...state, reload }
}

export default useFetch
