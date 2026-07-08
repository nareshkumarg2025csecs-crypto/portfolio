export default function Ticker() {
  const message = "Open to internships and full-stack opportunities — ";
  const repeatedMessage = message.repeat(2);

  return (
    <div className="w-full overflow-hidden bg-cream border-y border-darkbrown/10 py-3 relative z-10">
      <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused] text-sm uppercase tracking-widest font-mono text-darkbrown/80">
        <span className="mx-4">{repeatedMessage}</span>
        <span className="mx-4">{repeatedMessage}</span>
      </div>
    </div>
  );
}
