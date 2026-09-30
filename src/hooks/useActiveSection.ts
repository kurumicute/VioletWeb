import { useEffect, useState } from 'react'

export function useActiveSection() {
  const [active, setActive] = useState('home')
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-20% 0px -55% 0px' },
    )
    document
      .querySelectorAll('main section[id]')
      .forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])
  return { active, setActive }
}
