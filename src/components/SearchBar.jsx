import './SearchBar.css';

export default function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <div className="search-bar-wrapper">
      <div className="search-bar">
        <span className="search-bar-icon">🔍</span>
        <input
          className="search-bar-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="キーワードで検索..."
        />
        {searchQuery && (
          <button
            className="search-bar-clear"
            onClick={() => setSearchQuery('')}
            aria-label="検索をクリア"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
