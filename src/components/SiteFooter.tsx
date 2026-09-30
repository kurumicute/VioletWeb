import { Icon } from './Icon'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <a className="footer-brand" href="#home">
        <Icon name="flower" /> VIOLET EVERGARDEN
      </a>
      <p>
        致每一顆溫柔的心。
        <br />
        <small>非官方粉絲介紹網站 · 圖像版權歸原權利人所有</small>
      </p>
      <a
        className="footer-source"
        href="https://tv.violet-evergarden.jp/"
        target="_blank"
        rel="noreferrer"
      >
        作品與圖像來源 ↗
      </a>
      <a
        className="footer-official"
        href="https://violet-evergarden.jp/"
        target="_blank"
        rel="noreferrer"
      >
        官方網站 <span>↗</span>
      </a>
    </footer>
  )
}
