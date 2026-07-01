export type WasteCategory = 'Organic' | 'Recyclable' | 'Hazardous' | 'Construction Debris';

export interface TriageTicket {
  ticketId: string;
  category: WasteCategory;
  severityScore: number; // 1 to 5
  actionRequired: string;
  geographicNode: string; // Landmark or area in Nashik (e.g., College Road, Cidco, Panchavati)
  isEmergency: boolean;
  timestamp: string;
  status: 'Pending' | 'Dispatched' | 'Resolved';
  reportedBy: string;
  description: string;
  imageUrl?: string; // base64 or object URL of trash
  truckAssigned?: string; // name of the dispatch vehicle
}

export interface NodeCoordinates {
  x: number;
  y: number;
  name: string;
  description: string;
  typicalWaste: string;
}

export interface Truck {
  id: string;
  name: string;
  type: WasteCategory;
  status: 'Idle' | 'En Route' | 'On Site' | 'Returning';
  currentLocation: { x: number; y: number };
  targetLocation?: { x: number; y: number };
  assignedTicketId?: string;
  capacity: number; // 0 to 100%
}

export interface GeminiTriageResponse {
  ticketId: string;
  category: WasteCategory;
  severityScore: number;
  actionRequired: string;
  geographicNode: string;
  isEmergency: boolean;
  responseMessage: string;
  isUnrelated: boolean;
}
