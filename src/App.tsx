import { useState } from 'react'
import { CharacterSection } from './components/CharacterSection'
import { Hero } from './components/Hero'
import { LetterComposer } from './components/LetterComposer'
import { LetterWall } from './components/LetterWall'
import { MemoriesSection } from './components/MemoriesSection'
import { Modal } from './components/Modal'
import { SeriesDialog } from './components/SeriesDialog'
import { Sidebar } from './components/Sidebar'
import { SiteFooter } from './components/SiteFooter'
import { StorySection } from './components/StorySection'
import { WorksSection } from './components/WorksSection'
import { useActiveSection } from './hooks/useActiveSection'
import { useScrollReveal } from './hooks/useScrollReveal'
import type { SavedLetter } from './services/letters'
import './App.css'
import './styles/letters.css'
import './styles/reveal.css'

function App() {
  useScrollReveal()
  const { active, setActive } = useActiveSection()
  const [seriesDialog, setSeriesDialog] = useState<'trailer' | number | null>(null)
  const [writingLetter, setWritingLetter] = useState(false)
  const [savingLetter, setSavingLetter] = useState(false)
  const [letterRevision, setLetterRevision] = useState(0)

  function handleLetterSaved(letter: SavedLetter) {
    if (letter.isPublic) setLetterRevision((revision) => revision + 1)
  }

  return (
    <div className="site-shell">
      <Sidebar
        active={active}
        onNavigate={setActive}
        onWriteLetter={() => setWritingLetter(true)}
      />
      <main>
        <Hero onPlayTrailer={() => setSeriesDialog('trailer')} />
        <StorySection />
        <CharacterSection />
        <WorksSection onSelectWork={setSeriesDialog} />
        <MemoriesSection onWriteLetter={() => setWritingLetter(true)} />
        <LetterWall
          revision={letterRevision}
          onWriteLetter={() => setWritingLetter(true)}
        />
        <SiteFooter />
      </main>
      <SeriesDialog selected={seriesDialog} onClose={() => setSeriesDialog(null)} />
      <Modal
        open={writingLetter}
        title="寫一封信"
        dismissible={!savingLetter}
        onClose={() => setWritingLetter(false)}
      >
        <LetterComposer
          onSaved={handleLetterSaved}
          onSavingChange={setSavingLetter}
          onClose={() => setWritingLetter(false)}
        />
      </Modal>
    </div>
  )
}

export default App
