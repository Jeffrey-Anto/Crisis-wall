import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// manually load .env.local
const envContent = fs.readFileSync(join(__dirname, '.env.local'), 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
  }
});

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials in .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function reseed() {
  console.log('Clearing old data...');
  await supabase.from('incidents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('alerts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('resources').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log('Inserting global demo data...');
  const locations = [
    { name: 'Mumbai, India', lat: 19.0760, lon: 72.8777 },
    { name: 'New York, USA', lat: 40.7128, lon: -74.0060 },
    { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
    { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
    { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093 },
    { name: 'Dubai, UAE', lat: 25.2048, lon: 55.2708 }
  ];

  const now = new Date();

  const incidents = [
    { title: 'Chemical Spill at Factory', location: locations[0].name, latitude: locations[0].lat, longitude: locations[0].lon, severity: 'critical', status: 'active', created_at: new Date(now.getTime() - 1000 * 60 * 15).toISOString() },
    { title: 'Multiple Vehicle Collision', location: locations[1].name, latitude: locations[1].lat, longitude: locations[1].lon, severity: 'high', status: 'active', created_at: new Date(now.getTime() - 1000 * 60 * 45).toISOString() },
    { title: 'Power Outage - Grid B', location: locations[2].name, latitude: locations[2].lat, longitude: locations[2].lon, severity: 'medium', status: 'active', created_at: new Date(now.getTime() - 1000 * 60 * 120).toISOString() },
    { title: 'Flash Flooding', location: locations[3].name, latitude: locations[3].lat, longitude: locations[3].lon, severity: 'high', status: 'active', created_at: new Date(now.getTime() - 1000 * 60 * 30).toISOString() },
    { title: 'Structural Fire', location: locations[4].name, latitude: locations[4].lat, longitude: locations[4].lon, severity: 'critical', status: 'resolved', created_at: new Date(now.getTime() - 1000 * 60 * 240).toISOString() },
    { title: 'Port Disruption', location: locations[5].name, latitude: locations[5].lat, longitude: locations[5].lon, severity: 'medium', status: 'investigating', created_at: new Date(now.getTime() - 1000 * 60 * 10).toISOString() }
  ];

  const { error: incErr } = await supabase.from('incidents').insert(incidents);
  if (incErr) console.error('Failed to load demo incidents', incErr);

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
  if (resErr) console.error('Failed to load demo resources', resErr);

  const alerts = [
    { message: 'Evacuation order issued for Sector 7G.', type: 'Warning', severity: 'critical', is_read: false, timestamp: new Date(now.getTime() - 1000 * 60 * 10).toISOString() },
    { message: 'Water levels rising at Port Authority.', type: 'Flood', severity: 'high', is_read: false, timestamp: new Date(now.getTime() - 1000 * 60 * 25).toISOString() },
    { message: 'Grid B power restoration estimated in 4 hours.', type: 'Infrastructure', severity: 'medium', is_read: true, timestamp: new Date(now.getTime() - 1000 * 60 * 60).toISOString() },
    { message: 'Weather warning: Severe thunderstorm approaching.', type: 'Storm', severity: 'medium', is_read: false, timestamp: new Date(now.getTime() - 1000 * 60 * 5).toISOString() }
  ];

  const { error: altErr } = await supabase.from('alerts').insert(alerts);
  if (altErr) console.error('Failed to load demo alerts', altErr);

  console.log('Reseed successful!');
}

reseed();
