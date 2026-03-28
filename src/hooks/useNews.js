import { useState, useEffect, useCallback, useRef } from 'react';
import { demoNews } from '../data/demoNews';

const RSS_SOURCES = [
  { id: 'cnet_jp', name: 'CNET Japan', url: 'https://japan.cnet.com/rss/index.rdf' },
  { id: 'ascii', name: 'ASCII.jp', url: 'https://ascii.jp/rss.xml' },
  { id: 'impress', name: 'Impress', url: 'https://www.watch.impress.co.jp/data/rss/1.0/ipw/feed.rdf' },
  { id: 'techcrunch', name: 'TechCrunch', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
  { id: 'venturebeat', name: 'VentureBeat', url: 'https://venturebeat.com/feed/' },
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

// Detect if text is likely English (simple heuristic)
function isEnglish(text) {
  if (!text) return false;
  // Count ASCII letters vs total chars
  const ascii = (text.match(/[a-zA-Z]/g) || []).length;
  return ascii / text.length > 0.5;
}

// Translate batch of texts via our serverless function
async function translateToJapanese(texts) {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.translations || null;
  } catch {
    return null;
  }
}

async function fetchSource(source) {
  const apiUrl = `${RSS2JSON_BASE}?rss_url=${encodeURIComponent(source.url)}`;
  const res = await fetch(apiUrl);
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

        // Translate English titles and descriptions
        const textsToTranslate = [];
        const translationMap = []; // { i, field }

        fetched.forEach((item, i) => {
          if (isEnglish(item.title)) {
            translationMap.push({ i, field: 'title' });
            textsToTranslate.push(item.title);
          }
          if (isEnglish(item.description)) {
            translationMap.push({ i, field: 'description' });
            textsToTranslate.push(item.description);
          }
        });

        if (textsToTranslate.length > 0) {
          const translated = await translateToJapanese(textsToTranslate);
          if (translated) {
            translated.forEach((text, ti) => {
              const { i, field } = translationMap[ti];
              fetched[i] = { ...fetched[i], [field]: text };
            });
          }
        }

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
