import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Nav.css';

function formatJST(date) {
  if (!date) return '—';
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const h = String(jst.getUTCHours()).padStart(2, '0');
  const m = String(jst.getUTCMinutes()).padStart(2, '0');
  return `UPDATED ${h}:${m} JST`;
}

export default function Nav({ lastUpdated, onRefresh }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={`nav${scrolled ? ' nav--scrolled' : ''}`}
      animate={{ height: scrolled ? 56 : 64 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
    >
      <div className="nav-inner">
        <span className="nav-brand">
          <span className="nav-dot" />
          <span className="nav-title">AI INTELLIGENCE FEED</span>
          <span className="nav-brand-ja">AIニュース</span>
        </span>
        <div className="nav-right">
          <span className="nav-updated">{formatJST(lastUpdated)}</span>
          <button
            className="nav-refresh"
            onClick={onRefresh}
            aria-label="Refresh feed"
            title="Refresh"
          >
            ⟳
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
