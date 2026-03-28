import { motion } from 'framer-motion';
import './NewsCard.css';

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

export default function NewsCard({ item, onClick }) {
  return (
    <motion.article
      className="news-card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{
        scale: 1.02,
        y: -4,
        boxShadow: '0 8px 24px rgba(15,15,20,0.12), 0 24px 48px rgba(15,15,20,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
        transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] },
      }}
      whileTap={{ scale: 0.98 }}
      layout
      onClick={onClick}
    >
      <div className="card-strip" />
      <div className="news-card-meta">
        <span className="news-card-source">{item.source}</span>
        <span className="news-card-date">{item.date}</span>
      </div>
      <span className="news-card-title">
        {item.title}
      </span>
      {item.description && (
        <p className="news-card-description">{item.description}</p>
      )}
      <div className="news-card-footer">
        <span className="news-card-arrow">→</span>
      </div>
    </motion.article>
  );
}
