import { useEffect } from 'react'

export function useScrollReveal() {
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('main > section:not(#home)')
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-revealed')
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -48px 0px', threshold: 0 },
    )

    function updatePreference() {
      observer.disconnect()
      sections.forEach((section) => {
        section.classList.toggle('reveal-ready', !motionPreference.matches)
        if (!motionPreference.matches && !section.classList.contains('is-revealed')) {
          observer.observe(section)
        }
      })
    }

    // Keyboard navigation must never land on an invisible control.
    function revealFocusedSection(event: FocusEvent) {
      if (!(event.target instanceof Element)) return
      const section = event.target.closest('.reveal-ready')
      if (section) {
        section.classList.add('is-revealed')
        observer.unobserve(section)
      }
    }

    updatePreference()
    motionPreference.addEventListener('change', updatePreference)
    document.addEventListener('focusin', revealFocusedSection)
    return () => {
      observer.disconnect()
      motionPreference.removeEventListener('change', updatePreference)
      document.removeEventListener('focusin', revealFocusedSection)
      sections.forEach((section) =>
        section.classList.remove('reveal-ready', 'is-revealed'),
      )
    }
  }, [])
}
