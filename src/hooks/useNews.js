import { useState, useEffect, useCallback, useRef } from 'react';
import { demoNews } from '../data/demoNews';

const RSS_SOURCES = [
  { id: 'itmedia', name: 'ITMEDIA', url: 'https://rss.itmedia.co.jp/rss/2.0/aitplus.xml', count: 8 },
  { id: 'impress', name: 'IMPRESS', url: 'https://www.watch.impress.co.jp/data/rss/1.0/ipw/feed.rdf', count: 8 },
  { id: 'techcrunch_jp', name: 'TECHCRUNCH JP', url: 'https://jp.techcrunch.com/feed/', count: 8 },
  { id: 'ascii', name: 'ASCII.JP', url: 'https://ascii.jp/rss.xml', count: 8 },
  { id: 'cnet_jp', name: 'CNET JAPAN', url: 'https://japan.cnet.com/rss/index.rdf', count: 8 },
];

const RSS2JSON_BASE = 'https://api.rss2json.com/v1/api.json';
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

function formatDateJST(pubDateStr) {
  if (!pubDateStr) return '';
  try {
    const d = new Date(pubDateStr);
    // Convert to JST (UTC+9)
    const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    const yyyy = jst.getUTCFullYear();
    const mm = String(jst.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(jst.getUTCDate()).padStart(2, '0');
    const hh = String(jst.getUTCHours()).padStart(2, '0');
    const min = String(jst.getUTCMinutes()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd} / ${hh}:${min} JST`;
  } catch {
    return pubDateStr;
  }
}

async function fetchSource(source) {
  const params = new URLSearchParams({
    rss_url: source.url,
    count: String(source.count || 8),
  });
  const res = await fetch(`${RSS2JSON_BASE}?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.status !== 'ok') throw new Error('RSS feed error');
  return data.items.map((item, i) => ({
    id: `${source.name}-${i}-${item.pubDate}`,
    source: source.name,
    title: item.title,
    description: item.description
      ? item.description.replace(/<[^>]*>/g, '').slice(0, 200)
      : '',
    date: formatDateJST(item.pubDate),
    url: item.link,
    pubDate: item.pubDate,
  }));
}

export function useNews() {
  const [items, setItems] = useState(demoNews);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeSource, setActiveSource] = useState('ALL');
  const timerRef = useRef(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled(
        RSS_SOURCES.map((src) => fetchSource(src))
      );
      const fetched = results
        .filter((r) => r.status === 'fulfilled')
        .flatMap((r) => r.value);

      if (fetched.length > 0) {
        // Sort by pubDate descending
        fetched.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        setItems(fetched);
      }
      // If all fail, keep existing items (demo data or previous fetch)
    } catch {
      // Keep existing items
    } finally {
      setLastUpdated(new Date());
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    timerRef.current = setInterval(fetchAll, REFRESH_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [fetchAll]);

  const refetch = useCallback(() => {
    clearInterval(timerRef.current);
    fetchAll();
    timerRef.current = setInterval(fetchAll, REFRESH_INTERVAL);
  }, [fetchAll]);

  return { items, loading, lastUpdated, refetch, activeSource, setActiveSource };
}
