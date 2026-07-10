export function HeroBackground() {
  return (
    <>
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,rgba(120,119,198,.12),transparent_45%)]" />

      <div className="absolute inset-x-0 top-0 -z-20 h-[700px] bg-gradient-to-b from-background via-background/40 to-transparent" />
    </>
  )
}