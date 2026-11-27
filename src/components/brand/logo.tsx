import { cn } from '@/lib/utils'

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <img src={`${import.meta.env.BASE_URL}icons/argo-512.png`} alt="" width={32} height={32} className="size-8 rounded-md" />
      {!compact && (
        <span className="font-display text-lg font-extrabold tracking-[0.28em] text-foreground">ARGO</span>
      )}
    </span>
  )
}
