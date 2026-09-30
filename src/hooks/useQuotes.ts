import { useEffect, useState } from 'react'

const defaultQuotes = [
  '想傳達的心意，一定會有人為你送達。',
  '有些心情，只有寫成信才能好好說出口。',
  '讓思念成為文字，讓文字跨越距離。',
]

export function useQuotes() {
  const [quotes, setQuotes] = useState(defaultQuotes)
  useEffect(() => {
    const controller = new AbortController()
    async function loadQuotes() {
      try {
        const response = await fetch('/api/quotes', { signal: controller.signal })
        if (!response.ok) return
        const data: unknown = await response.json()
        if (
          Array.isArray(data) &&
          data.length >= 3 &&
          data.every((item) => typeof item === 'string')
        ) {
          setQuotes(data)
        }
      } catch {
        // The introduction remains readable when the API is offline.
      }
    }
    void loadQuotes()
    return () => controller.abort()
  }, [])
  return quotes
}
