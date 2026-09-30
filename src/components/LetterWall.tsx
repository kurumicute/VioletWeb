import { useEffect, useRef, useState } from 'react'
import { getPublicLetters } from '../services/letters'
import type { Letter } from '../services/letters'
import { Icon } from './Icon'
import { Modal } from './Modal'

interface LetterWallProps {
  revision: number
  onWriteLetter: () => void
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value))
}

export function LetterWall({ revision, onWriteLetter }: LetterWallProps) {
  const [letters, setLetters] = useState<Letter[]>([])
  const [nextCursor, setNextCursor] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [selected, setSelected] = useState<Letter | null>(null)
  const request = useRef<AbortController | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    request.current?.abort()
    request.current = controller
    async function load() {
      setLoading(true)
      setError('')
      try {
        const page = await getPublicLetters(0, controller.signal)
        setLetters(page.letters)
        setNextCursor(page.nextCursor)
      } catch (failure) {
        if (!controller.signal.aborted)
          setError(failure instanceof Error ? failure.message : '暫時無法讀取信件。')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => {
      controller.abort()
      request.current?.abort()
    }
  }, [revision, retry])

  async function loadMore() {
    if (loading || !nextCursor) return
    const controller = new AbortController()
    request.current = controller
    setLoading(true)
    setError('')
    try {
      const page = await getPublicLetters(nextCursor, controller.signal)
      setLetters((current) => [
        ...current,
        ...page.letters.filter(
          (letter) => !current.some((existing) => existing.id === letter.id),
        ),
      ])
      setNextCursor(page.nextCursor)
    } catch (failure) {
      if (!controller.signal.aborted)
        setError(failure instanceof Error ? failure.message : '暫時無法讀取信件。')
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  return (
    <section id="letters" className="letter-wall section-pad">
      <div className="section-heading">
        <div>
          <div className="section-kicker">
            05 <span /> LETTERS IN THE GARDEN
          </div>
          <h2>花園信箱，每一封都有人懂。</h2>
          <p className="section-description">
            在這裡，與陌生人的溫柔相遇。願每一份心意，都找到停留的地方。
          </p>
        </div>
        <button className="text-link" onClick={onWriteLetter}>
          <Icon name="mail" size={18} />
          留下一封信
        </button>
      </div>
      {letters.length > 0 && (
        <div className="letter-grid" aria-label="公開信件">
          {letters.map((letter, index) => (
            <button
              key={letter.id}
              className={`letter-card paper-${index % 3}`}
              onClick={() => setSelected(letter)}
              aria-label={`閱讀 ${letter.title}`}
            >
              <span className="letter-card-top">
                <span>TO. {letter.recipient}</span>
                <Icon name="flower" size={25} />
              </span>
              <h3>{letter.title}</h3>
              <p className="letter-excerpt">{letter.body}</p>
              <div className="letter-card-bottom">
                <span>
                  FROM. {letter.sender}
                  <small>{formatDate(letter.createdAt)}</small>
                </span>
                <span className="read-letter">拆開信件 ↗</span>
              </div>
            </button>
          ))}
        </div>
      )}
      {loading && (
        <p className="mailbox-status" role="status">
          正在收集花園裡的信件…
        </p>
      )}
      {error && (
        <div className="mailbox-status mailbox-error" role="alert">
          <p>{error}</p>
          <button className="text-link" onClick={() => setRetry((value) => value + 1)}>
            重新載入 ↻
          </button>
        </div>
      )}
      {!loading && !error && letters.length === 0 && (
        <div className="empty-mailbox">
          <div className="wax-seal">
            <Icon name="mail" size={28} />
          </div>
          <h3>花園正等待第一封來信。</h3>
          <p>或許，你的文字就是另一個人今天需要的溫柔。</p>
          <button className="primary-button" onClick={onWriteLetter}>
            寫下第一封信 <Icon name="arrow" size={18} />
          </button>
        </div>
      )}
      {nextCursor > 0 && (
        <div className="load-more">
          <button className="text-link" disabled={loading} onClick={loadMore}>
            閱讀更多來信 ↓
          </button>
        </div>
      )}
      <Modal
        open={selected !== null}
        title={selected?.title || '閱讀信件'}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <article className="letter-reading">
            <div className="letter-reading-heading">
              <span className="section-kicker">A LETTER FROM THE GARDEN</span>
              <Icon name="flower" size={35} />
            </div>
            <h2>{selected.title}</h2>
            <p className="letter-salutation">{selected.recipient}：</p>
            <div className="letter-body">{selected.body}</div>
            <div className="letter-signature">
              <span>{selected.sender} 敬上</span>
              <time dateTime={selected.createdAt}>{formatDate(selected.createdAt)}</time>
            </div>
            <div className="letter-reading-end">✧ 願這封信，為你帶來一點溫柔 ✧</div>
          </article>
        )}
      </Modal>
    </section>
  )
}
