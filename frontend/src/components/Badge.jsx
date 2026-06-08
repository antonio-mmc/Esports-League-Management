const variants = {
  green:  'bg-accent-green/10 text-accent-green border border-accent-green/20',
  cyan:   'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20',
  blue:   'bg-accent-blue/10 text-accent-blue border border-accent-blue/20',
  purple: 'bg-accent-purple/10 text-accent-purple border border-accent-purple/20',
  gray:   'bg-bg-border/40 text-text-muted border border-bg-border',
}

export default function Badge({ children, variant = 'gray' }) {
  return (
    <span className={`badge ${variants[variant] || variants.gray}`}>
      {children}
    </span>
  )
}
