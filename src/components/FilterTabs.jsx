import { motion } from 'framer-motion';
import './FilterTabs.css';

export default function FilterTabs({ sources, counts, active, onSelect }) {
  return (
    <div className="filter-tabs-wrapper">
    <div className="filter-tabs" role="tablist" aria-label="Filter by source">
      {sources.map((source) => {
        const isActive = source === active;
        return (
          <button
            key={source}
            role="tab"
            aria-selected={isActive}
            className={`filter-tab${isActive ? ' filter-tab--active' : ''}`}
            onClick={() => onSelect(source)}
          >
            {isActive && (
              <motion.span
                className="filter-tab-bg"
                layoutId="tab-indicator"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
            <span className="filter-tab-label">{source}</span>
            <span className="filter-tab-count">{counts[source] ?? 0}</span>
          </button>
        );
      })}
    </div>
    </div>
  );
}
