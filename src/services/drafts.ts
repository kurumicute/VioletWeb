import type { LetterDraft } from './letters'

const draftKey = 'violet-letter-draft'

export function newSubmissionId() {
  // getRandomValues also works when visiting a local-network HTTP address.
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function emptyDraft(): LetterDraft {
  return {
    submissionId: newSubmissionId(),
    title: '',
    sender: '一位旅人',
    recipient: '親愛的你',
    body: '',
    isPublic: false,
  }
}

export function readDraft(): LetterDraft {
  const draft = emptyDraft()
  try {
    const stored = localStorage.getItem(draftKey)
    if (!stored) return { ...draft, body: localStorage.getItem('violet-letter') || '' }
    const parsed = JSON.parse(stored)
    if (
      ['submissionId', 'title', 'sender', 'recipient', 'body'].every(
        (key) => typeof parsed[key] === 'string',
      ) &&
      typeof parsed.isPublic === 'boolean'
    ) {
      return { ...draft, ...parsed }
    }
  } catch {
    // Disabled browser storage must not prevent writing a new letter.
  }
  return draft
}

export function storeDraft(draft: LetterDraft) {
  try {
    localStorage.setItem(draftKey, JSON.stringify(draft))
    return true
  } catch {
    return false
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(draftKey)
    localStorage.removeItem('violet-letter')
  } catch {
    // Saving to MySQL has already succeeded even if browser storage is unavailable.
  }
}
