import { Icon } from './Icon'
type SidebarProps = {
  active: string
  onNavigate: (section: string) => void
  onWriteLetter: () => void
}
export function Sidebar({ active, onNavigate, onWriteLetter }: SidebarProps) {
  return (
    <aside className="sidebar">
      <a href="#home" className="brand" aria-label="紫羅蘭永恆花園首頁">
        <span className="brand-flower">
          <Icon name="flower" size={39} />
        </span>
        <span>
          VIOLET<small>EVERGARDEN</small>
        </span>
      </a>
      <div className="sidebar-rule" />
      <span className="nav-label">THE WORLD OF VIOLET</span>
      <nav>
        {[
          ['home', 'home', '首頁', 'Home'],
          ['story', 'book', '故事介紹', 'Story'],
          ['characters', 'people', '角色介紹', 'Characters'],
          ['works', 'film', '動畫作品', 'Series & Films'],
          ['memories', 'heart', '永恆的回憶', 'Memories'],
          ['letters', 'mail', '花園信箱', 'Letters'],
        ].map(([id, icon, label, en]) => (
          <a
            key={id}
            href={`#${id}`}
            aria-label={label}
            title={label}
            className={active === id ? 'active' : ''}
            onClick={() => onNavigate(id)}
          >
            <Icon name={icon} />
            <span>
              {label}
              <small>{en}</small>
            </span>
            <span className="nav-dot" />
          </a>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="small-flower">✧</div>
        <p>
          將無法言說的心意，
          <br />
          化作一封封永恆的信。
        </p>
        <span>WORDS CONNECT HEARTS</span>
        <button onClick={onWriteLetter}>
          <Icon name="mail" size={17} /> 寫一封信 <span>↗</span>
        </button>
        <small>AN UNOFFICIAL FAN TRIBUTE</small>
      </div>
    </aside>
  )
}
