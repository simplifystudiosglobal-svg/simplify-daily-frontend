import { useEffect, useState } from 'react';
import NewsPortal from './components/themes/NewsPortal';
import ScholarshipsPage from './components/themes/ScholarshipsPage';
import JobsPage from './components/themes/JobsPage';
import WorldNewsPage from './components/themes/WorldNewsPage';
import EntertainmentPage from './components/themes/EntertainmentPage';
import StaticPage, { type StaticPageId } from './components/themes/StaticPage';

type View = 'home' | 'scholarships' | 'jobs' | 'world-news' | 'entertainment' | StaticPageId;

const staticPaths: Record<string, StaticPageId> = {
  '/about': 'about',
  '/contact': 'contact',
  '/privacy': 'privacy',
  '/terms': 'terms',
};

function viewFromPath(pathname: string): View {
  if (staticPaths[pathname]) return staticPaths[pathname];
  if (pathname.startsWith('/scholarships')) return 'scholarships';
  if (pathname.startsWith('/jobs')) return 'jobs';
  if (pathname.startsWith('/world-news')) return 'world-news';
  if (pathname.startsWith('/entertainment')) return 'entertainment';
  return 'home';
}

export default function App() {
  const [view, setView] = useState<View>(() => viewFromPath(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setView(viewFromPath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const goHome = () => {
    window.history.pushState({}, '', '/');
    setView('home');
  };
  const goScholarships = () => {
    window.history.pushState({}, '', '/scholarships');
    setView('scholarships');
  };
  const goJobs = () => {
    window.history.pushState({}, '', '/jobs');
    setView('jobs');
  };
  const goWorldNews = () => {
    window.history.pushState({}, '', '/world-news');
    setView('world-news');
  };
  const goEntertainment = () => {
    window.history.pushState({}, '', '/entertainment');
    setView('entertainment');
  };
  const goStatic = (page: StaticPageId) => {
    window.history.pushState({}, '', `/${page}`);
    setView(page);
  };

  return (
    <div className="relative overflow-x-hidden">
      {view === 'home' && (
        <NewsPortal
          onNavigateScholarships={goScholarships}
          onNavigateJobs={goJobs}
          onNavigateStatic={goStatic}
          onNavigateWorldNews={goWorldNews}
          onNavigateEntertainment={goEntertainment}
        />
      )}
      {view === 'world-news' && (
        <WorldNewsPage
          onNavigateHome={goHome}
          onNavigateJobs={goJobs}
          onNavigateScholarships={goScholarships}
          onNavigateEntertainment={goEntertainment}
          onNavigateStatic={goStatic}
        />
      )}
      {view === 'entertainment' && (
        <EntertainmentPage
          onNavigateHome={goHome}
          onNavigateJobs={goJobs}
          onNavigateScholarships={goScholarships}
          onNavigateWorldNews={goWorldNews}
          onNavigateStatic={goStatic}
        />
      )}
      {view === 'scholarships' && (
        <ScholarshipsPage
          onNavigateHome={goHome}
          onNavigateJobs={goJobs}
          onNavigateStatic={goStatic}
          onNavigateWorldNews={goWorldNews}
          onNavigateEntertainment={goEntertainment}
        />
      )}
      {view === 'jobs' && (
        <JobsPage
          onNavigateHome={goHome}
          onNavigateScholarships={goScholarships}
          onNavigateStatic={goStatic}
          onNavigateWorldNews={goWorldNews}
          onNavigateEntertainment={goEntertainment}
        />
      )}
      {(view === 'about' || view === 'contact' || view === 'privacy' || view === 'terms') && (
        <StaticPage
          page={view}
          onNavigateHome={goHome}
          onNavigateScholarships={goScholarships}
          onNavigateJobs={goJobs}
          onNavigateStatic={goStatic}
          onNavigateWorldNews={goWorldNews}
          onNavigateEntertainment={goEntertainment}
        />
      )}
    </div>
  );
}
