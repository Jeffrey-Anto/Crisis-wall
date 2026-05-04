export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type UserRole = 'admin' | 'responder' | 'viewer';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Incident {
  id: string;
  title: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  severity: Severity;
  status: string;
  created_at: string;
}

export interface Alert {
  id: string;
  message: string;
  type: string | null;
  severity: Severity;
  is_read: boolean;
  timestamp: string;
}

export type ResourceStatus = 'available' | 'deployed' | 'maintenance' | 'offline';
export type ResourceType = 'Ambulance' | 'Fire Truck' | 'Police Unit' | 'Medical Team' | 'Rescue Team' | 'Relief Vehicle';

export interface Resource {
  id: string;
  resource_name: string;
  resource_type: ResourceType | null;
  availability_status: ResourceStatus;
  location: string | null;
  assigned_incident_id: string | null;
  updated_at: string;
}
