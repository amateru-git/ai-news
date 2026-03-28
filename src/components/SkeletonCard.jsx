import './SkeletonCard.css';

export default function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-strip" />
      <div className="skeleton-body">
        <div className="skeleton-meta">
          <div className="skeleton-line skeleton-source" />
          <div className="skeleton-line skeleton-date" />
        </div>
        <div className="skeleton-line skeleton-title-1" />
        <div className="skeleton-line skeleton-title-2" />
        <div className="skeleton-line skeleton-desc" />
      </div>
    </div>
  );
}
