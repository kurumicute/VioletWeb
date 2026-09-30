import { useState } from 'react'
import { Icon } from './Icon'
import { useQuotes } from '../hooks/useQuotes'
export function MemoriesSection({ onWriteLetter }: { onWriteLetter: () => void }) {
  const [quote, setQuote] = useState(0)
  const quotes = useQuotes()
  return (
    <section id="memories" className="memory-section">
      <span className="section-kicker">04 — WORDS THAT STAY</span>
      <div className="memory-flower">✧</div>
      <h2 key={quote}>{quotes[quote]}</h2>
      <p>獻給每一份未曾說出口，卻始終放在心底的思念。</p>
      <div className="memory-dots">
        {quotes.map((_, i) => (
          <button
            key={i}
            className={quote === i ? 'selected' : ''}
            onClick={() => setQuote(i)}
            aria-label={`第 ${i + 1} 句心語`}
          />
        ))}
      </div>
      <button className="primary-button" onClick={onWriteLetter}>
        <Icon name="mail" size={18} />
        寫下你的心意 <Icon name="arrow" size={18} />
      </button>
    </section>
  )
}
