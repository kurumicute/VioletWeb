import { Icon } from './Icon'
import { prepareTrailerConnection } from '../services/trailer'
export function Hero({ onPlayTrailer }: { onPlayTrailer: () => void }) {
  return (
    <>
      <section id="home" className="hero">
        <img
          className="hero-art"
          src="/images/visual2.jpg"
          alt="薇爾莉特手持信件，站在 C.H 郵政公司中"
        />
        <div className="hero-shade" />
        <header className="topbar">
          <span>A LETTER TO YOUR HEART</span>
        </header>
        <div className="hero-content">
          <div className="eyebrow">
            <span /> 京都動畫 · 一段關於愛的故事
          </div>
          <p className="japanese">ヴァイオレット・エヴァーガーデン</p>
          <h1>
            紫羅蘭
            <br />
            永恆花園<span className="title-dot">。</span>
          </h1>
          <div className="english-title">Violet Evergarden</div>
          <div className="gold-line" />
          <p className="hero-description">
            她曾不懂愛，卻替世界寫下了愛。
            <br />
            跟隨薇爾莉特，踏上尋找「我愛你」意義的旅程。
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#story">
              走進她的故事 <Icon name="arrow" size={18} />
            </a>
            <button
              className="trailer-button"
              onPointerEnter={prepareTrailerConnection}
              onPointerDown={prepareTrailerConnection}
              onFocus={prepareTrailerConnection}
              onClick={onPlayTrailer}
            >
              <span>
                <Icon name="play" size={15} />
              </span>
              觀看預告
            </button>
          </div>
          <div className="hero-tags">
            <span>2018 — 2020</span>
            <i />
            京都動畫
            <i />
            治癒・成長・愛
          </div>
        </div>
        <div className="vertical-note">想いを綴る、愛を知るために。</div>
        <a href="#story" className="scroll-note">
          SCROLL TO EXPLORE <span>↓</span>
        </a>
        <div className="hero-pagination">
          <b>01</b>
          <span />
          03
        </div>
      </section>
      <div className="quote-strip">
        <span className="quote-mark">“</span>
        <p>
          「我愛你」是什麼意思呢？<small>這是一位少女，理解愛、學會愛的故事。</small>
        </p>
        <span className="quote-signature">Violet Evergarden</span>
        <Icon name="flower" size={32} />
      </div>
    </>
  )
}
