import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ArticleModal.css';

export default function ArticleModal({ article, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-panel"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-strip" />
        <div className="modal-content">
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
          <div className="modal-source">{article.source}</div>
          <h2 className="modal-title">{article.title}</h2>
          <div className="modal-meta">
            <span className="modal-date">{article.date}</span>
            <span className="modal-meta-sep">|</span>
            <span className="modal-meta-source">{article.source}</span>
          </div>
          <div className="modal-divider" />
          <p className="modal-description">{article.description}</p>
          <div className="modal-footer">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-read-btn"
            >
              元記事を読む →
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
