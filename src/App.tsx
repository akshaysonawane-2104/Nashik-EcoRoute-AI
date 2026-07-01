import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Leaf, Users, Settings, ShieldAlert, Layers, MapPin, 
  Activity, Info, CheckCircle, Database, AlertCircle, PhoneCall
} from 'lucide-react';

import InteractiveMap from './components/InteractiveMap';
import CitizenPortal from './components/CitizenPortal';
import MunicipalDashboard from './components/MunicipalDashboard';

import { TriageTicket, Truck } from './types';
import { INITIAL_TICKETS, INITIAL_TRUCKS, NASHIK_NODES } from './data';

export default function App() {
  const [role, setRole] = useState<'citizen' | 'municipal'>('citizen');
  const [tickets, setTickets] = useState<TriageTicket[]>(INITIAL_TICKETS);
  const [trucks, setTrucks] = useState<Truck[]>(INITIAL_TRUCKS);
  const [selectedMapNode, setSelectedMapNode] = useState<string | null>(null);
  const [activeRoute, setActiveRoute] = useState<string[] | null>(null);
  const [systemAlert, setSystemAlert] = useState<string | null>(
    "Notice: Nashik EcoRoute Smart Grid active. Connect GEMINI_API_KEY for vision-based hazard classification."
  );

  // Add new ticket from citizen reporter
  const handleNewTicketCreated = (newTicket: TriageTicket) => {
    setTickets(prev => [newTicket, ...prev]);
    
    // Set system alert if it's an emergency
    if (newTicket.isEmergency) {
      setSystemAlert(`⚠️ CRITICAL EMERGENCY FLAGGED at ${newTicket.geographicNode}! Contacting emergency response units.`);
    } else {
      setSystemAlert(`ℹ️ New ${newTicket.category} ticket registered at ${newTicket.geographicNode || 'Nashik General'}.`);
    }

    // Auto-select node on the map to highlight where it happened!
    const matchedNode = Object.keys(NASHIK_NODES).find(name =>
      newTicket.geographicNode.toLowerCase().includes(name.toLowerCase())
    );
    if (matchedNode) {
      setSelectedMapNode(matchedNode);
    }
  };

  // Map Node selection callback
  const handleSelectMapNode = (nodeName: string) => {
    setSelectedMapNode(nodeName);
  };

  // Assign Truck Manually
  const handleAssignTruck = (ticketId: string, truckId: string) => {
    const ticket = tickets.find(t => t.ticketId === ticketId);
    if (!ticket) return;

    setTickets(prev => prev.map(t => {
      if (t.ticketId === ticketId) {
        return {
          ...t,
          status: 'Dispatched',
          truckAssigned: trucks.find(tr => tr.id === truckId)?.name
        };
      }
      return t;
    }));

    setTrucks(prev => prev.map(tr => {
      if (tr.id === truckId) {
        return {
          ...tr,
          status: 'En Route',
          assignedTicketId: ticketId,
          targetLocation: { 
            x: NASHIK_NODES[ticket.geographicNode]?.x || tr.currentLocation.x, 
            y: NASHIK_NODES[ticket.geographicNode]?.y || tr.currentLocation.y 
          }
        };
      }
      return tr;
    }));

    setSystemAlert(`🚚 Dispatched vehicle ${truckId} to ${ticket.geographicNode} for immediate collection.`);
  };

  // Auto-Optimize dispatch routes (AI Engine Simulator)
  const handleOptimizeRoutes = () => {
    // Find all nodes that have pending tickets
    const activeTicketNodes = tickets
      .filter(t => t.status === 'Pending')
      .map(t => {
        return Object.keys(NASHIK_NODES).find(name =>
          t.geographicNode.toLowerCase().includes(name.toLowerCase())
        );
      })
      .filter((v): v is string => !!v);

    if (activeTicketNodes.length === 0) {
      setActiveRoute(['Satpur', 'College Road', 'Cidco', 'Indiranagar', 'Panchavati']);
      setSystemAlert("ℹ️ Routing network optimized. No active pending tickets found; demonstrating dry run route.");
      return;
    }

    // Create unique optimized path sorted geographically (West-to-East)
    const uniqueNodes: string[] = Array.from(new Set(activeTicketNodes));
    const sortedNodes = uniqueNodes.sort((a, b) => NASHIK_NODES[a].x - NASHIK_NODES[b].x);
    
    // Add return-to-base or start-depot nodes to enrich path flow
    if (!sortedNodes.includes('College Road')) sortedNodes.unshift('College Road');
    
    setActiveRoute(sortedNodes);

    // Auto assign trucks to matching pending categories
    let assignmentsCount = 0;
    setTickets(prevTickets => prevTickets.map(t => {
      if (t.status === 'Pending') {
        const matchingTruck = trucks.find(tr => tr.type === t.category && tr.status === 'Idle');
        if (matchingTruck) {
          assignmentsCount++;
          // Set truck en route
          setTrucks(prevTrucks => prevTrucks.map(tr => {
            if (tr.id === matchingTruck.id) {
              const matchedNodeKey = Object.keys(NASHIK_NODES).find(name =>
                t.geographicNode.toLowerCase().includes(name.toLowerCase())
              ) || 'Panchavati';
              
              return {
                ...tr,
                status: 'En Route',
                assignedTicketId: t.ticketId,
                targetLocation: { 
                  x: NASHIK_NODES[matchedNodeKey]?.x || tr.currentLocation.x, 
                  y: NASHIK_NODES[matchedNodeKey]?.y || tr.currentLocation.y 
                }
              };
            }
            return tr;
          }));

          return {
            ...t,
            status: 'Dispatched',
            truckAssigned: matchingTruck.name
          };
        }
      }
      return t;
    }));

    setSystemAlert(`✨ AI EcoRoute engine optimized! Assigned ${assignmentsCount} municipal dispatch routes automatically.`);
  };

  // Simulate truck arriving at the spot
  const handleSimulateDispatch = (truckId: string) => {
    setTrucks(prev => prev.map(t => {
      if (t.id === truckId && t.status === 'En Route' && t.targetLocation) {
        return {
          ...t,
          status: 'On Site',
          currentLocation: t.targetLocation, // move truck icon on map to target location
        };
      }
      return t;
    }));
    setSystemAlert(`📍 Vehicle ${truckId} has arrived on-site and commenced municipal waste clearance.`);
  };

  // Resolve Ticket and free the truck
  const handleResolveTicket = (ticketId: string) => {
    const ticket = tickets.find(t => t.ticketId === ticketId);
    if (!ticket) return;

    setTickets(prev => prev.map(t => {
      if (t.ticketId === ticketId) {
        return { ...t, status: 'Resolved' };
      }
      return t;
    }));

    // Find assigned truck
    const assignedTruck = trucks.find(tr => tr.assignedTicketId === ticketId);
    if (assignedTruck) {
      setTrucks(prev => prev.map(tr => {
        if (tr.id === assignedTruck.id) {
          return {
            ...tr,
            status: 'Idle',
            assignedTicketId: undefined,
            targetLocation: undefined,
            capacity: Math.min(100, tr.capacity + 20) // load increment
          };
        }
        return tr;
      }));
    }

    setSystemAlert(`✅ Success: Ticket ${ticketId} resolved. Ward hazard cleared.`);
  };

  // Flush resolved tickets from view
  const handleClearAllResolved = () => {
    setTickets(prev => prev.filter(t => t.status !== 'Resolved'));
    setSystemAlert("🗑️ Flushed resolved records from memory database.");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Professional Header - Geometric Balance style */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-50 px-4 sm:px-8 flex items-center shadow-sm">
        <div className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-700 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
              N
            </div>
            <div>
              <h1 className="font-bold text-md sm:text-base leading-tight text-slate-850 flex items-center gap-2">
                Nashik EcoRoute AI
                <span className="text-[9px] uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200/55 px-1.5 py-0.5 rounded font-mono font-bold">NMC Admin v3.5</span>
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Municipal Triage System &bull; Powered by Google AI</p>
            </div>
          </div>

          {/* Role selection switches with crisp geometric borders */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-sm">
            <button
              onClick={() => setRole('citizen')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                role === 'citizen' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Citizen Portal
            </button>
            <button
              onClick={() => setRole('municipal')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                role === 'municipal' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              NMC Control Command
            </button>
          </div>
        </div>
      </header>

      {/* Real-time Ticker system alert in high-contrast Geometric style */}
      {systemAlert && (
        <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2 text-center text-[11px] font-semibold text-indigo-800 flex items-center justify-center gap-2">
          <Activity className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
          <span className="truncate">{systemAlert}</span>
          <button 
            onClick={() => setSystemAlert(null)} 
            className="text-indigo-400 hover:text-indigo-600 ml-2 text-xs font-bold font-mono"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Body Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Hand: Adaptive Panel depending on Active role */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {role === 'citizen' ? (
              <motion.div
                key="citizen-portal"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
              >
                <CitizenPortal 
                  onNewTicketCreated={handleNewTicketCreated}
                  selectedMapNode={selectedMapNode}
                  onSelectMapNode={handleSelectMapNode}
                />
              </motion.div>
            ) : (
              <motion.div
                key="municipal-dashboard"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
              >
                <MunicipalDashboard 
                  tickets={tickets}
                  trucks={trucks}
                  onAssignTruck={handleAssignTruck}
                  onOptimizeRoutes={handleOptimizeRoutes}
                  onSimulateDispatch={handleSimulateDispatch}
                  onResolveTicket={handleResolveTicket}
                  onClearAllResolved={handleClearAllResolved}
                  onSelectMapNode={handleSelectMapNode}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Hand: Ever-present interactive GPS Map cockpit */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="sticky top-20">
            <InteractiveMap 
              tickets={tickets}
              trucks={trucks}
              selectedNode={selectedMapNode}
              onSelectNode={handleSelectMapNode}
              activeRoute={activeRoute}
            />

            {/* Quick Emergency Hotline Bypass in Light Geometric Style */}
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 text-red-700 rounded-lg">
                  <ShieldAlert className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">NMC Waste Emergency Hotline</h4>
                  <p className="text-[10px] text-slate-500">Immediate reporting of toxic spills, fires, or blockages</p>
                </div>
              </div>
              <a 
                href="tel:101" 
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-1.5 px-3 rounded shadow-sm flex items-center gap-1 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Call 101
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Municipal Credentials Footer */}
      <footer className="h-12 bg-slate-900 text-slate-400 px-6 sm:px-8 flex items-center justify-between text-[10px] uppercase font-bold tracking-[0.15em] shrink-0 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          <span>Vertex AI Instance &bull; Nashik Municipal Corporation</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> NMC System Live</span>
          <span className="hidden sm:inline">Last Sync: 14:32:01 IST</span>
        </div>
      </footer>
    </div>
  );
}
