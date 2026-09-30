import { Icon } from './Icon'
export function StorySection() {
  return (
    <section id="story" className="story-section section-pad">
      <div className="story-copy">
        <div className="section-kicker">
          01 <span /> THE STORY
        </div>
        <h2>
          每一封信，
          <br />
          都有一顆想被理解的心。
        </h2>
        <p>
          戰爭結束後，不懂感情的少女薇爾莉特，
          <br className="desktop-break" />
          開始了作為「自動手記人偶」的新生活。
        </p>
        <p>
          透過代筆書信，她遇見形形色色的人，觸碰他們的喜悅、悲傷與思念。在傳遞心意的旅途中，她也慢慢找回自己的心。
        </p>
        <a href="#characters" className="text-link">
          認識故事中的人們 <Icon name="arrow" size={18} />
        </a>
      </div>
      <div className="story-image">
        <img src="/images/hero.jpg" alt="薇爾莉特眺望陽光下的萊登港口" loading="lazy" />
        <div className="image-caption">
          <span>THE BEGINNING OF A NEW LIFE</span>
          <span>萊登 · C.H 郵政公司</span>
        </div>
        <span className="image-stamp">
          一封信的
          <br />
          溫度
        </span>
      </div>
    </section>
  )
}
