export interface WeatherData {
  temperature: number;
  windSpeed: number;
  rainProbability: number;
  weatherCode: number;
  isStormWarning: boolean;
  updatedAt: Date;
}

export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

export interface ExternalIntelligence {
  weather: WeatherData | null;
  news: NewsArticle[];
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

const NEWS_CACHE_KEY = 'crisiswall_news_cache';
const NEWS_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface NewsCache {
  articles: NewsArticle[];
  fetchedAt: number; // epoch ms
}

function readNewsCache(): NewsCache | null {
  try {
    const raw = localStorage.getItem(NEWS_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as NewsCache;
  } catch {
    return null;
  }
}

function writeNewsCache(articles: NewsArticle[]): void {
  try {
    const payload: NewsCache = { articles, fetchedAt: Date.now() };
    localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage may be unavailable (private mode, quota exceeded) — safe to ignore
  }
}

function isCacheValid(cache: NewsCache | null): cache is NewsCache {
  if (!cache) return false;
  return Date.now() - cache.fetchedAt < NEWS_CACHE_TTL_MS;
}

// ─── Weather ──────────────────────────────────────────────────────────────────

// Map WMO weather codes to a simple storm warning boolean
// 95, 96, 99 are thunderstorm codes; 71-77 are heavy snow; 65 is heavy rain.
function checkStormWarning(code: number, windSpeed: number): boolean {
  if (windSpeed > 45) return true; // High wind warning
  const severeCodes = [65, 75, 77, 95, 96, 99];
  return severeCodes.includes(code);
}

export async function fetchWeatherData(): Promise<WeatherData> {
  // Using a default central location (e.g., a major city or center of operations).
  // For production, this could be dynamic based on user location or incident hotspots.
  const lat = 40.7128; // New York
  const lon = -74.0060;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code&hourly=precipitation_probability`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Weather API failed');

  const data = await response.json();

  // Get current hour's rain probability
  const currentHourIndex = new Date().getHours();
  const rainProb = data.hourly?.precipitation_probability?.[currentHourIndex] || 0;

  const windSpeed = data.current.wind_speed_10m;
  const weatherCode = data.current.weather_code;

  return {
    temperature: data.current.temperature_2m,
    windSpeed,
    rainProbability: rainProb,
    weatherCode,
    isStormWarning: checkStormWarning(weatherCode, windSpeed),
    updatedAt: new Date()
  };
}

// ─── News ─────────────────────────────────────────────────────────────────────

export async function fetchNewsData(): Promise<NewsArticle[]> {
  // 1. Return valid cached data immediately — no API call needed.
  const cached = readNewsCache();
  if (isCacheValid(cached)) {
    return cached.articles;
  }

  const apiKey = import.meta.env.VITE_GNEWS_API_KEY;

  if (!apiKey || apiKey === 'your_key_here') {
    // Graceful fallback if API key is missing or placeholder
    console.warn('No GNews API key found. Using simulated live news data.');
    const fallback = getSimulatedNews();
    writeNewsCache(fallback); // cache fallback so we don't warn on every render
    return fallback;
  }

  try {
    const query = encodeURIComponent('disaster OR emergency OR flood OR fire OR storm');
    const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&max=5&apikey=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 429 || response.status === 403) {
        console.warn('GNews API limit reached or invalid key. Using cached/simulated news data.');
        // Prefer stale cache over simulated data when rate-limited
        if (cached) return cached.articles;
        const fallback = getSimulatedNews();
        writeNewsCache(fallback);
        return fallback;
      }
      throw new Error(`News API failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.articles || !Array.isArray(data.articles)) {
      const fallback = getSimulatedNews();
      writeNewsCache(fallback);
      return fallback;
    }

    const articles: NewsArticle[] = data.articles.map((article: any) => ({
      title: article.title,
      url: article.url,
      source: article.source?.name || 'News Source',
      publishedAt: article.publishedAt,
    }));

    // 2. Write fresh data to cache so the next 30 minutes are served instantly.
    writeNewsCache(articles);
    return articles;

  } catch (error) {
    console.error('Failed to fetch news, falling back to cached/simulated data', error);
    // Return stale cache if available, otherwise simulate
    if (cached) return cached.articles;
    const fallback = getSimulatedNews();
    writeNewsCache(fallback);
    return fallback;
  }
}

// ─── Fallback data ────────────────────────────────────────────────────────────

// Simulated data ensures the dashboard never breaks when API is unavailable
function getSimulatedNews(): NewsArticle[] {
  return [
    {
      title: "Flash floods hit southern districts, emergency teams deployed",
      url: "#",
      source: "Global Crisis Network",
      publishedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    },
    {
      title: "Wildfire containment drops to 40% amid high winds",
      url: "#",
      source: "Emergency Dispatch",
      publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      title: "Storm warning issued for coastal regions: Level 4 Alert",
      url: "#",
      source: "Weather Authority",
      publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    }
  ];
}
