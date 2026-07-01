import { NodeCoordinates, TriageTicket, Truck } from './types';

export const NASHIK_NODES: Record<string, NodeCoordinates> = {
  'Gangapur Road': {
    x: 200,
    y: 160,
    name: 'Gangapur Road',
    description: 'Upscale residential ward near Godavari. Green residential waste, commercial cafes.',
    typicalWaste: 'Organic & Recyclables'
  },
  'Panchavati': {
    x: 540,
    y: 130,
    name: 'Panchavati',
    description: 'Historic cultural hub. Dense footfall, heavy flowers, wet waste, and food stalls.',
    typicalWaste: 'Organic/Biodegradable'
  },
  'College Road': {
    x: 280,
    y: 280,
    name: 'College Road',
    description: 'Commercial & educational core. Plastic, paper, packaging, and commercial waste.',
    typicalWaste: 'Recyclables (Paper/Plastics)'
  },
  'Satpur': {
    x: 100,
    y: 340,
    name: 'Satpur (MIDC)',
    description: 'Heavy industrial estate. Manufacturing waste, packing materials, metal scrap, some chemicals.',
    typicalWaste: 'Hazardous & Debris'
  },
  'Cidco': {
    x: 320,
    y: 460,
    name: 'Cidco',
    description: 'Densely populated residential neighborhood. Large household dry & wet waste volume.',
    typicalWaste: 'Organic & Recyclable Mix'
  },
  'Indiranagar': {
    x: 480,
    y: 400,
    name: 'Indiranagar',
    description: 'Rapidly growing modern residential suburb. Household dry waste, garden waste.',
    typicalWaste: 'Organic & Recyclables'
  },
  'Nashik Road': {
    x: 700,
    y: 440,
    name: 'Nashik Road',
    description: 'Key transit gateway near Railway Station. Packaging, food wraps, high commuter garbage.',
    typicalWaste: 'Recyclables & Organic'
  }
};

// SVG road paths linking nodes
export const MAP_ROADS = [
  { from: 'Gangapur Road', to: 'Panchavati' },
  { from: 'Gangapur Road', to: 'College Road' },
  { from: 'College Road', to: 'Satpur' },
  { from: 'College Road', to: 'Cidco' },
  { from: 'Cidco', to: 'Indiranagar' },
  { from: 'Panchavati', to: 'Indiranagar' },
  { from: 'Indiranagar', to: 'Nashik Road' },
  { from: 'Panchavati', to: 'Nashik Road' },
  { from: 'Satpur', to: 'Cidco' }
];

export const INITIAL_TICKETS: TriageTicket[] = [
  {
    ticketId: 'NMC-2026-0701A',
    category: 'Hazardous',
    severityScore: 4,
    actionRequired: 'Deploy Hazardous Material collection vehicle and isolate area.',
    geographicNode: 'Satpur (MIDC)',
    isEmergency: false,
    timestamp: '2026-07-01T08:30:00Z',
    status: 'Pending',
    reportedBy: 'Rahul Shinde (Citizen)',
    description: 'Discarded battery packs and chemical cans found dumped behind Sector 4 industrial park.'
  },
  {
    ticketId: 'NMC-2026-0701B',
    category: 'Organic',
    severityScore: 3,
    actionRequired: 'Dispatch organic composter truck to empty market bins.',
    geographicNode: 'Panchavati',
    isEmergency: false,
    timestamp: '2026-07-01T09:15:00Z',
    status: 'Dispatched',
    reportedBy: 'Kiran Joshi (Vendor)',
    description: 'Vegetable waste bins overflowing near Ram Kund ghat, causing bad odour.',
    truckAssigned: 'Bio-Eater NMC-01'
  },
  {
    ticketId: 'NMC-2026-0701C',
    category: 'Construction Debris',
    severityScore: 5,
    actionRequired: 'Immediate dispatch of heavy loader and dumper truck to clear intersection.',
    geographicNode: 'Cidco',
    isEmergency: false,
    timestamp: '2026-07-01T10:05:00Z',
    status: 'Pending',
    reportedBy: 'Nisha Patil (Resident)',
    description: 'Large pile of bricks and concrete dust dumped overnight, blocking half of the primary lane.'
  },
  {
    ticketId: 'NMC-2026-0701D',
    category: 'Recyclable',
    severityScore: 2,
    actionRequired: 'Schedule dry waste collection.',
    geographicNode: 'College Road',
    isEmergency: false,
    timestamp: '2026-07-01T10:30:00Z',
    status: 'Resolved',
    reportedBy: 'Amit Mehta (Shopowner)',
    description: 'Massive stack of cardboard boxes and plastic bubble wraps near BYK college gate cleared.',
    truckAssigned: 'EcoCycle NMC-03'
  }
];

export const INITIAL_TRUCKS: Truck[] = [
  {
    id: 'T1',
    name: 'Bio-Eater NMC-01',
    type: 'Organic',
    status: 'Idle',
    currentLocation: { x: 540, y: 130 }, // Started at Panchavati
    capacity: 45
  },
  {
    id: 'T2',
    name: 'HazSafe NMC-02',
    type: 'Hazardous',
    status: 'Idle',
    currentLocation: { x: 100, y: 340 }, // Started at Satpur
    capacity: 10
  },
  {
    id: 'T3',
    name: 'EcoCycle NMC-03',
    type: 'Recyclable',
    status: 'Idle',
    currentLocation: { x: 280, y: 280 }, // Started at College Road
    capacity: 70
  },
  {
    id: 'T4',
    name: 'HeavyDump NMC-04',
    type: 'Construction Debris',
    status: 'Idle',
    currentLocation: { x: 320, y: 460 }, // Started at Cidco
    capacity: 0
  }
];

export const CIVIC_FAQs = [
  {
    question: 'How do I separate wet and dry waste?',
    answer: 'Wet waste (Organic) includes kitchen scrap, food leftovers, flowers, and garden clippings. Dry waste (Recyclable) includes paper, cardboard, plastics, clean metal foil, and glass. Keep them in separate green and blue bins respectively.'
  },
  {
    question: 'Where should I dispose of E-waste in Nashik?',
    answer: 'E-waste (batteries, old phones, bulb, wires) is Hazardous. You can report E-waste dumps here for specialized municipal collection, or take them to NMC-authorized E-waste drop centers in Satpur or Cidco.'
  },
  {
    question: 'What is the penalty for illegal commercial dumping?',
    answer: 'Under the Nashik Municipal Solid Waste Rules, illegal dumping of construction debris or commercial chemicals attracts fines starting from ₹5,000 up to ₹25,000, along with potential vehicle seizure.'
  }
];
