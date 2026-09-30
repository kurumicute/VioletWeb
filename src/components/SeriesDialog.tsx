import { works } from '../data/series'
import { trailerEmbedUrl, trailerUrl } from '../services/trailer'
import { Modal } from './Modal'

interface SeriesDialogProps {
  selected: 'trailer' | number | null
  onClose: () => void
}

const officialSites = [
  'https://tv.violet-evergarden.jp/',
  'https://violet-evergarden.jp/sidestory/',
  'https://violet-evergarden.jp/',
]

export function SeriesDialog({ selected, onClose }: SeriesDialogProps) {
  const work = typeof selected === 'number' ? works[selected] : null
  return (
    <Modal
      open={selected !== null}
      title={work?.title || '官方預告'}
      onClose={onClose}
      className={selected === 'trailer' ? 'video-dialog' : undefined}
    >
      {selected === 'trailer' && (
        <div className="trailer-modal">
          <div className="section-kicker">OFFICIAL TRAILER</div>
          <h2>一段關於愛的旅程</h2>
          <iframe
            src={trailerEmbedUrl}
            title="紫羅蘭永恆花園官方預告"
            width="720"
            height="405"
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <a className="text-link" href={trailerUrl} target="_blank" rel="noreferrer">
            在 YouTube 觀看 ↗
          </a>
        </div>
      )}
      {work && typeof selected === 'number' && (
        <div className="work-modal">
          <img src={work.image} alt={work.title} />
          <div className="section-kicker">
            {work.year} — {work.type}
          </div>
          <h2>{work.title}</h2>
          <p>{work.detail}</p>
          <a
            className="text-link"
            href={officialSites[selected]}
            target="_blank"
            rel="noreferrer"
          >
            探索官方作品網站 ↗
          </a>
        </div>
      )}
    </Modal>
  )
}
