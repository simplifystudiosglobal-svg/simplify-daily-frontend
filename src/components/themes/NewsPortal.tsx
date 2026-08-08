import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Calendar, Eye, Sparkles, AlertCircle, TrendingUp, CheckCircle, RefreshCw, FileText, Globe, Loader2, ArrowRight, ArrowLeft, Edit3, Facebook, Twitter, Linkedin, Youtube, Instagram, List, Grid, ArrowUpRight, Mail, Hash, Flame, Shield, Lock, Unlock, Key, X } from 'lucide-react';
import { seedArticles } from '../../data/articles';
import { apiUrl } from '../../lib/api';

const CATEGORY_FALLBACK_IMAGES: Record<string, string[]> = {
  POLITICS: [
    "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1575320181282-9afab399332c?auto=format&fit=crop&w=1200&q=80"
  ],
  "WORLD NEWS": [
    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80"
  ],
  "US NEWS": [
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
  ],
  BUSINESS: [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
  ],
  TECH: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"
  ],
  ENTERTAINMENT: [
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=1200&q=80",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/HollywoodSign.jpg/1280px-HollywoodSign.jpg"
  ],
  SPORTS: [
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80"
  ],
  HEALTH: [
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80"
  ],
  CULTURE: [
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80"
  ],
  JOBS: [
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80"
  ],
  DEFAULT: [
    "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80"
  ]
};

export function getSmartFallbackImage(category?: string, key?: string): string {
  const catKey = (category || '').toUpperCase().trim();
  const list = CATEGORY_FALLBACK_IMAGES[catKey] || CATEGORY_FALLBACK_IMAGES['DEFAULT'];
  
  let hash = 0;
  const seed = (key || category || 'news').toString();
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % list.length;
  return list[index];
}

const FALLBACK_NEWS_IMAGE = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80";

// Catchy dynamic thumbnail badge renderer
const renderCatchyThumbnail = (article: any, customClass: string = "w-full h-full object-cover", showCategory: boolean = true, showBadge: boolean = true) => {
  const style = article.thumbnailStyle || 'standard';
  
  // Custom badges and overlays based on design system
  let badgeEl = null;
  let overlayStyles = "";
  let containerStyles = "relative overflow-hidden w-full h-full group rounded-none";

  if (style === 'breaking') {
    badgeEl = (
      <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#68A108] text-white text-[8px] font-black uppercase tracking-[0.12em] px-2 py-1 shadow-lg select-none z-10 border border-red-500/10 animate-pulse">
        <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping shrink-0" />
        <span>BREAKING</span>
      </div>
    );
    overlayStyles = "absolute inset-0 bg-gradient-to-t from-black/75 via-red-950/10 to-transparent mix-blend-multiply group-hover:bg-red-950/15 transition-all duration-500";
    containerStyles += " border border-[#68A108]/40";
  } else if (style === 'viral') {
    badgeEl = (
      <div className="absolute top-2 left-2 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-purple-600 text-white text-[8px] font-black uppercase tracking-[0.12em] px-2 py-1 shadow-lg select-none z-10">
        <Sparkles size={9} className="text-amber-200 animate-spin" />
        <span>TRENDING</span>
      </div>
    );
    overlayStyles = "absolute inset-0 bg-gradient-to-t from-black/75 via-purple-950/10 to-transparent group-hover:bg-purple-950/15 transition-all duration-500";
    containerStyles += " border border-purple-500/30";
  } else if (style === 'neon') {
    badgeEl = (
      <div className="absolute top-2 left-2 flex items-center gap-1 bg-slate-950 text-emerald-400 text-[7px] font-mono font-bold tracking-[0.12em] px-2 py-1 shadow-lg select-none z-10 border border-emerald-500/40 animate-pulse">
        <div className="w-1 h-1 bg-emerald-400 rounded-full shrink-0" />
        <span>🤖 AI COGNITIVE</span>
      </div>
    );
    overlayStyles = "absolute inset-0 bg-gradient-to-t from-black/75 via-emerald-950/5 to-transparent group-hover:bg-emerald-950/10 transition-all duration-500";
    containerStyles += " border border-emerald-500/30";
  } else if (style === 'editorial') {
    badgeEl = (
      <div className="absolute top-2 left-2 flex items-center gap-1 bg-slate-900 border-l-2 border-amber-400 text-white text-[8px] font-semibold uppercase tracking-[0.12em] px-2 py-1 shadow-lg select-none z-10">
        <span>EXCLUSIVE</span>
      </div>
    );
    overlayStyles = "absolute inset-0 bg-gradient-to-t from-black/75 via-slate-900/10 to-transparent group-hover:bg-slate-900/15 transition-all duration-500";
    containerStyles += " border border-slate-300/20";
  }

  return (
    <div className={containerStyles}>
      <img
        src={article.image || FALLBACK_NEWS_IMAGE}
        alt={article.title}
        loading="lazy"
        decoding="async"
        className={`${customClass} group-hover:scale-105 transition-transform duration-1000`}
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.src = FALLBACK_NEWS_IMAGE;
        }}
      />
      {overlayStyles && <div className={overlayStyles} />}
      {showBadge && badgeEl}
      {showCategory && article.category && (
        <span className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-sm text-white border border-[#68A108]/50 text-[8px] font-black uppercase px-2 py-0.5 font-mono tracking-wider z-10">
          {article.category}
        </span>
      )}
    </div>
  );
};

type StaticPage = 'about' | 'contact' | 'privacy' | 'terms';

