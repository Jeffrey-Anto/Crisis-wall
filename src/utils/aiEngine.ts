import type { Incident, Alert, Resource } from '../types/database';
import type { WeatherData, NewsArticle } from '../services/externalIntelligence';

export type ThreatLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface AIInsight {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  title: string;
  description: string;
  confidence: number; // 0-100
}

export interface AIAnalysis {
  riskScore: number;          // 0–100
  threatLevel: ThreatLevel;
  suggestedAction: string;
  overallConfidence: number;  // 0–100
  insights: AIInsight[];
  summary: string;
  generatedAt: Date;
}

// ─── Helper: count incidents within the last N hours ─────────────────────────
function incidentsInLastHours(incidents: Incident[], hours: number): Incident[] {
  const cutoff = Date.now() - hours * 3600_000;
  return incidents.filter((i) => new Date(i.created_at).getTime() > cutoff);
}

// ─── Helper: group incidents by location keyword ──────────────────────────────
function topLocations(incidents: Incident[]): string[] {
  const freq: Record<string, number> = {};
  incidents.forEach((i) => {
    const loc = i.location?.split(',')[0]?.trim() ?? 'Unknown';
    freq[loc] = (freq[loc] ?? 0) + 1;
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([loc]) => loc);
}

// ─── Helper: group incidents by type keyword in title ────────────────────────
function detectIncidentTypes(incidents: Incident[]): Record<string, number> {
  const types: Record<string, number> = {
    Fire: 0, Flood: 0, Storm: 0, Medical: 0, Infrastructure: 0, Other: 0,
  };
  incidents.forEach((i) => {
    const t = i.title?.toLowerCase() ?? '';
    if (t.includes('fire') || t.includes('blaze')) types.Fire++;
    else if (t.includes('flood') || t.includes('water')) types.Flood++;
    else if (t.includes('storm') || t.includes('cyclone') || t.includes('wind')) types.Storm++;
    else if (t.includes('medical') || t.includes('health') || t.includes('hospital')) types.Medical++;
    else if (t.includes('bridge') || t.includes('power') || t.includes('infra')) types.Infrastructure++;
    else types.Other++;
  });
  return types;
}

// ─── Main AI Engine ───────────────────────────────────────────────────────────
export function runAIAnalysis(
  incidents: Incident[],
  alerts: Alert[],
  resources: Resource[],
  weather: WeatherData | null,
  news: NewsArticle[]
): AIAnalysis {
  const activeIncidents     = incidents.filter((i) => i.status === 'active');
  const criticalIncidents   = activeIncidents.filter((i) => i.severity === 'critical');
  const highIncidents       = activeIncidents.filter((i) => i.severity === 'high');
  const medIncidents        = activeIncidents.filter((i) => i.severity === 'medium');
  const lowIncidents        = activeIncidents.filter((i) => i.severity === 'low');

  const availableResources  = resources.filter((r) => r.availability_status === 'available');
  const deployedResources   = resources.filter((r) => r.availability_status === 'deployed');
  const unreadAlerts        = alerts.filter((a) => !a.is_read);
  const criticalAlerts      = alerts.filter((a) => a.severity === 'critical');
  const recentIncidents     = incidentsInLastHours(incidents, 6);
  const olderIncidents      = incidentsInLastHours(incidents, 24).filter(
    (i) => !recentIncidents.find((r) => r.id === i.id)
  );
  const incidentTypes       = detectIncidentTypes(activeIncidents);
  const hotZones            = topLocations(activeIncidents);

  // ── Risk Score Calculation ─────────────────────────────────────────────────
  let score = 0;
  score += criticalIncidents.length * 22;
  score += highIncidents.length     * 12;
  score += medIncidents.length      *  5;
  score += lowIncidents.length      *  2;
  score += criticalAlerts.length    *  8;
  score += unreadAlerts.length      *  2;
  // Resource shortage penalty
  const resourceRatio = resources.length > 0
    ? availableResources.length / resources.length : 1;
  score += Math.round((1 - resourceRatio) * 15);
  // Spike penalty — if recent > older incidents
  if (recentIncidents.length > olderIncidents.length + 2) score += 10;
  
  // External Intelligence Penalties
  if (weather) {
    if (weather.isStormWarning) score += 15;
    else if (weather.windSpeed > 40) score += 8;
  }
  
  const disasterNewsCount = news.filter(n => 
    n.title.toLowerCase().match(/(flood|fire|storm|hurricane|earthquake|crisis|emergency)/)
  ).length;
  if (disasterNewsCount > 2) score += 5; // News sentiment penalty

  const riskScore = Math.min(100, Math.max(0, score));

  // ── Threat Level ───────────────────────────────────────────────────────────
  const threatLevel: ThreatLevel =
    riskScore >= 75 ? 'Critical' :
    riskScore >= 50 ? 'High'     :
    riskScore >= 25 ? 'Medium'   : 'Low';

  // ── Confidence: higher with more data ─────────────────────────────────────
  const dataPoints = incidents.length + alerts.length + resources.length;
  const overallConfidence = Math.min(97, 45 + dataPoints * 2);

  // ── Insight Generation ─────────────────────────────────────────────────────
  const insights: AIInsight[] = [];

  // Critical incident surge
  if (criticalIncidents.length > 0) {
    insights.push({
      id: 'critical-surge',
      type: 'danger',
      title: 'Critical Incident Surge Detected',
      description: `${criticalIncidents.length} critical incident${criticalIncidents.length > 1 ? 's are' : ' is'} currently active and require immediate emergency response.`,
      confidence: Math.min(95, 70 + criticalIncidents.length * 5),
    });
  }

  // Resource shortage
  if (activeIncidents.length > 0 && availableResources.length < activeIncidents.length) {
    const deficit = activeIncidents.length - availableResources.length;
    insights.push({
      id: 'resource-shortage',
      type: 'warning',
      title: 'Resource Deficit Predicted',
      description: `With ${activeIncidents.length} active incidents and only ${availableResources.length} available units, a shortage of ~${deficit} resource${deficit > 1 ? 's' : ''} is anticipated.`,
      confidence: Math.min(92, 60 + deficit * 6),
    });
  }

  // Incident spike detection
  if (recentIncidents.length > 2 && recentIncidents.length > olderIncidents.length) {
    insights.push({
      id: 'incident-spike',
      type: 'warning',
      title: 'Unusual Incident Spike',
      description: `${recentIncidents.length} incidents recorded in the last 6 hours — significantly above the baseline trend. Escalation protocols may be warranted.`,
      confidence: Math.min(90, 55 + recentIncidents.length * 5),
    });
  }

  // Dominant incident type
  const dominantType = Object.entries(incidentTypes)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])[0];
  if (dominantType && dominantType[1] > 0) {
    const pct = activeIncidents.length > 0
      ? Math.round((dominantType[1] / activeIncidents.length) * 100) : 0;
    insights.push({
      id: 'dominant-type',
      type: dominantType[0] === 'Fire' ? 'danger' : 'info',
      title: `${dominantType[0]}-Related Incidents Dominant`,
      description: `${dominantType[0]} incidents represent ${pct}% of all active events (${dominantType[1]} cases). Ensure specialized response teams are on standby.`,
      confidence: Math.min(93, 60 + pct),
    });
  }

  // High-risk geographic zones
  if (hotZones.length > 0 && activeIncidents.length > 1) {
    insights.push({
      id: 'geo-hotspot',
      type: 'warning',
      title: 'Geographic Risk Concentration',
      description: `Highest incident concentration detected in: ${hotZones.join(', ')}. Pre-positioning resources in these zones is recommended.`,
      confidence: Math.min(88, 58 + hotZones.length * 8),
    });
  }

  // Unread alert backlog
  if (unreadAlerts.length > 5) {
    insights.push({
      id: 'alert-backlog',
      type: 'warning',
      title: 'Alert Processing Backlog',
      description: `${unreadAlerts.length} alerts remain unacknowledged. Response time degradation of ~${Math.round(unreadAlerts.length * 1.5)} minutes is estimated if not reviewed immediately.`,
      confidence: Math.min(85, 50 + unreadAlerts.length * 3),
    });
  }

  // External Intelligence: Weather Insight
  if (weather && weather.isStormWarning) {
    insights.push({
      id: 'weather-storm',
      type: 'danger',
      title: 'Severe Weather Warning',
      description: `Storm conditions detected (Wind: ${weather.windSpeed}km/h). Expect an increase in weather-related incidents and resource deployment delays.`,
      confidence: 90,
    });
  }

  // External Intelligence: News Spike
  if (disasterNewsCount > 1) {
    insights.push({
      id: 'news-spike',
      type: 'info',
      title: 'Disaster News Sentiment Rising',
      description: `External news APIs report ${disasterNewsCount} new global disaster headlines. Monitor for cascading regional impacts.`,
      confidence: Math.min(100, 80 + disasterNewsCount * 2), // BUG-10: was unbounded, could exceed 100
    });
  }

  // Healthy state
  if (activeIncidents.length === 0) {
    insights.push({
      id: 'stable',
      type: 'success',
      title: 'Systems Nominal — No Active Incidents',
      description: 'All monitored zones are currently stable. Continue monitoring for any emerging threats.',
      confidence: 85,
    });
  }

  // ── Suggested Action ───────────────────────────────────────────────────────
  const suggestedAction =
    criticalIncidents.length > 0
      ? `Immediately dispatch ${Math.min(criticalIncidents.length * 2, availableResources.length)} available units to critical zones. Activate emergency command chain.`
      : availableResources.length < 3
      ? `Request ${3 - availableResources.length} additional resource units from neighboring districts. Maintain ${deployedResources.length} active deployments.`
      : unreadAlerts.length > 3
      ? `Clear the ${unreadAlerts.length}-alert backlog and confirm response status for all high-severity incidents.`
      : highIncidents.length > 0
      ? `Monitor ${highIncidents.length} high-severity incident${highIncidents.length > 1 ? 's' : ''} and pre-stage reserve units in hotspot zones.`
      : 'Maintain current deployment posture. Conduct routine status checks across all active units.';

  // ── Summary Sentence ──────────────────────────────────────────────────────
  const typeSummary = dominantType && dominantType[1] > 0
    ? `${dominantType[0]}-related incidents represent the primary threat category. ` : '';
  const resourceSummary = availableResources.length > 0
    ? `${availableResources.length} unit${availableResources.length > 1 ? 's' : ''} available for deployment.`
    : 'All units are currently deployed — request reinforcements immediately.';
  
  const weatherSummary = weather && weather.isStormWarning ? ' Severe weather compounding risk.' : '';

  const summary = activeIncidents.length === 0 && (!weather || !weather.isStormWarning)
    ? 'All zones are stable. No active incidents detected. System is monitoring in real-time.'
    : `${activeIncidents.length} active incident${activeIncidents.length > 1 ? 's' : ''} across ${hotZones.length || 1} zone${hotZones.length > 1 ? 's' : ''}.${weatherSummary} ${typeSummary}${resourceSummary}`;

  return {
    riskScore,
    threatLevel,
    suggestedAction,
    overallConfidence,
    insights,
    summary,
    generatedAt: new Date(),
  };
}
