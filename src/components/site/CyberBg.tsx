export function CyberBg() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-cyber-radial">
      <div className="absolute inset-0 cyber-grid-bg opacity-50" />
      <div className="absolute inset-0 scanlines" />
    </div>
  );
}
