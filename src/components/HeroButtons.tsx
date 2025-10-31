'use client';

export default function HeroButtons() {
  function scrollToId(id: string) {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const base =
    'rounded-xl bg-transparent border border-emerald-500 text-emerald-400 px-5 py-3 font-semibold transition-all duration-200 ease-out';
  const hover = 'hover:bg-emerald-500 hover:text-black';

  return (
    <div className="grid grid-cols-1 gap-3 mt-2 sm:grid-cols-2">
      <button
        type="button"
        className={`${base} ${hover}`}
        onClick={() => scrollToId('#executor-section')}
      >
        Исполнитель
      </button>
      <button
        type="button"
        className={`${base} ${hover}`}
        onClick={() => scrollToId('#business-section')}
      >
        Бизнес
      </button>
    </div>
  );
}




