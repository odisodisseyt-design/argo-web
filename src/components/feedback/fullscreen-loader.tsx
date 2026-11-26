export function FullscreenLoader({ label = 'Загрузка' }: { label?: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4" role="status" aria-live="polite">
      <div className="relative size-12" aria-hidden>
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <span className="absolute inset-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
      <p className="hud-label">{label}</p>
    </div>
  )
}
