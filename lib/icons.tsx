// Monoline SVG icons — all 20×20, stroke="currentColor", strokeWidth=1.5
// Use with color prop to tint (defaults to wolf green via CSS)

interface IconProps {
  size?: number
  color?: string
  strokeWidth?: number
  label?: string
}

const base = (size: number, sw: number, label?: string) => ({
  width: size,
  height: size,
  strokeWidth: sw,
  stroke: 'currentColor',
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  role: 'img' as const,
  'aria-label': label,
  'aria-hidden': !label ? true as const : undefined,
})

const iconStyle = (color: string): React.CSSProperties => ({
  display: 'inline-block',
  flexShrink: 0,
  color,
})

export function IconWalking({ size = 20, color = 'currentColor', strokeWidth = 1.5, label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base(size, strokeWidth, label)} style={iconStyle(color)}>
      <circle cx="10" cy="3.5" r="1.5" />
      <path d="M10 5.5 L8.5 10 L6 13" />
      <path d="M10 5.5 L11.5 10 L14 13" />
      <path d="M8.5 10 L6.5 14" />
      <path d="M11.5 10 L13.5 14" />
    </svg>
  )
}

export function IconRunning({ size = 20, color = 'currentColor', strokeWidth = 1.5, label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base(size, strokeWidth, label)} style={iconStyle(color)}>
      <circle cx="12" cy="3.5" r="1.5" />
      <path d="M12 5 L9 9.5 L5.5 11" />
      <path d="M9 9.5 L10 13.5 L7.5 17" />
      <path d="M9 9.5 L12.5 12 L15 10.5" />
      <path d="M10 13.5 L13 16" />
    </svg>
  )
}

export function IconDumbbell({ size = 20, color = 'currentColor', strokeWidth = 1.5, label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base(size, strokeWidth, label)} style={iconStyle(color)}>
      <line x1="6" y1="10" x2="14" y2="10" />
      <rect x="3" y="8" width="3" height="4" rx="1" />
      <rect x="14" y="8" width="3" height="4" rx="1" />
      <rect x="1" y="8.5" width="2" height="3" rx="0.5" />
      <rect x="17" y="8.5" width="2" height="3" rx="0.5" />
    </svg>
  )
}

export function IconGolf({ size = 20, color = 'currentColor', strokeWidth = 1.5, label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base(size, strokeWidth, label)} style={iconStyle(color)}>
      <line x1="10" y1="2" x2="10" y2="17" />
      <path d="M10 2 L15 5 L10 8" />
      <ellipse cx="10" cy="17" rx="4" ry="1.2" />
    </svg>
  )
}

export function IconHiking({ size = 20, color = 'currentColor', strokeWidth = 1.5, label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base(size, strokeWidth, label)} style={iconStyle(color)}>
      <circle cx="10" cy="3.5" r="1.5" />
      <path d="M10 5.5 L9 10 L7 14" />
      <path d="M9 10 L11 13.5 L13.5 16" />
      <path d="M7 8 L10 5.5 L13 8" />
      <line x1="5" y1="7" x2="8" y2="13" />
    </svg>
  )
}

export function IconYoga({ size = 20, color = 'currentColor', strokeWidth = 1.5, label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base(size, strokeWidth, label)} style={iconStyle(color)}>
      <circle cx="10" cy="3.5" r="1.5" />
      <path d="M10 5.5 L10 11" />
      <path d="M10 9 L5.5 12 L4 15" />
      <path d="M10 9 L14.5 12 L16 15" />
      <path d="M4 15 L8 14" />
      <path d="M16 15 L12 14" />
    </svg>
  )
}

export function IconCore({ size = 20, color = 'currentColor', strokeWidth = 1.5, label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base(size, strokeWidth, label)} style={iconStyle(color)}>
      <circle cx="10" cy="3.5" r="1.5" />
      <path d="M10 5.5 L10 12 L6 17" />
      <path d="M10 12 L14 17" />
      <path d="M6 9 L14 9" />
    </svg>
  )
}

export function IconStairs({ size = 20, color = 'currentColor', strokeWidth = 1.5, label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base(size, strokeWidth, label)} style={iconStyle(color)}>
      <polyline points="3,17 3,13 7,13 7,9 11,9 11,5 15,5 15,3 17,3 17,17 3,17" />
    </svg>
  )
}

export function IconSkating({ size = 20, color = 'currentColor', strokeWidth = 1.5, label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base(size, strokeWidth, label)} style={iconStyle(color)}>
      <circle cx="10" cy="3.5" r="1.5" />
      <path d="M10 5.5 L8 10 L5 13" />
      <path d="M8 10 L12 11 L15 9" />
      <path d="M5 13 L5 16 L9 17" />
      <line x1="3" y1="17" x2="11" y2="17" />
    </svg>
  )
}

