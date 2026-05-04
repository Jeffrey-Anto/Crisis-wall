import { PageWrapper } from "../components/PageWrapper";
import { useExternalIntelligence } from "../hooks/useExternalIntelligence";
import { Skeleton } from "../components/Skeleton";
import { Newspaper, ExternalLink, RefreshCw } from "lucide-react";

export function NewsIntelligence() {
  const { news, isLoading, refresh } = useExternalIntelligence();

  return (
    <PageWrapper title="News Intelligence" description="Live feeds from global news and social media.">
      <div className="flex justify-end mb-6">
        <button
          onClick={() => refresh(true)}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Feed
        </button>
      </div>

      {isLoading && news.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-3/4 mb-6" />
              <div className="flex justify-between mt-4">
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center">
          <Newspaper className="h-12 w-12 text-slate-600 mx-auto mb-4 opacity-50" />
          <p className="text-slate-400">No news articles found matching current threat parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {news.map((item, idx) => (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="group bg-slate-900/40 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-6 transition-all hover:bg-slate-800/60 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <Badge variant="default" className="bg-slate-800 text-cyan-400 border-slate-700 uppercase tracking-widest text-[10px]">
                  {item.source}
                </Badge>
                <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-4 flex-1 group-hover:text-white transition-colors">
                {item.title}
              </h3>
              <div className="text-xs text-slate-500 border-t border-slate-800/50 pt-4 mt-auto">
                Published: {new Date(item.publishedAt).toLocaleString()}
              </div>
            </a>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}

// Inline badge for this file
function Badge({ children, className }: any) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </span>
  );
}
