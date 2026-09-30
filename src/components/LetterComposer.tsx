import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Icon } from './Icon'
import {
  clearDraft,
  emptyDraft,
  newSubmissionId,
  readDraft,
  storeDraft,
} from '../services/drafts'
import { saveLetter } from '../services/letters'
import type { LetterDraft, SavedLetter } from '../services/letters'

interface LetterComposerProps {
  onSaved: (letter: SavedLetter) => void
  onClose: () => void
  onSavingChange: (saving: boolean) => void
}

export function LetterComposer({
  onSaved,
  onClose,
  onSavingChange,
}: LetterComposerProps) {
  const [draft, setDraft] = useState(readDraft)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<SavedLetter | null>(null)
  const [error, setError] = useState('')
  const [draftMessage, setDraftMessage] = useState('')
  const submitting = useRef(false)

  function updateDraft<K extends keyof LetterDraft>(field: K, value: LetterDraft[K]) {
    const updated = { ...draft, [field]: value, submissionId: newSubmissionId() }
    setDraft(updated)
    setDraftMessage(
      storeDraft(updated)
        ? '草稿已保留在此瀏覽器'
        : '瀏覽器無法保存草稿，請先複製內容備份。',
    )
    setError('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true
    setSaving(true)
    onSavingChange(true)
    setError('')
    storeDraft(draft)
    try {
      const saved = await saveLetter(draft)
      clearDraft()
      setResult(saved)
      onSaved(saved)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : '儲存失敗，請再試一次。')
    } finally {
      submitting.current = false
      setSaving(false)
      onSavingChange(false)
    }
  }

  if (result) {
    return (
      <div className="letter-success" role="status">
        <div className="wax-seal">
          <Icon name="mail" size={28} />
        </div>
        <span className="section-kicker">SAFELY KEPT, FOREVER</span>
        <h2>
          {result.isPublic ? '你的心意，已在花園裡綻放。' : '這封心意，已為你珍藏。'}
        </h2>
        <p>
          {result.isPublic
            ? '信件已儲存，其他旅人現在可以在花園信箱閱讀。'
            : '信件已存入資料庫，不會出現在公開信箱。'}
        </p>
        {!result.isPublic && (
          <p className="privacy-note">目前尚無個人信箱頁，私人信件僅保存於資料庫。</p>
        )}
        <div className="letter-actions">
          <button className="primary-button" onClick={onClose}>
            回到花園 <Icon name="arrow" size={18} />
          </button>
        </div>
        <button
          className="text-link"
          onClick={() => {
            setDraft(emptyDraft())
            setResult(null)
            setDraftMessage('')
          }}
        >
          再寫一封信
        </button>
      </div>
    )
  }

  return (
    <form className="letter-modal" onSubmit={submit}>
      <Icon name="mail" size={30} />
      <div className="section-kicker">FROM YOUR HEART</div>
      <h2>有些心意，值得寫成一封信。</h2>
      <p>寫給重要的人，也可以寫給未來的自己。</p>
      <fieldset disabled={saving}>
        <label>
          信件標題
          <input
            value={draft.title}
            onChange={(event) => updateDraft('title', event.target.value)}
            maxLength={120}
            required
            placeholder="例如：給未來的自己"
          />
        </label>
        <div className="letter-fields">
          <label>
            收信人
            <input
              value={draft.recipient}
              onChange={(event) => updateDraft('recipient', event.target.value)}
              maxLength={80}
              required
            />
          </label>
          <label>
            你的署名
            <input
              value={draft.sender}
              onChange={(event) => updateDraft('sender', event.target.value)}
              maxLength={80}
              required
              placeholder="可以使用暱稱"
            />
          </label>
        </div>
        <label>
          你的心意
          <textarea
            value={draft.body}
            onChange={(event) => updateDraft('body', event.target.value)}
            maxLength={10000}
            required
            placeholder="一直想告訴你……"
            rows={7}
          />
        </label>
        <div className="draft-status">
          <span>{draftMessage}</span>
          <span>{draft.body.length.toLocaleString()} / 10,000</span>
        </div>
        <label className="publish-option">
          <input
            type="checkbox"
            checked={draft.isPublic}
            onChange={(event) => updateDraft('isPublic', event.target.checked)}
          />
          <span>
            讓其他旅人閱讀這封信
            <small>勾選後，標題、署名、收信人及全文都會顯示在花園信箱。</small>
          </span>
        </label>
        <div className="letter-actions">
          <button
            className="primary-button"
            type="submit"
            disabled={
              !draft.body.trim() ||
              !draft.title.trim() ||
              !draft.sender.trim() ||
              !draft.recipient.trim()
            }
          >
            {saving
              ? '正在保存心意…'
              : draft.isPublic
                ? '儲存並公開信件'
                : '儲存私人信件'}
            <Icon name="mail" size={17} />
          </button>
        </div>
      </fieldset>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <small>
        未勾選公開的信件只會儲存，不會展示給其他使用者。此功能不會寄送電子郵件。
      </small>
    </form>
  )
}
