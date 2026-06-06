"use client";

export function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-16 items-center gap-1">
      {Array.from({ length: 28 }).map((_, index) => (
        <span
          key={index}
          className="w-1 rounded-full bg-primary transition-all"
          style={{
            height: active ? `${18 + ((index * 13) % 42)}px` : "10px",
            opacity: active ? 0.9 : 0.35
          }}
        />
      ))}
    </div>
  );
}