export default function NewsPortal({ onNavigateScholarships, onNavigateJobs, onNavigateStatic, onNavigateWorldNews, onNavigateEntertainment }: { onNavigateScholarships?: () => void; onNavigateJobs?: () => void; onNavigateStatic?: (page: StaticPage) => void; onNavigateWorldNews?: () => void; onNavigateEntertainment?: () => void } = {}) {
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const ARTICLES_PER_PAGE = 6;

  // New state variables for enhanced CoverNews and ScholarshipAir layout
  const [tickerIndex, setTickerIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [selectedStyleFilter, setSelectedStyleFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'views' | 'alpha'>('newest');

  // Admin authentication state (Server-authenticated token security)
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('simplify_admin_token');
    }
    return null;
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isAuthChecking, setIsAuthChecking] = useState(false);

  // Validate existing server token on mount
  useEffect(() => {
    if (!adminToken) {
      setIsAdmin(false);
      return;
    }
    const checkToken = async () => {
      try {
        const res = await fetch(apiUrl('/api/admin/verify'), {
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await res.json();
        if (data.success && data.authenticated) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          setAdminToken(null);
          localStorage.removeItem('simplify_admin_token');
        }
      } catch (err) {
        setIsAdmin(false);
      }
    };
    checkToken();
  }, [adminToken]);

  // Secret keyboard shortcut (Ctrl+Shift+A or Cmd+Shift+A) & URL parameter detector
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check URL parameter ?admin=login
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'login' || urlParams.get('admin') === 'auth') {
      setShowAdminModal(true);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setShowAdminModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthChecking(true);
    setAdminError('');

    try {
      const res = await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: adminPasscode })
      });
      const data = await res.json();

      if (data.success && data.token) {
        setAdminToken(data.token);
        localStorage.setItem('simplify_admin_token', data.token);
        setIsAdmin(true);
        setShowAdminModal(false);
        setAdminPasscode('');
        setSyncToast('🛡️ Server Admin Authenticated');
        setTimeout(() => setSyncToast(null), 3500);
      } else {
        setAdminError(data.error || 'Invalid admin passcode.');
      }
    } catch (err) {
      setAdminError('Server authentication request failed.');
    } finally {
      setIsAuthChecking(false);
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminToken(null);
    localStorage.removeItem('simplify_admin_token');
    setSyncToast('Logged out of Admin Desk');
    setTimeout(() => setSyncToast(null), 2500);
  };

  // Auto-News Live Sync state
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [autoSyncFreq, setAutoSyncFreq] = useState<'off' | '1m' | '5m'>('off');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const [allArticles, setAllArticles] = useState<any[]>(seedArticles);

  const triggerAutoNews = async (category: string = 'All') => {
    if (!adminToken) {
      setSyncToast("⚠️ Admin authentication required to sync news");
      setTimeout(() => setSyncToast(null), 4000);
      return;
    }
    setIsAutoSyncing(true);
    try {
      const res = await fetch(apiUrl(`/api/auto-news?category=${encodeURIComponent(category)}`), {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.articles)) {
        setAllArticles((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const FALLBACK_IMG = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";
          const newItems = data.articles
            .filter((a: any) => !existingIds.has(a.id))
            .map((a: any) => ({
              ...a,
              image: a.image || FALLBACK_IMG,
              thumbnailStyle: a.thumbnailStyle || 'breaking'
            }));
          if (newItems.length > 0) {
            setSyncToast(`⚡ Loaded ${newItems.length} fresh breaking news updates!`);
            setTimeout(() => setSyncToast(null), 5000);
            return [...newItems, ...prev];
          } else {
            setSyncToast(`Feed up to date`);
            setTimeout(() => setSyncToast(null), 3000);
            return prev;
          }
        });
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else if (res.status === 401) {
        setIsAdmin(false);
        setAdminToken(null);
        localStorage.removeItem('simplify_admin_token');
        setSyncToast("Session expired. Please log in again.");
        setTimeout(() => setSyncToast(null), 4000);
      }
    } catch (err) {
      console.error("Auto news sync error:", err);
      setSyncToast("Unable to reach live news feed");
      setTimeout(() => setSyncToast(null), 3000);
    } finally {
      setIsAutoSyncing(false);
    }
  };

  useEffect(() => {
    if (autoSyncFreq === 'off') return;
    const intervalMs = autoSyncFreq === '1m' ? 60000 : 300000;
    const timer = setInterval(() => {
      triggerAutoNews('All');
    }, intervalMs);
    return () => clearInterval(timer);
  }, [autoSyncFreq]);

  // Load and save custom articles from localStorage so they remain persistent
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('simplify_news_articles');
        if (saved) {
          const customArticles = JSON.parse(saved);
          setAllArticles((prev) => {
            const defaultIds = new Set(seedArticles.map((a) => a.id));

            const isMarcusVanceThunderArticle = (article: any) => {
              if (!article) return false;
              const titleLower = article.title?.toLowerCase() || '';
              const authorLower = article.author?.toLowerCase() || '';
              return (
                titleLower.includes('thunder') && 
                titleLower.includes('spurs') && 
                (authorLower.includes('marcus') || authorLower.includes('vance') || article.views === '1.2k')
              );
            };

            const customOnly = customArticles.filter((article: any) => 
              article && article.id && !defaultIds.has(article.id) && !isMarcusVanceThunderArticle(article)
            );
            
            const existingFiltered = prev.filter(p => !isMarcusVanceThunderArticle(p));
            const existingIds = new Set(existingFiltered.map(p => p.id));
            const toAdd = customOnly.filter((article: any) => !existingIds.has(article.id));
            return [...toAdd, ...existingFiltered];
          });
        } else {
          // If no localStorage, still filter initial state just in case
          setAllArticles((prev) => {
            const isMarcusVanceThunderArticle = (article: any) => {
              if (!article) return false;
              const titleLower = article.title?.toLowerCase() || '';
              const authorLower = article.author?.toLowerCase() || '';
              return (
                titleLower.includes('thunder') && 
                titleLower.includes('spurs') && 
                (authorLower.includes('marcus') || authorLower.includes('vance') || article.views === '1.2k')
              );
            };
            return prev.filter(p => !isMarcusVanceThunderArticle(p));
          });
        }
      } catch (e) {
        console.error("Failed to restore custom articles:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && allArticles.length > 0) {
      try {
        const defaultIds = new Set(seedArticles.map((a) => a.id));
        const isMarcusVanceThunderArticle = (article: any) => {
          if (!article) return false;
          const titleLower = article.title?.toLowerCase() || '';
          const authorLower = article.author?.toLowerCase() || '';
          return (
            titleLower.includes('thunder') && 
            titleLower.includes('spurs') && 
            (authorLower.includes('marcus') || authorLower.includes('vance') || article.views === '1.2k')
          );
        };
        const customToSave = allArticles.filter((article) => 
          article && article.id && !defaultIds.has(article.id) && !isMarcusVanceThunderArticle(article)
        );
        localStorage.setItem('simplify_news_articles', JSON.stringify(customToSave));
      } catch (e) {
        console.error("Failed to persist custom articles:", e);
      }
    }
  }, [allArticles]);

  const sortedAllArticles = useMemo(() => {
    return [...allArticles].sort((a, b) => {
      const timeA = new Date(a.date).getTime() || 0;
      const timeB = new Date(b.date).getTime() || 0;
      if (timeB !== timeA) {
        return timeB - timeA;
      }
      return allArticles.indexOf(a) - allArticles.indexOf(b);
    });
  }, [allArticles]);

  // Single source of truth for which article goes where on the homepage hero grid, so the
  // same story never appears twice across Main Story / Trending / Big Story / Quick
  // Dispatches / Featured Story — each section claims articles in priority order and the
  // next section only picks from what's left.
  const homepageSections = useMemo(() => {
    const parseViews = (v: any) => {
      const s = String(v || '').toLowerCase();
      const n = parseFloat(s);
      if (isNaN(n)) return 0;
      if (s.endsWith('m')) return n * 1000000;
      if (s.endsWith('k')) return n * 1000;
      return n;
    };

    const used = new Set<string>();
    const claim = (article: any) => {
      if (article) used.add(String(article.id));
      return article;
    };

    const mainStory = claim(sortedAllArticles[0]) || null;

    const trendingStories = [...allArticles]
      .sort((a, b) => parseViews(b.views) - parseViews(a.views))
      .filter((a) => !used.has(String(a.id)))
      .slice(0, 3);
    trendingStories.forEach(claim);

    const remainingAfterTrending = sortedAllArticles.filter((a) => !used.has(String(a.id)));

    const bigStory = claim(remainingAfterTrending[0]) || null;
    const remainingAfterBigStory = remainingAfterTrending.slice(1);

    const quickDispatches = remainingAfterBigStory.slice(0, 8);
    quickDispatches.forEach(claim);

    const featuredStories = remainingAfterBigStory.slice(8, 13);
    featuredStories.forEach(claim);

    return { mainStory, trendingStories, bigStory, quickDispatches, featuredStories };
  }, [sortedAllArticles, allArticles]);

  // Deep-link support: reflect the open article in the URL so it can be shared/bookmarked,
  // and restore it on load or when the user navigates with back/forward. Note: the
  // homepage's "Quick Tags" filter pills (further down) intentionally only filter this
  // page's own article grid locally and do not navigate away or touch the URL — that's
  // separate from WORLD NEWS/ENTERTAINMENT in the top nav, which are real dedicated pages
  // (see onNavigateWorldNews/onNavigateEntertainment) and must not be re-claimed here.
  useEffect(() => {
    const articleFromPath = (path: string) => {
      const match = path.match(/^\/article\/(.+)$/);
      if (!match) return null;
      const id = decodeURIComponent(match[1]);
      return allArticles.find((a) => String(a.id) === id) || null;
    };

    const initialArticle = articleFromPath(window.location.pathname);
    if (initialArticle) setSelectedArticle(initialArticle);

    const onPopState = () => {
      setSelectedArticle(articleFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const targetPath = selectedArticle ? `/article/${encodeURIComponent(String(selectedArticle.id))}` : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  }, [selectedArticle]);

  const filteredArticles = useMemo(() => {
    let result = sortedAllArticles.filter(article => {
      // 1. Text Search query
      const matchesSearch = !searchQuery.trim() || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.meta?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Category Filter
      const matchesCategory = selectedCategoryFilter === 'ALL' || 
        article.category.toUpperCase() === selectedCategoryFilter.toUpperCase();

      // 3. Style/Theme Filter
      const styleMap: Record<string, string> = {
        'BREAKING': 'breaking',
        'TRENDING': 'viral',
        'AI_COGNITIVE': 'neon',
        'EXCLUSIVE': 'editorial',
        'STANDARD': 'standard'
      };
      const targetStyle = styleMap[selectedStyleFilter];
      const matchesStyle = selectedStyleFilter === 'ALL' || (article.thumbnailStyle || 'standard') === targetStyle;

      return matchesSearch && matchesCategory && matchesStyle;
    });

    // 4. Sorting
    if (sortBy === 'views') {
      const parseViews = (viewsStr: any) => {
        if (!viewsStr) return 0;
        const s = String(viewsStr).toLowerCase().trim();
        const num = parseFloat(s);
        if (isNaN(num)) return 0;
        if (s.endsWith('k')) return num * 1000;
        if (s.endsWith('m')) return num * 1000000;
        return num;
      };
      result.sort((a, b) => parseViews(b.views) - parseViews(a.views));
    } else if (sortBy === 'alpha') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [sortedAllArticles, searchQuery, selectedCategoryFilter, selectedStyleFilter, sortBy]);

  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const currentArticles = filteredArticles.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE);

  // Popular Topics: most-used tags across all articles, for quick discovery.
  const popularTags = useMemo(() => {
    const counts = new Map<string, number>();
    allArticles.forEach((article: any) => {
      (article.tags || []).forEach((tag: string) => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 14)
      .map(([tag]) => tag);
  }, [allArticles]);

  const directoryRef = useRef<HTMLDivElement | null>(null);
  const handleTagClick = (tag: string) => {
    setSelectedCategoryFilter('ALL');
    setSearchQuery(tag);
    setCurrentPage(1);
    directoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Newsletter signup — UI-only for this demo (no backend to persist to).
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setNewsletterSubmitted(true);
  };

  const navItems = [
    { name: 'HOME', active: !selectedArticle && selectedCategoryFilter === 'ALL', onClick: () => { setSelectedArticle(null); setSelectedCategoryFilter('ALL'); setCurrentPage(1); } },
    { name: 'WORLD NEWS', active: false, onClick: () => onNavigateWorldNews?.() },
    { name: 'ENTERTAINMENT', active: false, onClick: () => onNavigateEntertainment?.() },
    { name: 'JOBS', active: false, onClick: () => onNavigateJobs?.() },
    { name: 'SCHOLARSHIPS', active: false, onClick: () => onNavigateScholarships?.() },
  ];

  const SingleArticleView = ({ article }: { article: any }) => {
    // Real photo credit derived from the actual image host, since these are sourced
    // real photos (Wikimedia Commons, NASA, Unsplash) rather than staff photography.
    const photoCredit = (() => {
      const src: string = article.image || '';
      if (src.includes('wikimedia.org')) return 'Photo: Wikimedia Commons';
      if (src.includes('nasa.gov')) return 'Photo: NASA';
      if (src.includes('unsplash.com')) return 'Photo: Unsplash';
      return 'Photo: Simplify Feed';
    })();

    return (
      <motion.div 
        key="article-view"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        className="w-full bg-white text-slate-900 py-4"
      >
        <div className="w-full max-w-[1920px] mx-auto px-4 lg:px-6 xl:px-8">
          
          {/* Prominent Back button - strictly left-aligned at the top of the article view */}
          <div className="mb-6 pt-2 text-left flex justify-start items-center">
            <button 
              onClick={() => { setSelectedArticle(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="group inline-flex items-center gap-3.5 px-6 py-3 bg-[#68A108] hover:bg-[#528005] active:scale-95 text-white font-black text-sm tracking-wider rounded-full shadow-lg hover:shadow-xl hover:shadow-[#68A108]/30 transform hover:-translate-x-1.5 transition-all duration-300 border-2 border-white/40 cursor-pointer ring-4 ring-[#68A108]/20"
              title="Back to all news articles"
            >
              <div className="w-8 h-8 rounded-full bg-white text-[#68A108] flex items-center justify-center group-hover:bg-slate-100 group-hover:scale-110 transition-all shadow-inner shrink-0">
                <ArrowLeft size={20} className="stroke-[3]" />
              </div>
              <span className="font-sans uppercase text-xs tracking-widest font-black">← Back to News Feed</span>
            </button>
          </div>

          {/* Main article section: Side Advertisement bars placed beneath the Back button row */}
          <div className="flex justify-between items-start gap-8 relative">
            
            {/* Left Skyscraper Advertisement - beneath back button */}
            <div className="hidden xl:flex sticky top-24 w-[160px] h-[600px] bg-[#f2f2f2] border border-slate-200/40 rounded-none items-center justify-center select-none shadow-sm shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <span className="text-[12px] font-medium tracking-[0.2em] text-[#8c8c8c]/80 uppercase [writing-mode:vertical-lr] rotate-180">
                  Advertisement
                </span>
              </div>
              <div className="absolute inset-x-0 top-0 h-1.5 bg-[#68A108]/80" />
              <div className="absolute inset-x-0 bottom-0 h-8 text-[9px] font-mono text-center text-slate-400 font-bold tracking-widest pb-3">160x600</div>
            </div>

            <div id="cnn-style-article-container" className="max-w-[1350px] w-full px-2 md:px-6 font-sans flex-1">

            {/* 1. Category label */}
            <span className="text-xs md:text-sm font-extrabold uppercase tracking-wider block mb-2 text-[#68A108]">
              {article.category}
            </span>

            {/* 2. Headline - Large, bold, precise desktop/mobile sizing, tight line-height */}
            <h1 className="text-[30px] md:text-[46px] font-bold tracking-tight text-[#0f172a] leading-[1.08] mb-4">
              {article.title}
            </h1>

            {/* 3. Short summary/deck - normal weight, muted dark gray, 18px-22px */}
            <p className="text-[18px] md:text-[20px] text-slate-500 font-normal leading-relaxed mb-6">
              {article.meta}
            </p>

            {/* 4. Byline and 5. Published/updated date */}
            <div className="border-t border-slate-200 pt-4 pb-6 font-sans text-[13px] md:text-[14px]">
              <div className="flex flex-col gap-0.5 text-slate-500">
                <span className="font-bold text-slate-800">
                  By {article.author}, Simplify Feed
                </span>
                <span>
                  Published {article.date}
                </span>
              </div>
            </div>

            {/* 6. Hero image - directly below metadata, full article width, square/flat edges */}
            <div className="w-full mb-2 overflow-hidden bg-slate-100 rounded-none border border-slate-100">
              <img 
                src={article.image || FALLBACK_NEWS_IMAGE} 
                alt={article.title} 
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-cover block rounded-none"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_NEWS_IMAGE;
                }}
              />
            </div>

            {/* 7. Photo credit - immediately below image in small gray text */}
            <p className="text-xs text-slate-500 leading-normal mb-8">
              {photoCredit}
            </p>

            {/* 8. Body Content */}
            <div 
              className="article-body-content prose prose-sans max-w-none text-slate-900 mb-12" 
              dangerouslySetInnerHTML={{ __html: article.content || '<p>Content coming soon...</p>' }} 
            />

            {article.tags && (
              <div className="pt-8 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase mb-4 text-slate-400 tracking-wider">Story Tags:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {article.tags.map((tag: string) => (
                    <span 
                      key={tag} 
                      className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 px-3 py-1.5 transition-colors cursor-pointer"
                    >
                      #{tag.replace(/\s+/g, '')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Read Next / More from Simplify Feed section */}
            <div className="mt-16 pt-10 border-t-4 border-[#68A108]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 font-sans">
                  Recommended For You
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#68A108] font-mono bg-emerald-50 px-2 py-0.5 animate-pulse">
                  Live Feed Stream
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-50 p-6 border border-slate-200/50">
                {allArticles
                  .filter((item) => item.id !== article.id)
                  .slice(0, 4)
                  .map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => {
                        setSelectedArticle(rec);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="group bg-white border border-slate-200/70 hover:border-slate-300 hover:shadow-md transition-all duration-300 cursor-pointer rounded-lg overflow-hidden"
                    >
                      <div className="aspect-[16/10] overflow-hidden relative bg-white border-b border-slate-100">
                        {renderCatchyThumbnail(rec, "w-full h-full object-cover group-hover:scale-105 transition-transform duration-700", false)}
                        <span className="absolute bottom-2 left-2 bg-[#68A108] text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md select-none z-10">
                          {rec.category || "GENERAL"}
                        </span>
                      </div>
                      <div className="p-4">
                        <h4 className="text-[14px] font-black text-slate-950 group-hover:text-[#68A108] transition-colors leading-snug line-clamp-2">
                          {rec.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 mt-2 font-mono block">{rec.date}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Skyscraper Advertisement - styled exactly like the user's placeholder screenshot */}
          <div className="hidden xl:flex sticky top-24 w-[160px] h-[600px] bg-[#f2f2f2] border border-slate-200/40 rounded-none items-center justify-center select-none shadow-sm shrink-0 mt-6 relative overflow-hidden">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <span className="text-[12px] font-medium tracking-[0.2em] text-[#8c8c8c]/80 uppercase [writing-mode:vertical-lr] rotate-180">
                Advertisement
              </span>
            </div>
            {/* Visual clean details matching a generic news portal layout */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-[#68A108]/80" />
            <div className="absolute inset-x-0 bottom-0 h-8 text-[9px] font-mono text-center text-slate-400 font-bold tracking-widest pb-3">160x600</div>
          </div>

        </div>
      </div>
    </motion.div>
  );
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] text-[#222] font-sans selection:bg-[#68A108] selection:text-white transition-colors duration-500">
      {/* Top Bar (CoverNews Layout) */}
      <div className="bg-[#111] text-slate-300 text-[11px] py-2 border-b border-white/5 border-t-2 border-[#68A108] font-medium select-none">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Admin Desk Access Toggle - Visible ONLY when authenticated */}
            {isAdmin && (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded animate-fadeIn">
                <span className="bg-[#68A108] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                  <Shield size={10} /> ADMIN ACTIVE
                </span>
                <button
                  onClick={handleAdminLogout}
                  className="text-[10px] text-slate-400 hover:text-white underline font-mono cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Adjacent colored social boxes */}
            <div className="flex items-center select-none">
              <a href="#" className="w-7 h-7 bg-[#3a75c4] flex items-center justify-center hover:opacity-90 transition-all text-white">
                <Facebook size={11} className="fill-current" />
              </a>
              <a href="#" className="w-7 h-7 bg-[#3b5998] flex items-center justify-center hover:opacity-90 transition-all text-white">
                <Facebook size={11} className="fill-current" />
              </a>
              <a href="#" className="w-7 h-7 bg-[#00aced] flex items-center justify-center hover:opacity-90 transition-all text-white">
                <Twitter size={11} className="fill-current" />
              </a>
              <a href="#" className="w-7 h-7 bg-[#0077b5] flex items-center justify-center hover:opacity-90 transition-all text-white">
                <Linkedin size={11} className="fill-current" />
              </a>
              <a href="#" className="w-7 h-7 bg-[#e52d27] flex items-center justify-center hover:opacity-90 transition-all text-white">
                <Youtube size={11} className="fill-current" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Header with CoverNews Carbon fiber style background */}
      <header className="bg-neutral-950 border-b border-neutral-900 relative overflow-hidden py-8" style={{ backgroundImage: 'radial-gradient(#1e293b 1.2px, transparent 1.2px)', backgroundColor: '#090d16', backgroundSize: '16px 16px' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-neutral-950/40 to-neutral-950/80 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 flex justify-start items-center relative z-10">
          <div className="flex flex-col items-start text-left select-none">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center cursor-pointer text-white hover:opacity-95 transition-opacity animate-fadeIn" onClick={() => { setSelectedArticle(null); setSelectedCategoryFilter('ALL'); setSelectedStyleFilter('ALL'); setSearchQuery(''); }}>
              <span>Simplify Feed</span>
              <span className="w-3.5 h-3.5 bg-[#68A108] rounded-full ml-2 self-end mb-2"></span>
            </h1>
            <p className="text-[10px] uppercase font-black tracking-[0.25em] text-[#68A108] font-mono leading-none mt-2">
              Real News. Real Jobs. Real Opportunities.
            </p>
          </div>
        </div>
      </header>

      {/* Main Navigation (Solid Green theme color #68A108) */}
      <nav className="bg-[#68A108] sticky top-0 z-50 shadow-md border-b border-[#528005]">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center flex-wrap gap-y-2">
          <ul className="flex items-center flex-wrap">
            {navItems.map((item) => (
              <li
                key={item.name}
                onClick={item.onClick}
                className={`flex items-center gap-1.5 px-5 py-4.5 text-[13px] font-sans font-bold tracking-tight border-r border-[#528005] cursor-pointer transition-colors group relative text-white
                  ${item.active ? 'bg-[#528005]' : 'hover:bg-[#528005]'}`}
              >
                <div className="flex items-center gap-1.5">
                  {item.name}
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4 py-4.5 px-6 group">
            <AnimatePresence>
              {isSearchOpen && (
                <motion.input
                  autoFocus
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs font-bold px-3 py-1.5 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none border border-[#528005] rounded-md focus:ring-1 focus:ring-[#68A108]"
                />
              )}
            </AnimatePresence>
            <Search 
              size={18} 
              className={`cursor-pointer transition-colors text-white hover:text-blue-100`}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            />
          </div>
        </div>
      </nav>

      <main className={`transition-all duration-300 ${selectedArticle ? 'bg-white w-full py-6 md:py-12' : 'max-w-7xl mx-auto px-4 py-6'}`}>
        <AnimatePresence mode="wait">
          {selectedArticle ? (
            <SingleArticleView article={selectedArticle} />
          ) : (
            <motion.div 
              key="listing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Auto-News Live Feed Sync Controls (Restricted to Admin only) */}
              {isAdmin && (
                <div className="bg-slate-900 border border-slate-800 text-white p-3.5 mb-5 rounded-lg shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 select-none animate-fadeIn">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#68A108]/20 border border-[#68A108]/50 flex items-center justify-center shrink-0">
                      <RefreshCw size={15} className={`text-[#68A108] ${isAutoSyncing ? 'animate-spin' : ''}`} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-white">Live News Sync Engine</span>
                        <span className="bg-[#68A108] text-white text-[8px] font-black uppercase px-2 py-0.5 rounded font-mono">
                          ADMIN DESK
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {lastSyncTime ? `Last synced: ${lastSyncTime}` : 'Real-time newsroom feed ready'} • {allArticles.length} Total Articles
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {syncToast && (
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-md animate-fadeIn">
                        {syncToast}
                      </span>
                    )}
                    <button
                      onClick={() => triggerAutoNews('US Politics')}
                      disabled={isAutoSyncing}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold px-2.5 py-1.5 rounded-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                    >
                      + Sync Politics
                    </button>
                    <button
                      onClick={() => triggerAutoNews('Entertainment')}
                      disabled={isAutoSyncing}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold px-2.5 py-1.5 rounded-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                    >
                      + Sync Entertainment
                    </button>
                    <button
                      onClick={() => triggerAutoNews('All')}
                      disabled={isAutoSyncing}
                      className="bg-[#68A108] hover:bg-[#528005] text-white text-[11px] font-black px-3.5 py-1.5 rounded-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                    >
                      {isAutoSyncing ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Fetching Live...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw size={13} />
                          <span>Sync All Live News</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-[10px] font-mono text-slate-300">
                      <span>Auto:</span>
                      <select
                        value={autoSyncFreq}
                        onChange={(e) => setAutoSyncFreq(e.target.value as any)}
                        className="bg-transparent text-[#68A108] font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="off" className="bg-slate-900 text-white">Off</option>
                        <option value="1m" className="bg-slate-900 text-white">Every 1m</option>
                        <option value="5m" className="bg-slate-900 text-white">Every 5m</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Flash Story Ticker (Modern Rounded Layout) */}
              <div className="bg-white border border-slate-100 p-1.5 mb-6 flex items-center justify-between shadow-sm rounded-lg overflow-hidden select-none">
                <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                  <div className="bg-[#68A108] text-white text-[10px] font-black uppercase px-4 py-2.5 rounded-md tracking-wider select-none shrink-0 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-white rounded-full shrink-0 relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    <span>FLASH STORY</span>
                  </div>
                  {/* Desktop multi-item layout mirroring the screenshot */}
                  <div className="hidden md:flex items-center gap-6 overflow-hidden pl-3 py-1">
                    {sortedAllArticles.slice(tickerIndex % 3, (tickerIndex % 3) + 3).map((art, idx) => (
                      <div 
                        key={art.id} 
                        onClick={() => setSelectedArticle(art)}
                        className="flex items-center gap-2 hover:text-[#2563eb] cursor-pointer transition-colors shrink-0 group"
                      >
                        <div className="w-6 h-6 overflow-hidden rounded-full border border-slate-100 shrink-0 bg-slate-50 shadow-sm">
                          <img 
                            src={art.image || FALLBACK_NEWS_IMAGE} 
                            alt={art.title} 
                            loading="lazy" 
                            decoding="async" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_NEWS_IMAGE;
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 truncate max-w-[160px] lg:max-w-[220px]">
                          {art.title}
                        </span>
                        {idx < 2 && <span className="text-slate-200 font-normal pl-4">|</span>}
                      </div>
                    ))}
                  </div>
                  {/* Mobile single item layout */}
                  <div className="flex md:hidden items-center gap-2 pl-3 py-1 min-w-0 flex-1">
                    {(() => {
                      const art = sortedAllArticles[tickerIndex % sortedAllArticles.length];
                      return art ? (
                        <div 
                          onClick={() => setSelectedArticle(art)}
                          className="flex items-center gap-2 hover:text-[#2563eb] cursor-pointer transition-colors truncate"
                        >
                          <div className="w-5 h-5 overflow-hidden rounded-full border border-slate-100 shrink-0 bg-slate-50 shadow-sm">
                            <img 
                              src={art.image || FALLBACK_NEWS_IMAGE} 
                              alt={art.title} 
                              loading="lazy" 
                              decoding="async" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.src = FALLBACK_NEWS_IMAGE;
                              }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-800 truncate">
                            {art.title}
                          </span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0 ml-4 pr-1.5">
                  <button 
                    onClick={() => setTickerIndex(prev => prev === 0 ? sortedAllArticles.length - 1 : prev - 1)}
                    className="w-7 h-7 bg-slate-50 hover:bg-slate-100 border border-slate-150/40 flex items-center justify-center rounded-full transition-colors text-slate-500 hover:text-[#2563eb] hover:border-blue-200 shadow-sm"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button 
                    onClick={() => setTickerIndex(prev => (prev + 1) % sortedAllArticles.length)}
                    className="w-7 h-7 bg-slate-50 hover:bg-slate-100 border border-slate-150/40 flex items-center justify-center rounded-full transition-colors text-slate-500 hover:text-[#2563eb] hover:border-blue-200 shadow-sm"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* 3-Column Hero Grid Section (Modern Rounded Layout) */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-8 items-stretch">

                {/* Column 1: Main Story (Takes 2 columns of 4) */}
                <div className="lg:col-span-2 flex flex-col h-full">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3 relative">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#68A108] rounded-full" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-sans">MAIN STORY</h3>
                    </div>
                    <div className="absolute bottom-[-1px] left-0 w-20 h-[2px] bg-[#68A108] rounded-full" />
                    <div className="flex gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none">
                      <span>Spotlight</span>
                    </div>
                  </div>
                  {(() => {
                    const mainStory = homepageSections.mainStory || seedArticles[0];
                    const bigStory = homepageSections.bigStory;
                    return (
                      <div className="flex flex-col flex-1 bg-white border border-slate-100 p-4 rounded-lg shadow-sm">
                        <div
                          onClick={() => setSelectedArticle(mainStory)}
                          className="group cursor-pointer flex flex-col"
                        >
                          <div className="aspect-[16/9] md:aspect-[16/10] overflow-hidden relative mb-3.5 bg-slate-50 border border-slate-100 rounded-md shrink-0">
                            {renderCatchyThumbnail(mainStory, "w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1000ms]", false)}

                            {/* Bottom-left double rectangle tags */}
                            <div className="absolute bottom-3 left-3 flex gap-1.5 z-10">
                              <span className="bg-[#68A108] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md select-none shadow-sm">
                                {mainStory.category || 'NEWS'}
                              </span>
                              <span className="bg-[#111] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md select-none shadow-sm">
                                FEATURED
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col">
                            <div className="mb-3">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-black text-[#68A108] uppercase tracking-wider">
                                  {mainStory.category}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-[11px] font-mono text-slate-400">{mainStory.date}</span>
                              </div>
                              <h2 className="text-xl md:text-2xl font-black text-slate-950 leading-snug mb-2.5 group-hover:text-[#68A108] transition-colors">
                                {mainStory.title}
                              </h2>
                              <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-normal mb-3">
                                {mainStory.meta}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] font-bold text-slate-400 mb-4">
                              <span>By <span className="text-slate-700 font-bold">{mainStory.author}</span></span>
                              <span className="flex items-center gap-1"><Eye size={12} /> {mainStory.views} views</span>
                            </div>
                          </div>
                        </div>

                        {/* Big Story: one large story filling the remaining space under the main story */}
                        {bigStory && (
                          <div className="pt-3 border-t border-slate-100 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-black text-[#68A108] uppercase tracking-wider font-mono flex items-center gap-1.5">
                                <Flame size={12} className="text-[#68A108]" /> BIG STORY
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Editor's Pick</span>
                            </div>
                            <div
                              onClick={() => setSelectedArticle(bigStory)}
                              className="group cursor-pointer flex-1 flex flex-col bg-slate-50/70 hover:bg-slate-100/90 border border-slate-200/60 rounded-lg overflow-hidden transition-all duration-200"
                            >
                              <div className="relative flex-1 min-h-[220px] overflow-hidden bg-slate-100 border-b border-slate-200/60">
                                {renderCatchyThumbnail(bigStory, "w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 absolute inset-0", false, false)}
                                <div className="absolute bottom-3 left-3 z-10">
                                  <span className="bg-[#68A108] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md select-none shadow-sm">
                                    {bigStory.category || 'NEWS'}
                                  </span>
                                </div>
                              </div>
                              <div className="p-3.5">
                                <h4 className="text-[15px] font-black text-slate-900 leading-snug group-hover:text-[#68A108] transition-colors line-clamp-2 mb-1.5">
                                  {bigStory.title}
                                </h4>
                                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                                  <Calendar size={10} /> {bigStory.date}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })()}
                </div>

                {/* Column 2: Trending Stories (Replaced Editor's Picks with Trending Stories) */}
                <div className="lg:col-span-1 flex flex-col h-full">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3 relative">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#68A108] rounded-full" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-sans">TRENDING STORIES</h3>
                    </div>
                    <div className="absolute bottom-[-1px] left-0 w-28 h-[2px] bg-[#68A108] rounded-full" />
                    <span className="text-[9px] font-mono font-bold text-[#68A108]">HOT</span>
                  </div>
                  <div className="flex flex-col gap-3.5 flex-1 justify-between">
                    {(() => {
                      const trendingList = homepageSections.trendingStories;

                      return trendingList.map((article, index) => (
                        <div
                          key={article.id}
                          onClick={() => setSelectedArticle(article)}
                          className="group bg-white border border-slate-100 p-3.5 hover:shadow-md hover:border-slate-200 transition-all duration-300 cursor-pointer flex flex-col rounded-lg shadow-sm relative"
                        >
                          <div className="aspect-[16/9] overflow-hidden relative mb-2.5 bg-slate-50 border border-slate-100 rounded-md">
                            {renderCatchyThumbnail(article, "w-full h-full object-cover group-hover:scale-105 transition-transform duration-700", false)}

                            {/* Top-right Rank Badge */}
                            <div className="absolute top-2 right-2 z-10">
                              <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-md font-mono">
                                #{index + 1} TRENDING
                              </span>
                            </div>

                            {/* Bottom-left Category Badge */}
                            <div className="absolute bottom-2 left-2 z-10">
                              <span className="bg-[#68A108] text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md select-none">
                                {article.category}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="mb-2">
                              <span className="text-[9px] font-black text-[#68A108] uppercase tracking-wider block mb-1 font-mono">
                                {article.category}
                              </span>
                              <h4 className="text-[13px] font-black text-slate-900 leading-snug group-hover:text-[#68A108] transition-colors mb-2">
                                {article.title}
                              </h4>
                              {article.meta && (
                                <p className="text-[11px] text-slate-600 leading-relaxed mb-3 font-normal line-clamp-2">
                                  {article.meta}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 pt-2 border-t border-slate-100 font-mono">
                              <span>{article.date}</span>
                              <span className="flex items-center gap-1 text-slate-700 font-black"><Eye size={10} className="text-[#68A108]" /> {article.views} views</span>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Column 3: Quick Dispatches Sidebar */}
                <div className="lg:col-span-1 flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3 relative">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#68A108] rounded-full" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-sans">QUICK DISPATCHES</h3>
                    </div>
                    <div className="absolute bottom-[-1px] left-0 w-28 h-[2px] bg-[#68A108] rounded-full" />
                    <div className="flex gap-1">
                      <span className="text-[9px] font-mono font-bold text-[#68A108]">LIVE</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-white border border-slate-100/80 p-3 divide-y divide-slate-100 flex flex-col justify-start rounded-lg shadow-sm">
                    {homepageSections.quickDispatches.map((article) => (
                      <div
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="group flex gap-3 cursor-pointer py-3 first:pt-0 last:pb-0 items-start hover:bg-slate-50/70 p-1.5 rounded-md transition-all duration-200"
                      >
                        {/* Square thumbnail */}
                        <div className="w-14 h-14 shrink-0 overflow-hidden relative border border-slate-100 bg-slate-50 rounded-md">
                          {renderCatchyThumbnail(article, "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500", false, false)}
                        </div>
                        <div className="flex flex-col justify-center min-w-0 flex-1">
                          <span className="text-[9px] font-black text-[#68A108] uppercase tracking-wider mb-1 leading-none">
                            {article.category}
                          </span>
                          <h4 className="text-[12.5px] font-black text-slate-900 group-hover:text-[#68A108] leading-snug transition-colors mb-1.5">
                            {article.title}
                          </h4>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <Calendar size={10} />
                            {article.date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Featured Story Horizontal Row (Modern Rounded Layout, 5 Cards) */}
              <div className="mb-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-4 relative">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#68A108] rounded-full" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-sans">FEATURED STORY</h3>
                  </div>
                  <div className="absolute bottom-[-2px] left-0 w-28 h-[2px] bg-[#68A108] rounded-full" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                  {homepageSections.featuredStories.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="group bg-white border border-slate-100 p-2.5 hover:shadow-md hover:border-slate-200/60 transition-all duration-300 cursor-pointer flex flex-col justify-between rounded-lg shadow-sm"
                    >
                      <div className="aspect-[4/3] overflow-hidden relative mb-2 bg-slate-50 border border-slate-100 rounded-md">
                        {renderCatchyThumbnail(article, "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500", false)}

                        {/* Category tag bottom-left overlay */}
                        <div className="absolute bottom-2 left-2 z-10">
                          <span className="bg-[#68A108] text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md select-none">
                            {article.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col flex-1 justify-between">
                        <div>
                          <span className="text-[8px] font-black text-[#68A108] uppercase tracking-wider block mb-1">
                            {article.category}
                          </span>
                          <h4 className="text-[11px] font-black text-slate-900 leading-tight group-hover:text-[#68A108] transition-colors line-clamp-3">
                            {article.title}
                          </h4>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="mb-8 bg-[#090d16] relative overflow-hidden rounded-lg border border-neutral-900 p-6 md:p-8" style={{ backgroundImage: 'radial-gradient(#1e293b 1.2px, transparent 1.2px)', backgroundSize: '16px 16px' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-neutral-950/40 to-neutral-950/80 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
                  <div className="flex items-center gap-3 md:shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-[#68A108] flex items-center justify-center shrink-0">
                      <Mail size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-black text-base leading-tight">Never miss a dispatch</h3>
                      <p className="text-slate-400 text-xs font-semibold mt-0.5">Top stories, jobs, and scholarships — straight to your inbox.</p>
                    </div>
                  </div>

                  {newsletterSubmitted ? (
                    <div className="flex items-center gap-2 text-[#68A108] font-bold text-sm md:ml-auto">
                      <CheckCircle size={18} />
                      You're subscribed — thanks for joining!
                    </div>
                  ) : (
                    <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2.5 md:ml-auto w-full md:w-auto">
                      <input
                        type="email"
                        required
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="bg-slate-950 border border-slate-800 text-sm font-semibold py-2.5 px-4 text-slate-200 focus:outline-none focus:border-[#68A108] rounded-md placeholder:text-slate-600 transition-colors hover:border-slate-700 w-full sm:w-64"
                      />
                      <button
                        type="submit"
                        className="bg-[#68A108] hover:bg-[#528005] text-white text-[11px] font-black uppercase tracking-wider px-5 py-2.5 rounded-md transition-colors shrink-0"
                      >
                        Subscribe
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Popular Topics */}
              {popularTags.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-4 relative">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#68A108] rounded-full" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-sans">POPULAR TOPICS</h3>
                    </div>
                    <div className="absolute bottom-[-2px] left-0 w-28 h-[2px] bg-[#68A108] rounded-full" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className="flex items-center gap-1 text-[11px] font-bold px-3.5 py-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-[#68A108] hover:text-[#68A108] hover:bg-[#68A108]/5 transition-colors capitalize"
                      >
                        <Hash size={11} className="text-[#68A108]" />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* News & Opportunity Directory Dashboard (Latest Articles Feed) */}
              <div ref={directoryRef} className="bg-slate-900 text-white p-5 md:p-6 mb-8 border border-slate-800/80 rounded-lg shadow-xl scroll-mt-24">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-5 select-none">
                  <div>
                    <h3 className="text-base font-black tracking-tight uppercase flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-[#68A108] rounded-full" />
                      Latest News & All Articles
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono mt-0.5">
                      Complete archive listed newest to oldest • Filter by category or search below
                    </p>
                  </div>
                  {/* View layout toggle */}
                  <div className="flex items-center gap-1.5 shrink-0 bg-slate-950 p-1 border border-slate-850 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 rounded-md
                        ${viewMode === 'grid' ? 'bg-[#68A108] text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      <Grid size={11} />
                      Grid View
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 rounded-md
                        ${viewMode === 'list' ? 'bg-[#68A108] text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      <List size={11} />
                      List View (Board)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div className="flex flex-col">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 font-mono">Select Category</label>
                    <select 
                      value={selectedCategoryFilter}
                      onChange={(e) => { setSelectedCategoryFilter(e.target.value); setCurrentPage(1); }}
                      className="bg-slate-950 border border-slate-800 text-xs font-semibold py-2.5 px-3 text-slate-200 focus:outline-none focus:border-[#68A108] rounded-md cursor-pointer transition-colors hover:border-slate-700"
                    >
                      <option value="ALL">All Categories ({allArticles.length})</option>
                      {Array.from(new Set(allArticles.map(a => a.category.toUpperCase()))).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Style/Type Filter */}
                  <div className="flex flex-col">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 font-mono">Dispatch Badge Type</label>
                    <select 
                      value={selectedStyleFilter}
                      onChange={(e) => { setSelectedStyleFilter(e.target.value); setCurrentPage(1); }}
                      className="bg-slate-950 border border-slate-800 text-xs font-semibold py-2.5 px-3 text-slate-200 focus:outline-none focus:border-[#68A108] rounded-md cursor-pointer transition-colors hover:border-slate-700"
                    >
                      <option value="ALL">All Badge Styles</option>
                      <option value="BREAKING">🚨 Breaking Dispatch</option>
                      <option value="TRENDING">🔥 Hot Trending</option>
                      <option value="AI_COGNITIVE">🤖 AI Cognitive Feed</option>
                      <option value="EXCLUSIVE">⭐ Staff Exclusive</option>
                      <option value="STANDARD">📄 Standard Dispatch</option>
                    </select>
                  </div>

                  {/* Sort Filter */}
                  <div className="flex flex-col">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 font-mono">Sort Dispatches By</label>
                    <select 
                      value={sortBy}
                      onChange={(e) => { setSortBy(e.target.value as any); setCurrentPage(1); }}
                      className="bg-slate-950 border border-slate-800 text-xs font-semibold py-2.5 px-3 text-slate-200 focus:outline-none focus:border-[#68A108] rounded-md cursor-pointer transition-colors hover:border-slate-700"
                    >
                      <option value="newest">📅 Newest First</option>
                      <option value="views">🔥 Volume / Views Count</option>
                      <option value="alpha">🔤 Title (A to Z)</option>
                    </select>
                  </div>

                  {/* Quick Search */}
                  <div className="flex flex-col">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 font-mono">Live Search Match</label>
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="Search keywords..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-slate-950 border border-slate-800 text-xs font-semibold py-2.5 pl-3 pr-8 text-slate-200 focus:outline-none focus:border-[#2563eb] rounded-md placeholder:text-slate-600 transition-colors hover:border-slate-700"
                      />
                      <Search size={14} className="absolute right-3 top-3.5 text-slate-600 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-800 select-none">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500 self-center mr-1 font-mono">Quick Tags:</span>
                  {['ALL', 'WORLD NEWS', 'ENTERTAINMENT', 'JOBS', 'SCHOLARSHIPS'].map((cat) => {
                    const isBlueCat = cat === 'JOBS' || cat === 'SCHOLARSHIPS';
                    return (
                      <button
                        key={cat}
                        onClick={() => { setSelectedCategoryFilter(cat); setCurrentPage(1); }}
                        className={`text-[9px] font-black px-3 py-1 transition-all rounded-full font-mono uppercase tracking-wider
                          ${selectedCategoryFilter === cat 
                            ? (isBlueCat ? 'bg-[#2563eb] text-white' : 'bg-[#68A108] text-white')
                            : 'bg-slate-950 text-slate-400 border border-slate-850 hover:text-white'}`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Directory Content Stream */}
              <div>
                {currentArticles.length === 0 ? (
                  <div className="py-20 text-center bg-white border border-dashed border-slate-200 shadow-sm rounded-lg">
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No articles matching current filters.</p>
                    <button
                      onClick={() => { setSelectedCategoryFilter('ALL'); setSelectedStyleFilter('ALL'); setSearchQuery(''); }}
                      className="mt-4 px-5 py-2.5 bg-[#68A108] hover:bg-[#528005] text-white text-[10px] font-black tracking-widest uppercase rounded-md transition-colors"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : viewMode === 'grid' ? (
                  /* Grid view (classic cards) */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {currentArticles.map((article) => (
                      <div
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="bg-white group cursor-pointer border border-slate-100 hover:border-slate-200/80 hover:shadow-md hover:shadow-slate-200/50 transition-all p-4 rounded-lg flex flex-col justify-between shadow-sm animate-fadeIn"
                      >
                        <div>
                          <div className="aspect-[16/11] overflow-hidden mb-3.5 relative bg-slate-50 border border-slate-100 rounded-md">
                            {renderCatchyThumbnail(article, "w-full h-full object-cover group-hover:scale-105 transition-transform duration-700", true)}
                          </div>
                          <div className="flex items-center gap-2 mb-2 font-mono text-[9px] font-bold uppercase text-[#68A108]">
                            <span>{article.category}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-400">{article.date}</span>
                          </div>
                          <h3 className="text-sm font-black leading-snug mb-3 text-slate-950 transition-colors line-clamp-2 group-hover:text-[#68A108]">
                            {article.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed font-medium animate-fadeIn">
                            {article.meta}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-black text-slate-400 pt-3 border-t border-slate-50">
                          <span className="uppercase">By {article.author}</span>
                          <span className="flex items-center gap-1 font-mono"><Eye size={12} /> {article.views} VIEWS</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* List view (ScholarshipAir-style Directory table/board) */
                  <div className="flex flex-col gap-3">
                    {currentArticles.map((article) => (
                      <div 
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="bg-white border border-slate-100 p-4 hover:border-slate-200/60 hover:shadow-md hover:shadow-slate-100/50 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group rounded-lg shadow-sm"
                      >
                        {/* Left: Metadata cells */}
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="w-16 h-12 overflow-hidden relative border border-slate-150 bg-slate-50 rounded-md shadow-xs hidden md:block">
                            {renderCatchyThumbnail(article, "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500", false)}
                          </div>
                          <div className="flex flex-col justify-center">
                            <span className="border text-[8px] font-black tracking-widest px-2 py-0.5 uppercase self-start mb-1 font-mono rounded-full bg-emerald-50 border-emerald-100 text-[#68A108]">
                              {article.category}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 font-mono flex items-center gap-1.5">
                              <Calendar size={10} />
                              {article.date}
                            </span>
                          </div>
                        </div>

                        {/* Center: Title & description info */}
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="text-sm font-black text-slate-900 transition-colors leading-snug mb-1 line-clamp-1 group-hover:text-[#68A108]">
                            {article.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                            {article.meta}
                          </p>
                        </div>

                        {/* Right: Views & Action cells */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                          <div className="text-right flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-0 font-mono text-[10px] font-bold text-slate-400">
                            <span className="text-slate-500 uppercase sm:mb-0.5">Views</span>
                            <span className="text-slate-800 font-black">{article.views}</span>
                          </div>
                          
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedArticle(article); }}
                            className="text-white text-[9px] font-black tracking-widest uppercase py-2.5 px-4.5 flex items-center gap-1.5 transition-all duration-300 shadow-sm rounded-md bg-[#68A108] hover:bg-[#528005]"
                          >
                            READ ARTICLE
                            <ArrowUpRight size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-12 flex flex-col items-center gap-3">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => {
                          setCurrentPage(prev => Math.max(1, prev - 1));
                          directoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        disabled={currentPage === 1}
                        className="w-10 h-10 bg-white border border-slate-200 flex items-center justify-center hover:bg-[#333] hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-current rounded-md shadow-xs cursor-pointer"
                        title="Previous page"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => {
                            setCurrentPage(i + 1);
                            directoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                          className={`w-10 h-10 border text-xs font-black transition-all rounded-md shadow-xs cursor-pointer
                            ${currentPage === i + 1
                              ? 'bg-[#68A108] border-[#68A108] text-white'
                              : 'bg-white border-slate-200 hover:border-[#333] hover:bg-[#333] hover:text-white'}`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => {
                          setCurrentPage(prev => Math.min(totalPages, prev + 1));
                          directoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        disabled={currentPage === totalPages}
                        className="w-10 h-10 bg-white border border-slate-200 flex items-center justify-center hover:bg-[#333] hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-current rounded-md shadow-xs cursor-pointer"
                        title="Next page"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 font-bold">
                      Page {currentPage} of {totalPages} ({filteredArticles.length} total articles)
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Branding Area */}
      <footer className="mt-16 py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
          <h2 className="text-3xl font-black flex items-center grayscale opacity-10 select-none cursor-pointer" onClick={() => setSelectedArticle(null)}>
            Simplify Feed
            <span className="w-2 h-2 bg-[#333] rounded-full ml-0.5"></span>
          </h2>
          <div
            onDoubleClick={() => setShowAdminModal(true)}
            className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-20 text-center select-none cursor-default"
            title="Press Ctrl+Shift+A or double-click to unlock Admin Desk"
          >
            SYSTEM VERSION 9.1.0 / BUILD 2026 / NEWS PORTAL
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] font-bold text-slate-500">
            <button onClick={() => onNavigateStatic?.('about')} className="hover:text-[#68A108] transition-colors cursor-pointer">About</button>
            <button onClick={() => onNavigateStatic?.('contact')} className="hover:text-[#68A108] transition-colors cursor-pointer">Contact</button>
            <button onClick={() => onNavigateStatic?.('privacy')} className="hover:text-[#68A108] transition-colors cursor-pointer">Privacy Policy</button>
            <button onClick={() => onNavigateStatic?.('terms')} className="hover:text-[#68A108] transition-colors cursor-pointer">Terms of Use</button>
            <a href={apiUrl('/rss.xml')} className="hover:text-[#68A108] transition-colors cursor-pointer">RSS</a>
          </div>
        </div>
      </footer>

      {/* Admin Authentication Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-slate-800 text-white rounded-xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => { setShowAdminModal(false); setAdminError(''); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#68A108]/20 border border-[#68A108]/50 flex items-center justify-center shrink-0">
                  <Lock size={18} className="text-[#68A108]" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider text-white">Admin Control Desk</h3>
                  <p className="text-xs text-slate-400">Unlock site manager live news controls & options</p>
                </div>
              </div>

              <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-bold uppercase mb-1.5">
                    Admin Passcode
                  </label>
                  <input
                    type="password"
                    autoFocus
                    value={adminPasscode}
                    onChange={(e) => { setAdminPasscode(e.target.value); setAdminError(''); }}
                    placeholder="Enter secure admin passcode"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#68A108] focus:ring-1 focus:ring-[#68A108]"
                  />
                  {adminError && (
                    <span className="text-xs text-red-400 mt-1.5 block font-mono">{adminError}</span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-slate-500 font-mono">Server protected desk</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowAdminModal(false); setAdminError(''); }}
                      className="px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isAuthChecking}
                      className="bg-[#68A108] hover:bg-[#528005] text-white text-xs font-black px-4 py-2 rounded-lg transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isAuthChecking ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Authenticate Admin</span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .article-body-content h2 { @apply text-[22px] md:text-[26px] font-bold font-sans mt-10 mb-5 text-slate-900 leading-tight tracking-tight pt-2 border-t border-slate-100; }
        .article-body-content h3 { @apply text-[18px] md:text-[21px] font-bold font-sans mt-8 mb-4 text-slate-800 leading-snug; }
        .article-body-content p { @apply text-[17px] md:text-[18px] leading-[1.8] md:leading-[1.85] mb-6 text-slate-800 font-sans font-normal; }
        .article-body-content blockquote { @apply border-l-[6px] border-[#68A108] pl-6 py-3 my-8 font-sans text-[20px] md:text-[22px] text-slate-950 leading-relaxed font-normal not-italic block bg-slate-50/50 rounded-r-md; }
        .article-body-content ul, .article-body-content ol { @apply mb-6 pl-6 text-slate-850 font-sans text-[17px] leading-[1.75]; }
        .article-body-content li { @apply mb-3 list-disc marker:text-[#68A108]; }
        .article-body-content ol li { @apply list-decimal; }
        .article-body-content strong { @apply font-bold text-slate-950; }
        .article-body-content a { @apply text-blue-600 underline hover:text-blue-800 transition-colors; }
      `}</style>
    </div>
  );
}
