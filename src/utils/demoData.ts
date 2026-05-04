import { supabase } from '../services/supabase';
import { logger } from './logger';

export async function loadDemoData() {
  logger.activity('Initiating Demo Data Load...');

  const locations = [
    { name: 'Sector 7G, Industrial Zone', lat: 40.7128, lon: -74.0060 },
    { name: 'Downtown Financial District', lat: 40.7074, lon: -74.0113 },
    { name: 'Northern Suburbs', lat: 40.8000, lon: -73.9500 },
    { name: 'Port Authority', lat: 40.7580, lon: -74.0000 },
    { name: 'Medical Center Complex', lat: 40.7420, lon: -73.9750 }
  ];

  const now = new Date();

  // 1. Generate Incidents
  const incidents = [
    { title: 'Multiple Vehicle Collision', location: locations[1].name, latitude: locations[1].lat, longitude: locations[1].lon, severity: 'high', status: 'active', created_at: new Date(now.getTime() - 1000 * 60 * 45).toISOString() },
    { title: 'Chemical Spill at Factory', location: locations[0].name, latitude: locations[0].lat, longitude: locations[0].lon, severity: 'critical', status: 'active', created_at: new Date(now.getTime() - 1000 * 60 * 15).toISOString() },
    { title: 'Power Outage - Grid B', location: locations[2].name, latitude: locations[2].lat, longitude: locations[2].lon, severity: 'medium', status: 'active', created_at: new Date(now.getTime() - 1000 * 60 * 120).toISOString() },
    { title: 'Flash Flooding', location: locations[3].name, latitude: locations[3].lat, longitude: locations[3].lon, severity: 'high', status: 'active', created_at: new Date(now.getTime() - 1000 * 60 * 30).toISOString() },
    { title: 'Structural Fire', location: locations[4].name, latitude: locations[4].lat, longitude: locations[4].lon, severity: 'critical', status: 'resolved', created_at: new Date(now.getTime() - 1000 * 60 * 240).toISOString() }
  ];

  const { error: incErr } = await supabase.from('incidents').insert(incidents);
  if (incErr) logger.error('Failed to load demo incidents', incErr);

  // 2. Generate Resources
  const resources = [
    { resource_name: 'Ambulance Unit A1', resource_type: 'Ambulance', availability_status: 'deployed', location: locations[1].name, updated_at: new Date().toISOString() },
    { resource_name: 'Ambulance Unit A2', resource_type: 'Ambulance', availability_status: 'available', location: 'HQ South', updated_at: new Date().toISOString() },
    { resource_name: 'Fire Truck F-99', resource_type: 'Fire Truck', availability_status: 'deployed', location: locations[0].name, updated_at: new Date().toISOString() },
    { resource_name: 'Hazmat Team Alpha', resource_type: 'Rescue Team', availability_status: 'deployed', location: locations[0].name, updated_at: new Date().toISOString() },
    { resource_name: 'Police Cruiser 12', resource_type: 'Police Unit', availability_status: 'available', location: locations[2].name, updated_at: new Date().toISOString() },
    { resource_name: 'Police Cruiser 14', resource_type: 'Police Unit', availability_status: 'maintenance', location: 'HQ Central', updated_at: new Date().toISOString() },
    { resource_name: 'Mobile Command Unit', resource_type: 'Relief Vehicle', availability_status: 'available', location: 'HQ Central', updated_at: new Date().toISOString() }
  ];

  const { error: resErr } = await supabase.from('resources').insert(resources);
  if (resErr) logger.error('Failed to load demo resources', resErr);

  // 3. Generate Alerts
  const alerts = [
    { message: 'Evacuation order issued for Sector 7G.', type: 'Warning', severity: 'critical', is_read: false, timestamp: new Date(now.getTime() - 1000 * 60 * 10).toISOString() },
    { message: 'Water levels rising at Port Authority.', type: 'Flood', severity: 'high', is_read: false, timestamp: new Date(now.getTime() - 1000 * 60 * 25).toISOString() },
    { message: 'Grid B power restoration estimated in 4 hours.', type: 'Infrastructure', severity: 'medium', is_read: true, timestamp: new Date(now.getTime() - 1000 * 60 * 60).toISOString() },
    { message: 'Weather warning: Severe thunderstorm approaching.', type: 'Storm', severity: 'medium', is_read: false, timestamp: new Date(now.getTime() - 1000 * 60 * 5).toISOString() }
  ];

  const { error: altErr } = await supabase.from('alerts').insert(alerts);
  if (altErr) logger.error('Failed to load demo alerts', altErr);

  if (!incErr && !resErr && !altErr) {
    logger.activity('Demo Data Load Complete');
    return true;
  }
  return false;
}
