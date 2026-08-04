"use client";

import React from 'react';

export default function FanDisclaimerMarquee() {
  const items = [
    { textPt: "Esse site só é feito por fã e não tem fins lucrativos", textEn: "This website is fan-made and non-profit" },
    { textPt: "Esse site só é feito por fã e não tem fins lucrativos", textEn: "This website is fan-made and non-profit" },
    { textPt: "Esse site só é feito por fã e não tem fins lucrativos", textEn: "This website is fan-made and non-profit" },
    { textPt: "Esse site só é feito por fã e não tem fins lucrativos", textEn: "This website is fan-made and non-profit" },
  ];

  return (
    <div className="w-full bg-slate-900/85 dark:bg-slate-950/90 text-slate-300 backdrop-blur-md border-t border-slate-800/80 overflow-hidden py-1.5 z-40 select-none">
      <div className="animate-marquee flex items-center whitespace-nowrap text-xs md:text-sm font-medium tracking-wide">
        {[...items, ...items].map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 px-4">
            <span className="text-slate-200">{item.textPt}</span>
            <span className="text-[#59F7E2] font-bold">•</span>
            <span className="text-slate-400 italic">{item.textEn}</span>
            <span className="text-[#59F7E2] font-bold ml-3">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
