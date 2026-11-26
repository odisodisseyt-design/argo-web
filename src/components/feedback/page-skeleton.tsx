export function PageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 lg:px-8" role="status" aria-label="Загрузка">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="h-48 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  )
}
