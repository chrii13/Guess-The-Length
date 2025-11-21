import React from 'react'

interface SvgIconProps {
  name: string
  size?: number
  className?: string
  fill?: string
  stroke?: string
}

const icons: Record<string, (props: { size?: number; className?: string; fill?: string; stroke?: string }) => React.ReactNode> = {
  home: ({ size = 24, className, fill, stroke }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill || 'none'} stroke={stroke || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  play: ({ size = 24, className, fill, stroke }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill || 'none'} stroke={stroke || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  trophy: ({ size = 24, className, fill, stroke }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill || 'none'} stroke={stroke || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  ),
  chart: ({ size = 24, className, fill, stroke }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill || 'none'} stroke={stroke || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
      <line x1="12" x2="12" y1="20" y2="10"/>
      <line x1="18" x2="18" y1="20" y2="4"/>
      <line x1="6" x2="6" y1="20" y2="16"/>
    </svg>
  ),
  target: ({ size = 24, className, fill, stroke }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill || 'none'} stroke={stroke || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  precision: ({ size = 24, className, fill, stroke }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill || 'none'} stroke={stroke || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v6m0 6v6M23 12h-6M7 12H1m18.364-5.636l-4.243 4.243m0-8.485l4.243 4.243M5.636 18.364l4.243-4.243m0 8.485l-4.243-4.243"/>
    </svg>
  ),
  lock: ({ size = 24, className, fill, stroke }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill || 'none'} stroke={stroke || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  user: ({ size = 24, className, fill, stroke }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill || 'none'} stroke={stroke || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  logout: ({ size = 24, className, fill, stroke }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill || 'none'} stroke={stroke || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" x2="9" y1="12" y2="12"/>
    </svg>
  ),
  sun: ({ size = 24, className, fill, stroke }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill || 'none'} stroke={stroke || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" x2="12" y1="1" y2="3"/>
      <line x1="12" x2="12" y1="21" y2="23"/>
      <line x1="4.22" x2="5.64" y1="4.22" y2="5.64"/>
      <line x1="18.36" x2="19.78" y1="18.36" y2="19.78"/>
      <line x1="1" x2="3" y1="12" y2="12"/>
      <line x1="21" x2="23" y1="12" y2="12"/>
      <line x1="4.22" x2="5.64" y1="19.78" y2="18.36"/>
      <line x1="18.36" x2="19.78" y1="5.64" y2="4.22"/>
    </svg>
  ),
  moon: ({ size = 24, className, fill, stroke }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill || 'none'} stroke={stroke || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  refresh: ({ size = 24, className, fill, stroke }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill || 'none'} stroke={stroke || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
}

export function SvgIcon({ name, size = 24, className = '', fill, stroke }: SvgIconProps) {
  const IconComponent = icons[name]
  if (!IconComponent) {
    return null
  }
  return <>{IconComponent({ size, className, fill, stroke })}</>
}

