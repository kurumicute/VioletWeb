import { useState } from 'react'
import { characters } from '../data/series'
export function CharacterSection() {
  const [character, setCharacter] = useState(0)
  const selectedCharacter = characters[character]
  return (
    <section id="characters" className="characters-section section-pad">
      <div className="section-heading">
        <div>
          <div className="section-kicker">
            02 <span /> THE PEOPLE
          </div>
          <h2>相遇，讓心有了形狀。</h2>
        </div>
        <span className="heading-note">每個人，都是故事裡不可或缺的一封信。</span>
      </div>
      <div className="character-layout">
        <div className="character-photo">
          <img
            key={character}
            src={selectedCharacter.image}
            alt={selectedCharacter.name}
            loading="lazy"
          />
        </div>
        <div className="character-info">
          <div className="character-tabs" role="group" aria-label="選擇角色">
            {characters.map((item, index) => (
              <button
                aria-pressed={character === index}
                key={item.en}
                onClick={() => setCharacter(index)}
                className={character === index ? 'selected' : ''}
              >
                {['薇爾莉特', '霍金斯', '基爾伯特'][index]}
              </button>
            ))}
          </div>
          <span className="role-label">{selectedCharacter.role}</span>
          <h3>{selectedCharacter.name}</h3>
          <span className="character-english">{selectedCharacter.en}</span>
          <p>{selectedCharacter.text}</p>
          <div className="character-footer">
            <span>CH. 0{character + 1}</span>
            <button
              aria-label="上一位角色"
              onClick={() =>
                setCharacter((character + characters.length - 1) % characters.length)
              }
            >
              ←
            </button>
            <button
              aria-label="下一位角色"
              onClick={() => setCharacter((character + 1) % characters.length)}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
