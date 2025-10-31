'use client';

import { useState } from 'react';
import HowItWorksModal from './HowItWorksModal';

export default function HowItWorksTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-5 py-3 font-semibold rounded-xl border border-emerald-500 text-emerald-400 bg-transparent hover:bg-emerald-500 hover:text-black transition-all duration-200 ease-out"
      >
        Как это работает?
      </button>
      <HowItWorksModal open={open} onOpenChange={setOpen} />
    </>
  );
}




