import React from 'react'

const Section: React.FC<React.PropsWithChildren<{className?: string}>> = ({ children, className = '' }) => {
  return (
    <section className={`relative overflow-hidden py-12 md:py-20 ${className}`}>
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,rgba(255,214,90,0.06),transparent_60%)] pointer-events-none" />
      <div className="relative">
        {children}
      </div>
    </section>
  )
}

export default Section
