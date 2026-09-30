import type { ReactNode } from 'react'

export function Icon({ name, size = 21 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    flower: (
      <>
        <path d="M12 12C1 10 5 1 10 6C10-2 19 2 15 9C23 5 25 15 17 15C22 22 12 25 11 17C5 24-1 15 7 12Z" />
        <path d="M12 14v8m0-3 5-2" />
      </>
    ),
    home: (
      <>
        <path d="m3 10 9-7 9 7v11H3Z" />
        <path d="M9 21v-8h6v8" />
      </>
    ),
    book: (
      <>
        <path d="M12 5v16M12 5C8 2 3 3 2 4v15c4-2 7-1 10 2 3-3 6-4 10-2V4c-4-2-7-1-10 1Z" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="7" r="3" />
        <path d="M2 21v-4a7 7 0 0 1 14 0v4M16 4a3 3 0 0 1 0 6m3 3c3 1 3 5 3 8" />
      </>
    ),
    film: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7 3v18M17 3v18M3 8h4m-4 8h4m10-8h4m-4 8h4" />
      </>
    ),
    mail: (
      <>
        <rect x="2" y="5" width="20" height="15" rx="2" />
        <path d="m2 6 10 8L22 6" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    play: <path d="m9 5 11 7-11 7Z" />,
    heart: <path d="M12 21 3 12C-3 4 7-1 12 6c5-7 15-2 9 6Z" />,
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.flower}
    </svg>
  )
}
