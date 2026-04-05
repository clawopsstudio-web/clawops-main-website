"use client";

interface KineticMarqueeProps {
  items: string[];
  speed?: number;
  className?: string;
  separator?: string;
}

export default function KineticMarquee({
  items,
  speed = 30,
  className = "",
  separator = "◆",
}: KineticMarqueeProps) {
  const repeated = [...items, ...items];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#050510] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#050510] to-transparent z-10 pointer-events-none" />

      <div
        className="flex whitespace-nowrap"
        style={{
          animation: `marquee ${speed}s linear infinite`,
        }}
      >
        {repeated.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="text-sm md:text-base font-semibold tracking-widest uppercase text-white/70 hover:text-accent transition-colors duration-300 px-4">
              {item}
            </span>
            <span className="text-accent/50 text-xs px-2">{separator}</span>
          </span>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
