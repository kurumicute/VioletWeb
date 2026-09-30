import { useState } from 'react'
import { works } from '../data/series'
export function WorksSection({
  onSelectWork,
}: {
  onSelectWork: (index: number) => void
}) {
  const [filter, setFilter] = useState('全部作品')
  return (
    <section id="works" className="works-section section-pad">
      <div className="section-heading">
        <div>
          <div className="section-kicker">
            03 <span /> THE COLLECTION
          </div>
          <h2>讓故事，繼續下去。</h2>
        </div>
        <div className="filters">
          {['全部作品', 'TV 動畫', '外傳', '劇場版'].map((category) => (
            <button
              key={category}
              className={filter === category ? 'selected' : ''}
              onClick={() => setFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      <div className="works-grid">
        {works.map(
          (work, index) =>
            (filter === '全部作品' || filter === work.type) && (
              <button
                className="work-card"
                key={work.title}
                onClick={() => onSelectWork(index)}
              >
                <div className="work-image">
                  <img src={work.image} alt={work.title} loading="lazy" />
                  <span>{work.type}</span>
                  <div className="work-open">↗</div>
                </div>
                <div className="work-meta">
                  {work.year}
                  <span>KYOTO ANIMATION</span>
                </div>
                <h3>{work.title}</h3>
                <p>{work.subtitle}</p>
              </button>
            ),
        )}
      </div>
    </section>
  )
}
