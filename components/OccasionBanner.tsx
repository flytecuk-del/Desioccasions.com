export function OccasionBanner({ kind }: { kind: string }) {
  // Lightweight, inclusive illustrations (no religious text), optimized for hero areas.
  const common = { viewBox: '0 0 1200 600', xmlns: 'http://www.w3.org/2000/svg' }
  const bg = (a: string, b: string) => (
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={a} stopOpacity="0.55" />
        <stop offset="1" stopColor={b} stopOpacity="0.55" />
      </linearGradient>
      <radialGradient id="r" cx="25%" cy="20%" r="60%">
        <stop offset="0" stopColor={b} stopOpacity="0.55" />
        <stop offset="1" stopColor={b} stopOpacity="0" />
      </radialGradient>
    </defs>
  )

  const base = (a: string, b: string, icon: JSX.Element) => (
    <svg {...common} preserveAspectRatio="none">
      {bg(a,b)}
      <rect width="1200" height="600" fill="url(#g)" />
      <circle cx="260" cy="140" r="240" fill="url(#r)" />
      <circle cx="980" cy="460" r="260" fill="rgba(122,30,58,.18)" />
      <g opacity="0.9">{icon}</g>
      <g opacity="0.25">
        <path d="M80 520c180-90 360-110 540-60s330 20 500-90" stroke="rgba(31,41,55,.55)" strokeWidth="10" fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  )

  switch (kind) {
    case 'diwali':
    case 'navratri':
    case 'wedding':
      return base('#7A1E3A', '#F4A261',
        <g transform="translate(620 120)">
          <path d="M-70 220c40-30 90-46 140-46s100 16 140 46" stroke="rgba(255,255,255,.9)" strokeWidth="14" fill="none" strokeLinecap="round"/>
          <path d="M0 70c-58 48-86 96-86 142 0 56 34 96 86 96s86-40 86-96C86 166 58 118 0 70Z" fill="rgba(255,255,255,.26)" stroke="rgba(255,255,255,.85)" strokeWidth="14" />
          <path d="M0 36c-20 18-30 34-30 50 0 20 12 34 30 34s30-14 30-34c0-16-10-32-30-50Z" fill="rgba(255,255,255,.55)"/>
          <path d="M-120 360h240" stroke="rgba(255,255,255,.9)" strokeWidth="14" strokeLinecap="round"/>
        </g>
      )
    case 'eid':
      return base('#0F766E', '#F4A261',
        <g transform="translate(650 120)">
          <path d="M90 70A210 210 0 1 1 -10 420 250 250 0 0 0 90 70Z" fill="rgba(255,255,255,.22)" stroke="rgba(255,255,255,.9)" strokeWidth="14" />
          <path d="M220 150l18 54 54 18-54 18-18 54-18-54-54-18 54-18 18-54Z" fill="rgba(255,255,255,.85)"/>
        </g>
      )
    case 'sikh':
      return base('#1D4ED8', '#F4A261',
        <g transform="translate(600 120)">
          <path d="M0 60v420" stroke="rgba(255,255,255,.9)" strokeWidth="16" strokeLinecap="round"/>
          <path d="M-130 160c0 72 58 130 130 130s130-58 130-130" stroke="rgba(255,255,255,.9)" strokeWidth="16" fill="none" strokeLinecap="round"/>
          <path d="M-160 330c56-34 114-50 160-50s104 16 160 50" stroke="rgba(255,255,255,.9)" strokeWidth="16" fill="none" strokeLinecap="round"/>
        </g>
      )
    case 'jain':
      return base('#B45309', '#F4A261',
        <g transform="translate(620 110)">
          <path d="M0 70c140 96 210 190 210 290 0 128-92 220-210 220S-210 488-210 360C-210 260-140 166 0 70Z"
            fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.9)" strokeWidth="14"/>
          <path d="M-90 330h180" stroke="rgba(255,255,255,.9)" strokeWidth="14" strokeLinecap="round"/>
        </g>
      )
    case 'buddhist':
      return base('#7C3AED', '#F4A261',
        <g transform="translate(620 120)">
          <path d="M0 60c110 0 200 90 200 200 0 160-110 255-200 300-90-45-200-140-200-300C-200 150-110 60 0 60Z"
            fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.9)" strokeWidth="14"/>
          <path d="M-92 236c22-26 54-42 92-42s70 16 92 42" stroke="rgba(255,255,255,.9)" strokeWidth="14" fill="none" strokeLinecap="round"/>
        </g>
      )
    case 'christmas':
      return base('#991B1B', '#F4A261',
        <g transform="translate(620 110)">
          <path d="M0 80l70 200h210l-170 126 66 200L0 575-176 606l66-200-170-126h210L0 80Z"
            fill="rgba(255,255,255,.20)" stroke="rgba(255,255,255,.9)" strokeWidth="14" strokeLinejoin="round"/>
        </g>
      )
    default:
      return base('#7A1E3A', '#F4A261',
        <g transform="translate(620 140)">
          <circle cx="0" cy="220" r="140" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.9)" strokeWidth="14"/>
        </g>
      )
  }
}
