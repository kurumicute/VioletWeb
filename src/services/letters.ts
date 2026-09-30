export interface LetterDraft {
  submissionId: string
  title: string
  sender: string
  recipient: string
  body: string
  isPublic: boolean
}

export interface Letter {
  id: number
  title: string
  sender: string
  recipient: string
  body: string
  isPublic: boolean
  createdAt: string
}

export interface LetterPage {
  letters: Letter[]
  nextCursor: number
}

export interface SavedLetter {
  id: number
  isPublic: boolean
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    const timeout = AbortSignal.timeout(12000)
    const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout
    const response = await fetch(path, { ...options, signal })
    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('信箱服務尚未連線，請稍後重試。')
    }
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || '信箱服務暫時無法使用，請稍後重試。')
    }
    return data as T
  } catch (error) {
    if (options.signal?.aborted) throw error
    if (
      error instanceof TypeError ||
      (error instanceof DOMException && error.name === 'TimeoutError')
    ) {
      throw new Error('無法連線到信箱服務，請確認網路後再試一次。', { cause: error })
    }
    throw error
  }
}

export function getPublicLetters(before = 0, signal?: AbortSignal) {
  const query = before ? `?before=${before}` : ''
  return request<LetterPage>(`/api/letters${query}`, { signal })
}

export function saveLetter(draft: LetterDraft) {
  return request<SavedLetter>('/api/letters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(draft),
  })
}
