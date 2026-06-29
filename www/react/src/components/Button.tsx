/** TYPES **/
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  variant?: 'primary' | 'primary-light' | 'primary-lightV2' | 'outline' | 'outline-light'
  className?: string
}

/**
 * Variants:
 *  primary       — dark navy bg, silver text, gold border  (dark mode / hero)
 *  primary-light — slate bg, dark text, gold border        (light mode)
 *  outline       — transparent bg, silver text, gold border (dark mode)
 *  outline-light — transparent bg, dark text, gold border  (light mode)
 */
export default function Button({ children, onClick, href, variant = 'primary', className = '' }: ButtonProps) {
  const base = `rounded border border-[rgba(201,168,76,0.4)] hover:border-[rgba(201,168,76,0.8)] hover:text-[#C9A84C] transition-colors cursor-pointer inline-block no-underline`

  const variants = {
    'primary':          'bg-navy-700 hover:bg-navy-900 text-[#c0c8d8]',
    'primary-light':    'bg-slate-200 hover:bg-slate-100 text-[#1a2035]',
    'primary-lightV2':  'bg-slate-300 hover:bg-slate-100 text-[#1a2035]',
    'outline':          'bg-transparent text-[#c0c8d8]',
    'outline-light':    'bg-transparent text-[#1a2035]',
  }

  const classes = `${base} ${variants[variant]} ${className}`

  if (href) return <a href={href} className={classes}>{children}</a>
  return <button onClick={onClick} className={classes}>{children}</button>
}
