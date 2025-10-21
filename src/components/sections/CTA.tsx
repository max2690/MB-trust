/** @cursor NO_LAYOUT_CHANGES */
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
export default function CTA() {
  return (
    <section className="py-12 md:py-20">
      <Container>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center shadow-card">
          <h3 className="text-2xl font-semibold">Готовы ускорить бизнес?</h3>
          <p className="mt-3 text-white/80">Подключим ИИ-инструменты и воронки за считанные дни.</p>
          <div className="mt-6 flex justify-center">
            <Button>Оставить заявку</Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
