interface SkeletonProps {
  className?: string
  width?: string
  height?: string
}

export function Skeleton({ className = "", width, height }: SkeletonProps) {
  const style = {
    width: width || "100%",
    height: height || "1rem",
  }

  return <div className={`skeleton ${className}`} style={style} />
}

export function SkeletonCard() {
  return (
    <div className="glass p-6 space-y-4">
      <Skeleton height="1.5rem" width="60%" />
      <Skeleton height="1rem" width="100%" />
      <Skeleton height="1rem" width="80%" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height="3rem" className="rounded-xl" />
      ))}
    </div>
  )
}
