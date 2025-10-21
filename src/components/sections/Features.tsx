/** @cursor NO_LAYOUT_CHANGES */
import Container from "@/components/ui/Container";
import { Card } from "@/components/ui/card";
const items = [
  { title: "Интеграции", text: "Подключаем CRM, чаты и сервисы без боли." },
  { title: "ИИ-боты", text: "Продажи, консультации и воронки на автопилоте." },
  { title: "Автоматизация", text: "Сценарии, вебхуки, расчёты и документы." },
];
export default function Features() {
  return (
    <section className="py-12 md:py-20">
      <Container>
        <h2 className="text-3xl font-bold">Что умеет MB-TRUST</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {items.map((i) => (
            <Card key={i.title}>
              <h3 className="text-lg font-semibold">{i.title}</h3>
              <p className="mt-2 text-white/80">{i.text}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
