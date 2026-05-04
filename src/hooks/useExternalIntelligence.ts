import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchWeatherData, fetchNewsData } from '../services/externalIntelligence';
import type { WeatherData, NewsArticle } from '../services/externalIntelligence';
import { logger } from '../utils/logger';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function useExternalIntelligence() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch-lock: prevents React Strict Mode's double-invocation (and fast re-renders)
  // from firing duplicate in-flight network requests.
  const isFetchingRef = useRef(false);

  const loadData = useCallback(async (forceRefresh = false) => {
    // Guard: if a fetch is already in flight, skip this invocation.
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    setIsLoading(true);
    setError(null);

    try {
      const [weatherData, newsData] = await Promise.all([
        fetchWeatherData().catch((e) => {
          logger.apiError('Open-Meteo', e);
          return null; // Don't fail the whole hook if weather fails
        }),
        fetchNewsData(forceRefresh).catch((e) => {
          logger.apiError('GNews', e);
          return [] as NewsArticle[];
        })
      ]);

      if (weatherData) setWeather(weatherData);
      if (newsData.length > 0) setNews(newsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [loadData]);

  return { weather, news, isLoading, error, refresh: loadData };
}
