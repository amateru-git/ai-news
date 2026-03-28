import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import Nav from './components/Nav';
import FilterTabs from './components/FilterTabs';
import SearchBar from './components/SearchBar';
import NewsCard from './components/NewsCard';
import SkeletonCard from './components/SkeletonCard';
import ArticleModal from './components/ArticleModal';
import { useNews } from './hooks/useNews';

const SKELETON_COUNT = 6;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

function App() {
  const { items, loading, lastUpdated, refetch, activeSource, setActiveSource } = useNews();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Derive unique sources from items
  const sources = ['ALL', ...Array.from(new Set(items.map((item) => item.source)))];

  // Count per source
  const countBySource = items.reduce((acc, item) => {
    acc[item.source] = (acc[item.source] || 0) + 1;
    return acc;
  }, {});
  countBySource['ALL'] = items.length;

  const filtered = items
    .filter((item) => activeSource === 'ALL' || item.source === activeSource)
    .filter((item) => !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="app">
      <Nav lastUpdated={lastUpdated} onRefresh={refetch} />

      <div className="app-content">
        <div className="page-header">
          <h1 className="page-header-title">AI INTELLIGENCE</h1>
          <p className="page-header-subtitle">テクノロジーの今を、精密に。</p>
        </div>

        <FilterTabs
          sources={sources}
          counts={countBySource}
          active={activeSource}
          onSelect={setActiveSource}
        />

        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <motion.div
          className="news-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={activeSource}
        >
          {loading ? (
            Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              {searchQuery
                ? `「${searchQuery}」に一致する記事はありません`
                : 'NO RESULTS'}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.map((item) => (
                <NewsCard
                  key={item.id}
                  item={item}
                  onClick={() => setSelectedArticle(item)}
                />
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      </div>

      <div className="coordinates">N 35.68 / E 139.69</div>

      <AnimatePresence>
        {selectedArticle && (
          <ArticleModal
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
