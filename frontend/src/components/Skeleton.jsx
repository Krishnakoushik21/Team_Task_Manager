export function SkeletonCard({ className = '' }) {
  return <div className={`skeleton-card ${className}`} />;
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
