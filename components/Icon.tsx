interface IconProps {
  name: string
  size?: number
  className?: string
  alt?: string
}

// eslint-disable-next-line @next/next/no-img-element
// Usiamo <img> invece di <Image /> perché questo componente non viene usato
// e le immagini SVG dinamiche funzionano meglio con img nativo
export function Icon({ name, size = 24, className = '', alt }: IconProps) {
  return (
    <img
      src={`/assets/icons/${name}.svg`}
      alt={alt || name}
      width={size}
      height={size}
      className={className}
      style={{ display: 'block' }}
    />
  )
}

