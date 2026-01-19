export const OccIcon = ({ kind }: { kind: string }) => {
  const common = { className: 'occ-ico', viewBox: '0 0 24 24', fill: 'none' as const, xmlns: 'http://www.w3.org/2000/svg' }
  // Simple, culturally-neutral glyphs: lamp, crescent, khanda-like, star, lotus, om-like abstract.
  switch (kind) {
    case 'diwali':
      return (
        <svg {...common}>
          <path d="M12 3c-2.5 2.1-3.7 4.1-3.7 6.1 0 2.4 1.5 4.1 3.7 4.1s3.7-1.7 3.7-4.1C15.7 7.1 14.5 5.1 12 3Z" stroke="currentColor" strokeWidth="1.7" />
          <path d="M6 16.5c1.7-1.2 3.9-1.9 6-1.9s4.3.7 6 1.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
          <path d="M7.5 20h9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
        </svg>
      )
    case 'eid':
      return (
        <svg {...common}>
          <path d="M15.5 4.8a6.5 6.5 0 1 0 3.2 11.1A7.8 7.8 0 0 1 15.5 4.8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
          <path d="M19.6 7.2l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6.6-1.6Z" fill="currentColor"/>
        </svg>
      )
    case 'sikh':
      return (
        <svg {...common}>
          <path d="M12 3v18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
          <path d="M8 7c0 2.2 1.8 4 4 4s4-1.8 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
          <path d="M7 14c1.6-1 3.3-1.5 5-1.5S15.4 13 17 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
        </svg>
      )
    case 'christmas':
      return (
        <svg {...common}>
          <path d="M12 3l2.2 6.2H21l-5 3.7 1.9 6.1L12 15.8 6.1 19l1.9-6.1-5-3.7h6.8L12 3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
        </svg>
      )
    case 'jain':
      return (
        <svg {...common}>
          <path d="M12 4c3.9 2.6 6 5.4 6 8.3 0 3.6-2.7 6.2-6 6.2s-6-2.6-6-6.2C6 9.4 8.1 6.6 12 4Z" stroke="currentColor" strokeWidth="1.7" />
          <path d="M9 12h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
        </svg>
      )
    case 'buddhist':
      return (
        <svg {...common}>
          <path d="M12 5c3.3 0 6 2.7 6 6 0 4.8-3.3 7.6-6 9-2.7-1.4-6-4.2-6-9 0-3.3 2.7-6 6-6Z" stroke="currentColor" strokeWidth="1.7" />
          <path d="M9.2 10.8c.7-.8 1.7-1.3 2.8-1.3s2.1.5 2.8 1.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.7"/>
        </svg>
      )
  }
}
