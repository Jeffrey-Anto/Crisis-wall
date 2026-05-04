import { useState, useEffect, useRef, useCallback } from 'react';
import type { WeatherData, NewsArticle } from '../services/externalIntelligence';
import { runAIAnalysis } from '../utils/aiEngine';
import type { AIAnalysis } from '../utils/aiEngine';
import type { Incident, Alert, Resource } from '../types/database';

const PROCESSING_DELAY_MS = 2200; // Simulated AI thinking time

export function useAIInsights(
  incidents: Incident[],
  alerts: Alert[],
  resources: Resource[],
  weather: WeatherData | null,
  news: NewsArticle[]
) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Cancel any pending computation
    if (timerRef.current) clearTimeout(timerRef.current);

    // Only run analysis when we have meaningful data loaded (not initial empty state).
    // BUG-09: must set isProcessing=false here, otherwise the spinner hangs
    // forever because isProcessing starts as true and this path never clears it.
    if (incidents.length === 0 && alerts.length === 0 && resources.length === 0) {
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);

    // Simulate AI processing delay for realism
    timerRef.current = setTimeout(() => {
      const result = runAIAnalysis(incidents, alerts, resources, weather, news);
      setAnalysis(result);
      setIsProcessing(false);
    }, PROCESSING_DELAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [incidents, alerts, resources, weather, news]);

  // BUG-04: useCallback so refresh always closes over the *current* data values,
  // and always clears any already-pending timer before scheduling a new one.
  // Previously a plain function captured stale closure values and could start
  // two concurrent timers if called while one was already in flight.
  const refresh = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsProcessing(true);
    timerRef.current = setTimeout(() => {
      const result = runAIAnalysis(incidents, alerts, resources, weather, news);
      setAnalysis(result);
      setIsProcessing(false);
    }, PROCESSING_DELAY_MS);
  }, [incidents, alerts, resources, weather, news]);

  return { analysis, isProcessing, refresh };
}