export function IconActivity({ size = 20, color = 'currentColor', strokeWidth = 1.5, label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base(size, strokeWidth, label)} style={iconStyle(color)}>
      <polyline points="2,10 6,4 9,14 12,7 14,11 18,10" />
    </svg>
  )
}

export function IconTrophy({ size = 20, color = 'currentColor', strokeWidth = 1.5, label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base(size, strokeWidth, label)} style={iconStyle(color)}>
      <path d="M6 3 L14 3 L14 9 C14 12 10 14 10 14 C10 14 6 12 6 9 Z" />
      <path d="M3 4 L6 4 L6 8 C4 8 3 7 3 6 Z" />
      <path d="M17 4 L14 4 L14 8 C16 8 17 7 17 6 Z" />
      <line x1="10" y1="14" x2="10" y2="16" />
      <line x1="7" y1="17" x2="13" y2="17" />
    </svg>
  )
}

export function IconHeartPulse({ size = 20, color = 'currentColor', strokeWidth = 1.5, label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base(size, strokeWidth, label)} style={iconStyle(color)}>
      <path d="M10 16 C10 16 3 11 3 7 C3 4.8 4.8 3 7 3 C8.2 3 9.3 3.6 10 4.5 C10.7 3.6 11.8 3 13 3 C15.2 3 17 4.8 17 7 C17 11 10 16 10 16Z" />
      <polyline points="5,9 7,7 9,11 11,8 13,9" />
    </svg>
  )
}

export function IconFlame({ size = 20, color = 'currentColor', strokeWidth = 1.5, label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base(size, strokeWidth, label)} style={iconStyle(color)}>
      <path d="M10 17 C7 17 5 15 5 12.5 C5 10 7 9 7 7 C7 9 9 9.5 9 8 C9 6 11 4 11 4 C11 7 13 8 13 10 C14 9 14 7.5 14 7.5 C15.5 9 15 12 15 12.5 C15 15 13 17 10 17Z" />
    </svg>
  )
}

export function IconBicep({ size = 20, color = 'currentColor', strokeWidth = 1.5, label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base(size, strokeWidth, label)} style={iconStyle(color)}>
      <path d="M4 12 C4 8 6 5 9 5 C11 5 12 6 12 6 C13 4 15 4 16 5 C17 6 16 8 14 8 C14 8 15 10 14 12 C13 14 11 15 9 15 C7 15 4 14 4 12Z" />
    </svg>
  )
}

export function IconLightning({ size = 20, color = 'currentColor', strokeWidth = 1.5, label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base(size, strokeWidth, label)} style={iconStyle(color)}>
      <polyline points="12,2 7,10 11,10 8,18 13,10 9,10 12,2" />
    </svg>
  )
}

export function IconPickleball({ size = 20, color = 'currentColor', strokeWidth = 1.5, label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base(size, strokeWidth, label)} style={iconStyle(color)}>
      <circle cx="10" cy="10" r="5" />
      <circle cx="9" cy="8.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="11.5" cy="9.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="11.5" r="0.6" fill="currentColor" stroke="none" />
      <line x1="14" y1="6" x2="18" y2="2" />
      <ellipse cx="18.5" cy="1.5" rx="1.2" ry="0.6" transform="rotate(-45 18.5 1.5)" />
    </svg>
  )
}

export function IconPaddle({ size = 20, color = 'currentColor', strokeWidth = 1.5, label }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base(size, strokeWidth, label)} style={iconStyle(color)}>
      {/* Kayak paddle: two teardrop blades + shaft running diagonally */}
      <line x1="4.5" y1="15.5" x2="15.5" y2="4.5" />
      <ellipse cx="3" cy="17" rx="2" ry="1.1" transform="rotate(-45 3 17)" />
      <ellipse cx="17" cy="3" rx="2" ry="1.1" transform="rotate(-45 17 3)" />
      {/* Water ripple */}
      <path d="M 2 11 Q 4 10 6 11 T 10 11" opacity="0.5" />
    </svg>
  )
}

export const ACTIVITY_SVG_ICONS: Record<string, React.ComponentType<IconProps>> = {
  'Walking':          IconWalking,
  'Running':          IconRunning,
  'Weight Training':  IconDumbbell,
  'Golf':             IconGolf,
  'Hiking':           IconHiking,
  'Yoga':             IconYoga,
  'Core Training':    IconCore,
  'Stair Climbing':   IconStairs,
  'Skating':          IconSkating,
  'Pickleball':       IconPickleball,
  'Paddling':         IconPaddle,
  'Unknown Activity': IconActivity,
}

export const AWARDS_SVG_ICONS: Record<string, React.ComponentType<IconProps>> = {
  'VO2':     IconActivity,
  'GOLF':    IconGolf,
  'HRV':     IconHeartPulse,
  'STEPS':   IconFlame,
  'PUSHUPS': IconBicep,
  'SESSIONS':IconLightning,
}
