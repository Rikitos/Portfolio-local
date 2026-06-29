/** IMPORTS **/
import logo from '../assets/img/logo.svg'
import Button from './Button'

/** COMPONENT **/
export default function Hero({ dark }: { dark: boolean }) {
  return (
    <section className="min-h-screen flex items-center justify-center text-center px-8 bg-slate-200 dark:bg-navy-800">
      <div className="flex flex-col items-center">

        {/* Logo */}
        <img src={logo} alt="KP monogram" className="w-48 h-48 mb-8" />

        {/* Name */}
        <h1 className="font-['Palatino_Linotype',Palatino,serif] font-normal text-4xl md:text-5xl tracking-wide text-[#1a2035] dark:text-[#c0c8d8] mb-4">
          Krzysztof Pabisz
        </h1>

        {/* Divider */}
        <span className="block w-16 h-px bg-[rgba(201,168,76,0.6)] mb-4" />

        {/* Role */}
        <p className="font-['Palatino_Linotype',Palatino,serif] text-sm tracking-[0.3em] uppercase text-[#5a6480] dark:text-[#8896b0] mb-10">
          Web Developer
        </p>

        {/* CTA */}
        <Button
          href="#projects"
          variant={dark ? 'primary' : 'primary-lightV2'}
          className="font-['Palatino_Linotype',Palatino,serif] text-[0.7rem] tracking-[0.2em] uppercase px-12 py-4"
        >
          View Projects
        </Button>

      </div>
    </section>
  )
}
