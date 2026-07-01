import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Truck as TruckIcon, AlertTriangle, ShieldAlert } from 'lucide-react';
import { NodeCoordinates, TriageTicket, Truck } from '../types';
import { NASHIK_NODES, MAP_ROADS } from '../data';

interface InteractiveMapProps {
  tickets: TriageTicket[];
  trucks: Truck[];
  selectedNode: string | null;
  onSelectNode: (nodeName: string) => void;
  activeRoute: string[] | null; // list of node names in optimized path
}

export default function InteractiveMap({
  tickets,
  trucks,
  selectedNode,
  onSelectNode,
  activeRoute
}: InteractiveMapProps) {
  // SVG size parameters
  const width = 800;
  const height = 550;

  // Find tickets by geographic node
  const getTicketsForNode = (nodeName: string) => {
    return tickets.filter(t => t.geographicNode.toLowerCase().includes(nodeName.toLowerCase()) && t.status !== 'Resolved');
  };

  return (
    <div className="relative bg-white border border-slate-200 rounded-xl p-5 shadow-sm overflow-hidden" id="nashik-interactive-map">
      <div className="flex flex-wrap items-center justify-between mb-4 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-850 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-ping"></span>
            Nashik Smart-Grid Waste Map
          </h3>
          <p className="text-xs text-slate-500 font-mono font-bold">Real-time GPS Dispatch & Ward Telemetry</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block opacity-75"></span>
            <span>HazMat</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block opacity-75"></span>
            <span>Debris</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block opacity-75"></span>
            <span>Recycle</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block opacity-75"></span>
            <span>Organic</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[700px] h-auto bg-slate-50 rounded-lg border border-slate-200"
        >
          {/* Background grid lines for a technical look */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(203, 213, 225, 0.4)" strokeWidth="1" />
            </pattern>
            <radialGradient id="map-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(79, 70, 229, 0.03)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </radialGradient>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" />
          <rect width={width} height={height} fill="url(#map-glow)" />

          {/* Draw Roads/Edges */}
          {MAP_ROADS.map((road, idx) => {
            const start = NASHIK_NODES[road.from];
            const end = NASHIK_NODES[road.to];
            if (!start || !end) return null;

            // Check if this road segment is part of the active optimized route
            const isOptimizedRouteSegment = activeRoute && (
              (activeRoute.includes(road.from) && activeRoute.includes(road.to) &&
               Math.abs(activeRoute.indexOf(road.from) - activeRoute.indexOf(road.to)) === 1)
            );

            return (
              <g key={`road-${idx}`}>
                {/* Outer shadow glow for active optimized route */}
                {isOptimizedRouteSegment && (
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="#4f46e5"
                    strokeWidth="6"
                    strokeLinecap="round"
                    className="opacity-20 blur-[2px]"
                  />
                )}
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={isOptimizedRouteSegment ? '#4f46e5' : '#cbd5e1'}
                  strokeWidth={isOptimizedRouteSegment ? '2.5' : '1.5'}
                  strokeDasharray={isOptimizedRouteSegment ? 'none' : '4 4'}
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          {/* Active Route animation path (moving dashed indicator) */}
          {activeRoute && activeRoute.length > 1 && (
            <g>
              {activeRoute.map((nodeName, idx) => {
                if (idx === activeRoute.length - 1) return null;
                const start = NASHIK_NODES[nodeName];
                const end = NASHIK_NODES[activeRoute[idx + 1]];
                if (!start || !end) return null;

                return (
                  <line
                    key={`route-flow-${idx}`}
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="#6366f1"
                    strokeWidth="2"
                    strokeDasharray="8 8"
                    strokeLinecap="round"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="100;0"
                      dur="5s"
                      repeatCount="indefinite"
                    />
                  </line>
                );
              })}
            </g>
          )}

          {/* Draw Pulse Hazards on Wards */}
          {tickets.map((ticket) => {
            if (ticket.status === 'Resolved') return null;
            // Find the node corresponding to the ticket location
            const matchedNodeName = Object.keys(NASHIK_NODES).find(name =>
              ticket.geographicNode.toLowerCase().includes(name.toLowerCase())
            );
            if (!matchedNodeName) return null;
            const node = NASHIK_NODES[matchedNodeName];

            // Color-coded by Waste Type
            let color = '#ef4444'; // Hazardous = Red
            if (ticket.category === 'Organic') color = '#10b981'; // Green
            if (ticket.category === 'Recyclable') color = '#3b82f6'; // Blue
            if (ticket.category === 'Construction Debris') color = '#f59e0b'; // Amber

            // Radius scales based on severity
            const baseRadius = 12 + ticket.severityScore * 3;

            return (
              <g key={`ticket-hazard-${ticket.ticketId}`} className="pointer-events-none">
                {/* Triple concentric pulsing rings */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={baseRadius * 1.5}
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  className="animate-ping opacity-30"
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={baseRadius}
                  fill={color}
                  className="opacity-15"
                />
              </g>
            );
          })}

          {/* Draw Ward Nodes */}
          {Object.values(NASHIK_NODES).map((node) => {
            const nodeTickets = getTicketsForNode(node.name);
            const hasUnresolved = nodeTickets.length > 0;
            const isSelected = selectedNode === node.name;

            // Highlight color based on the highest severity ticket in this node
            const maxSeverityTicket = nodeTickets.reduce((max, t) => t.severityScore > max.severityScore ? t : max, { severityScore: 0 });
            let nodeBorderColor = isSelected ? '#4f46e5' : '#94a3b8';
            if (hasUnresolved) {
              if (maxSeverityTicket.severityScore >= 4) nodeBorderColor = '#ef4444';
              else nodeBorderColor = '#f59e0b';
            }

            return (
              <g
                key={`node-${node.name}`}
                className="cursor-pointer group"
                onClick={() => onSelectNode(node.name)}
              >
                {/* Outer halo on select/hover */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? 18 : 14}
                  fill="#f8fafc"
                  stroke={nodeBorderColor}
                  strokeWidth={isSelected ? '3' : '2'}
                  className="transition-all duration-300 group-hover:stroke-indigo-600"
                />

                {/* Inner dot */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="5"
                  fill={hasUnresolved ? (maxSeverityTicket.severityScore >= 4 ? '#ef4444' : '#f59e0b') : '#10b981'}
                  className={hasUnresolved ? "animate-pulse" : ""}
                />

                {/* Node Labels */}
                <text
                  x={node.x}
                  y={node.y - (isSelected ? 24 : 18)}
                  textAnchor="middle"
                  fill={isSelected ? '#4f46e5' : '#475569'}
                  fontSize={isSelected ? '12' : '11'}
                  fontWeight={isSelected ? '700' : '600'}
                  className="font-sans select-none transition-all duration-300 pointer-events-none"
                >
                  {node.name}
                </text>

                {/* Mini Ticket Indicator bubble */}
                {hasUnresolved && (
                  <g transform={`translate(${node.x + 12}, ${node.y - 12})`}>
                    <circle r="8" fill="#ef4444" />
                    <text
                      textAnchor="middle"
                      y="3"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      className="font-sans select-none pointer-events-none"
                    >
                      {nodeTickets.length}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Draw Trucks on the Map with Framer Motion for smooth transit */}
          {trucks.map((truck) => {
            // Custom SVG icon coordinates
            return (
              <motion.g
                key={`truck-${truck.id}`}
                initial={{ x: truck.currentLocation.x, y: truck.currentLocation.y }}
                animate={{ x: truck.currentLocation.x, y: truck.currentLocation.y }}
                transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                className="pointer-events-none"
              >
                {/* Truck Marker Glow */}
                <circle r="14" fill="rgba(255, 255, 255, 0.95)" stroke="#4f46e5" strokeWidth="1.5" className="shadow-sm" />
                
                {/* Truck Classification Halo */}
                <circle r="10" fill="none" stroke={
                  truck.type === 'Hazardous' ? '#ef4444' : 
                  truck.type === 'Construction Debris' ? '#f59e0b' : 
                  truck.type === 'Recyclable' ? '#3b82f6' : '#10b981'
                } strokeWidth="1.5" />

                {/* Small indicator based on state */}
                <g transform="translate(0, -2)">
                  <path
                    d="M-6,2 L-6,-4 L2,-4 L6,0 L6,4 L4,4 L4,2"
                    fill="none"
                    stroke={
                      truck.type === 'Hazardous' ? '#ef4444' : 
                      truck.type === 'Construction Debris' ? '#f59e0b' : 
                      truck.type === 'Recyclable' ? '#3b82f6' : '#10b981'
                    }
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Wheels */}
                  <circle cx="-3" cy="5" r="1.5" fill="#64748b" />
                  <circle cx="3" cy="5" r="1.5" fill="#64748b" />
                </g>

                {/* Truck Badge/Label */}
                <g transform="translate(0, 16)">
                  <rect
                    x="-24"
                    y="-6"
                    width="48"
                    height="11"
                    rx="2"
                    fill="#1e293b"
                    stroke="#475569"
                    strokeWidth="1"
                  />
                  <text
                    textAnchor="middle"
                    fontSize="7"
                    fontWeight="bold"
                    fill="#f8fafc"
                    className="font-mono"
                  >
                    {truck.id}:{truck.status === 'Idle' ? 'IDLE' : 'BUSY'}
                  </text>
                </g>
              </motion.g>
            );
          })}
        </svg>

        {/* Map Information Panel overlay */}
        {selectedNode && NASHIK_NODES[selectedNode] && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 border border-slate-200 backdrop-blur-md rounded-lg p-4 flex items-center justify-between gap-4 shadow-md">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-indigo-50 rounded text-indigo-700 mt-0.5 border border-indigo-100">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{selectedNode} Ward</h4>
                <p className="text-xs text-slate-600 leading-snug">{NASHIK_NODES[selectedNode].description}</p>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">
                    Node: {NASHIK_NODES[selectedNode].x}, {NASHIK_NODES[selectedNode].y}
                  </span>
                  <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold">
                    Waste: {NASHIK_NODES[selectedNode].typicalWaste}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onSelectNode(selectedNode)}
              className="text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded whitespace-nowrap transition-colors shadow-sm cursor-pointer"
            >
              Report Here
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
