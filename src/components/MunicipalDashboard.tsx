import React, { useState } from 'react';
import { 
  Truck as TruckIcon, ShieldAlert, CheckCircle, Clock, Sparkles, 
  ChevronRight, RefreshCw, Send, Code, Layers, Trash2, MapPin
} from 'lucide-react';
import { TriageTicket, Truck, WasteCategory } from '../types';
import { NASHIK_NODES } from '../data';

interface MunicipalDashboardProps {
  tickets: TriageTicket[];
  trucks: Truck[];
  onAssignTruck: (ticketId: string, truckId: string) => void;
  onOptimizeRoutes: () => void;
  onSimulateDispatch: (truckId: string) => void;
  onResolveTicket: (ticketId: string) => void;
  onClearAllResolved: () => void;
  onSelectMapNode: (nodeName: string) => void;
}

export default function MunicipalDashboard({
  tickets,
  trucks,
  onAssignTruck,
  onOptimizeRoutes,
  onSimulateDispatch,
  onResolveTicket,
  onClearAllResolved,
  onSelectMapNode
}: MunicipalDashboardProps) {
  const [selectedTicketForJson, setSelectedTicketForJson] = useState<TriageTicket | null>(
    tickets.length > 0 ? tickets[0] : null
  );

  const [activeTab, setActiveTab] = useState<'tickets' | 'fleet' | 'json'>('tickets');

  // KPI Calculations
  const activeTickets = tickets.filter(t => t.status !== 'Resolved');
  const dispatchedTickets = tickets.filter(t => t.status === 'Dispatched');
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;
  const hazardAlerts = activeTickets.filter(t => t.category === 'Hazardous' || t.severityScore >= 4).length;
  
  const resolutionRate = tickets.length > 0 
    ? Math.round((resolvedCount / tickets.length) * 100) 
    : 100;

  // Group tickets by category for small stats chart
  const categories: WasteCategory[] = ['Organic', 'Recyclable', 'Hazardous', 'Construction Debris'];
  const categoryStats = categories.map(cat => {
    const count = tickets.filter(t => t.category === cat).length;
    const active = tickets.filter(t => t.category === cat && t.status !== 'Resolved').length;
    return { name: cat, count, active };
  });

  return (
    <div className="space-y-6" id="municipal-dashboard">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Active Complaints */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Pending Tickets</span>
            <span className="text-2xl font-bold text-slate-800">{activeTickets.length}</span>
            <span className="text-[10px] text-indigo-600 block mt-1 font-mono font-bold">⚡ NMC Smart Grid</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Active Dispatches */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">En Route Fleet</span>
            <span className="text-2xl font-bold text-slate-800">{dispatchedTickets.length}</span>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">Active tracking</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
            <TruckIcon className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Hazards Identified */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Hazards Active</span>
            <span className="text-2xl font-bold text-red-600">{hazardAlerts}</span>
            <span className="text-[10px] text-red-500 block mt-1 font-mono font-bold">Immediate isolation</span>
          </div>
          <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Resolution metrics */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Resolution Rate</span>
            <span className="text-2xl font-bold text-emerald-600">{resolutionRate}%</span>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">{resolvedCount} cleared cases</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Management Tools & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Operations Center with tabs */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            {/* Header with quick actions */}
            <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  NMC Dispatch & Operations Control
                </h3>
                <p className="text-xs text-slate-500">Optimize municipal response, allocate composter vehicles, and track clear rate.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onOptimizeRoutes}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded transition-colors cursor-pointer shadow-sm uppercase tracking-wider"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI EcoRoute Optimize
                </button>
                <button
                  onClick={onClearAllResolved}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs py-2 px-3 rounded transition-colors cursor-pointer uppercase tracking-wider"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Flush Resolved
                </button>
              </div>
            </div>

            {/* Dashboard Tabs */}
            <div className="flex border-b border-slate-200 text-xs font-bold px-4 gap-4 bg-slate-50">
              <button
                onClick={() => setActiveTab('tickets')}
                className={`py-3 px-2 border-b-2 transition-colors cursor-pointer ${activeTab === 'tickets' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Citizen Complaints ({activeTickets.length} Active)
              </button>
              <button
                onClick={() => setActiveTab('fleet')}
                className={`py-3 px-2 border-b-2 transition-colors cursor-pointer ${activeTab === 'fleet' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Collection Fleet ({trucks.length} Trucks)
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`py-3 px-2 border-b-2 transition-colors cursor-pointer ${activeTab === 'json' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                NMC API JSON Feed (Protocol 4)
              </button>
            </div>

            {/* Tab content area */}
            <div className="p-5">
              {/* TICKETS TAB */}
              {activeTab === 'tickets' && (
                <div className="space-y-4">
                  {tickets.length === 0 ? (
                    <div className="text-center py-12 text-slate-450 italic">
                      No citizen reports registered yet. Use the Citizen Portal to file complaints!
                    </div>
                  ) : (
                    <div className="overflow-x-auto scrollbar-thin">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-mono">
                            <th className="pb-3 pr-2 font-bold uppercase tracking-wider">ID</th>
                            <th className="pb-3 pr-2 font-bold uppercase tracking-wider">Hazard/Type</th>
                            <th className="pb-3 pr-2 font-bold uppercase tracking-wider">Ward Location</th>
                            <th className="pb-3 pr-2 font-bold uppercase tracking-wider">Severity</th>
                            <th className="pb-3 pr-2 font-bold uppercase tracking-wider">Status</th>
                            <th className="pb-3 text-right font-bold uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {tickets.map((ticket) => {
                            let categoryBadgeColor = 'bg-red-50 text-red-700 border border-red-100';
                            if (ticket.category === 'Organic') categoryBadgeColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
                            if (ticket.category === 'Recyclable') categoryBadgeColor = 'bg-blue-50 text-blue-700 border border-blue-100';
                            if (ticket.category === 'Construction Debris') categoryBadgeColor = 'bg-amber-50 text-amber-700 border border-amber-100';

                            return (
                              <tr 
                                key={ticket.ticketId} 
                                className={`group hover:bg-slate-50 transition-colors ${selectedTicketForJson?.ticketId === ticket.ticketId ? 'bg-indigo-50/40' : ''}`}
                                onClick={() => setSelectedTicketForJson(ticket)}
                              >
                                <td className="py-3 font-mono font-bold text-slate-800 select-all cursor-pointer">
                                  {ticket.ticketId}
                                </td>
                                <td className="py-3 pr-2">
                                  <div className="flex flex-col">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold w-fit mb-0.5 ${categoryBadgeColor}`}>
                                      {ticket.category}
                                    </span>
                                    <span className="text-[10px] text-slate-500 max-w-[180px] truncate">{ticket.description}</span>
                                  </div>
                                </td>
                                <td className="py-3 pr-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectMapNode(ticket.geographicNode);
                                    }}
                                    className="flex items-center gap-1 text-slate-700 hover:text-indigo-600 text-left font-bold transition-colors"
                                  >
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    {ticket.geographicNode}
                                  </button>
                                </td>
                                <td className="py-3 pr-2">
                                  <div className="flex items-center gap-1">
                                    <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full ${ticket.severityScore >= 4 ? 'bg-red-500' : 'bg-amber-500'}`} 
                                        style={{ width: `${ticket.severityScore * 20}%` }}
                                      ></div>
                                    </div>
                                    <span className="font-mono font-bold text-[11px] text-slate-700">{ticket.severityScore}/5</span>
                                  </div>
                                </td>
                                <td className="py-3 pr-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                    ticket.status === 'Dispatched' ? 'bg-blue-100 text-blue-800 border border-blue-200 animate-pulse' :
                                    'bg-amber-100 text-amber-800 border border-amber-200'
                                  }`}>
                                    {ticket.status}
                                  </span>
                                </td>
                                <td className="py-3 text-right">
                                  <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                    {ticket.status === 'Pending' && (
                                      <div className="relative group/actions inline-block">
                                        <select
                                          onChange={(e) => onAssignTruck(ticket.ticketId, e.target.value)}
                                          value=""
                                          className="bg-white border border-slate-200 hover:border-indigo-500 text-[11px] font-bold text-indigo-700 rounded px-2 py-1 focus:outline-none transition-colors cursor-pointer"
                                        >
                                          <option value="">Assign Truck...</option>
                                          {trucks
                                            .filter(t => t.type === ticket.category && t.status === 'Idle')
                                            .map(t => (
                                              <option key={t.id} value={t.id}>{t.name}</option>
                                            ))
                                          }
                                        </select>
                                      </div>
                                    )}
                                    {ticket.status === 'Dispatched' && (
                                      <button
                                        onClick={() => {
                                          onResolveTicket(ticket.ticketId);
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2 py-1 rounded transition-colors cursor-pointer shadow-sm"
                                      >
                                        Mark Collected
                                      </button>
                                    )}
                                    {ticket.status === 'Resolved' && (
                                      <span className="text-slate-400 text-[10px] italic">Cleared</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* FLEET TAB */}
              {activeTab === 'fleet' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trucks.map((truck) => {
                    let typeBadgeColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
                    if (truck.type === 'Hazardous') typeBadgeColor = 'bg-red-50 text-red-700 border border-red-100';
                    if (truck.type === 'Recyclable') typeBadgeColor = 'bg-blue-50 text-blue-700 border border-blue-100';
                    if (truck.type === 'Construction Debris') typeBadgeColor = 'bg-amber-50 text-amber-700 border border-amber-100';

                    return (
                      <div key={truck.id} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between hover:border-indigo-400 transition-all shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-slate-100 rounded text-slate-600 border border-slate-200">
                              <TruckIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-800">{truck.name}</h4>
                              <span className="text-[10px] font-mono text-slate-400 font-bold">ID: {truck.id}</span>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            truck.status === 'Idle' ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                            'bg-blue-100 text-blue-800 border border-blue-200 animate-pulse'
                          }`}>
                            {truck.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mb-3 bg-slate-50 p-2.5 rounded border border-slate-100">
                          <div>Type: <span className="text-slate-700 font-bold">{truck.type}</span></div>
                          <div>Load: <span className="text-slate-700 font-bold">{truck.capacity}%</span></div>
                          {truck.assignedTicketId && (
                            <div className="col-span-2">Task: <span className="text-indigo-600 font-bold select-all">{truck.assignedTicketId}</span></div>
                          )}
                        </div>

                        {truck.status === 'En Route' && (
                          <button
                            onClick={() => onSimulateDispatch(truck.id)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-1.5 rounded transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm uppercase tracking-wider"
                          >
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Simulate Route Collection
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* API JSON TAB (Protocol 4 Requirement) */}
              {activeTab === 'json' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <span className="text-xs font-mono font-bold text-indigo-600 flex items-center gap-1">
                      <Code className="w-4 h-4" />
                      Protocol 4: Automated Municipal System Integration Block
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">FORMAT: Strict JSON Payload</span>
                  </div>
                  {selectedTicketForJson ? (
                    <div className="space-y-3">
                      <p className="text-[11px] text-slate-500">Below is the parsed structured ticket object generated by Nashik EcoRoute AI. This schema can be piped directly into NMC's legacy SQL/database endpoints via webhooks.</p>
                      <pre className="bg-slate-900 border border-slate-200 rounded p-4 text-[11px] font-mono text-slate-100 overflow-x-auto select-all max-h-[190px] leading-relaxed shadow-inner">
{JSON.stringify({
  ticketId: selectedTicketForJson.ticketId,
  category: selectedTicketForJson.category,
  severityScore: `${selectedTicketForJson.severityScore}/5`,
  actionRequired: selectedTicketForJson.actionRequired,
  geographicNode: selectedTicketForJson.geographicNode,
  systemStatus: selectedTicketForJson.status,
  reportedBy: selectedTicketForJson.reportedBy,
  timestamp: selectedTicketForJson.timestamp,
  deviceMetadata: {
    telemetrySource: "Nashik EcoRoute AI V3.5-Flash",
    locationCaptured: true,
    routingOptimized: selectedTicketForJson.status !== 'Pending'
  }
}, null, 2)}
                      </pre>
                      <div className="text-[10px] text-slate-550 italic">💡 Select other rows in the Complaints list to view their corresponding JSON feeds.</div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400 italic">Select a ticket row in the Complaints tab to view its system integration payload.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Analytics & Waste breakdown */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Category breakdown meters */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
                Municipal Waste Composition
              </h3>
              <p className="text-xs text-slate-500 mb-4 font-mono">Statistical log of active & cleared reports</p>
              
              <div className="space-y-4">
                {categoryStats.map((stat) => {
                  let barColor = 'bg-emerald-500';
                  if (stat.name === 'Hazardous') barColor = 'bg-red-500';
                  if (stat.name === 'Recyclable') barColor = 'bg-blue-500';
                  if (stat.name === 'Construction Debris') barColor = 'bg-amber-500';

                  const maxCount = Math.max(...categoryStats.map(s => s.count), 1);
                  const percentWidth = (stat.count / maxCount) * 100;

                  return (
                    <div key={stat.name} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-700 font-bold">{stat.name}</span>
                        <span className="font-mono text-slate-500 text-[11px]">
                          {stat.count} Total ({stat.active} Active)
                        </span>
                      </div>
                      <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${barColor} transition-all duration-500`}
                          style={{ width: `${percentWidth}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance target status */}
            <div className="mt-6 border-t border-slate-100 pt-4 bg-slate-50 p-4 rounded border border-slate-200 mt-5">
              <h4 className="text-xs font-bold text-slate-700 mb-1">Target Response Times (SLA)</h4>
              <ul className="text-[10px] text-slate-500 space-y-1 font-mono font-bold">
                <li className="flex justify-between"><span>Hazardous Waste:</span> <span className="text-red-600">&lt; 2 Hours</span></li>
                <li className="flex justify-between"><span>Construction Debris:</span> <span className="text-amber-600">&lt; 12 Hours</span></li>
                <li className="flex justify-between"><span>Organic Composting:</span> <span className="text-emerald-600">&lt; 4 Hours</span></li>
                <li className="flex justify-between"><span>Recyclable Pickups:</span> <span className="text-blue-600">&lt; 24 Hours</span></li>
              </ul>
            </div>
          </div>

          {/* NMC Database Connector */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1">
              <Code className="w-4 h-4 text-indigo-600" />
              NMC Database Connector
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">All ticket endpoints are fully automated. Every successful report generates a persistent UUID conforming to NMC Solid Waste Directives, automatically matching vehicles to minimize dead mileage.</p>
            <div className="text-[10px] font-mono bg-slate-900 text-slate-100 p-3 rounded-lg border border-slate-200 shadow-inner">
              <span className="text-emerald-400 font-bold">API POST</span> /api/triage <br/>
              <span className="text-blue-400 font-bold">API GET</span> /api/health <br/>
              <span className="text-slate-400">SSL Secured (Transport Layer Enforced)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
