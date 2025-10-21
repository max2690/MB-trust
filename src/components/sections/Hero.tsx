/** @cursor NO_LAYOUT_CHANGES */
import Image from "next/image";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      <div className="absolute inset-0 opacity-60 bg-[radial-gradient(ellipse_at_top,rgba(255,214,90,0.08),transparent_60%)] pointer-events-none" />
      <Container>
        <div className="relative grid items-center gap-12 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-3">
              <Image src="/logo/mbtrust.svg" alt="MB-TRUST" width={40} height={40} priority />
              <span className="text-xl font-semibold text-mb-gold tracking-wide">MB-TRUST</span>
            </div>
            <h1 className="mt-6 text-4xl md:text-6xl font-bold leading-tight">Платформа, где ИИ и человек работают в тандеме</h1>
            <p className="mt-5 text-lg text-white/80">Быстрые интеграции, боты и автоматизация. Красиво упаковано.</p>
            <div className="mt-8 flex gap-4">
              <Button>Попробовать</Button>
              <Button variant="outline">Смотреть демо</Button>
            </div>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-card">
            <video className="h-full w-full object-cover" src="/media/hero.mp4" poster="/media/hero_poster.jpg" autoPlay muted loop playsInline preload="none" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
          </div>
        </div>
      </Container>
    </section>
  );
}
