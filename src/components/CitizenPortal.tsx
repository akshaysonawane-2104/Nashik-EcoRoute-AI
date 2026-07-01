import React, { useState, useRef } from 'react';
import { 
  Camera, Upload, AlertTriangle, CheckCircle, Info, Loader2, Send, 
  MapPin, Leaf, Trash2, ShieldAlert, Sparkles, HelpCircle 
} from 'lucide-react';
import { TriageTicket, GeminiTriageResponse } from '../types';
import { NASHIK_NODES, CIVIC_FAQs } from '../data';

// Base64 pre-defined simulator images for easy sandbox testing of Multimodal vision!
const PRESET_IMAGES = [
  {
    name: 'Batteries & Chemicals (Hazard)',
    desc: 'Discarded car batteries and toxic leakage',
    category: 'Hazardous',
    text: 'Found highly hazardous old acid batteries and spray cans dumped near Satpur Industrial Gate 3.',
    // A 1x1 green/red pixel representation to simulate base64 upload
    base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  },
  {
    name: 'Plastic & Carton Stack (Recyclable)',
    desc: 'Paper boxes and commercial plastic wrap',
    category: 'Recyclable',
    text: 'A massive pile of commercial cardboard containers and shredded plastic bags blocking College Road near BYK campus.',
    base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADAwH/7Y6fGAAAAABJRU5ErkJggg=='
  },
  {
    name: 'Debris & Concrete (Construction)',
    desc: 'Busted concrete bricks and construction debris',
    category: 'Construction Debris',
    text: 'Illegal overnight dumping of concrete debris, broken wall bricks, and dry cement bags in Cidco block D sector.',
    base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88OD/fwAIGQEBv0n7+QAAAABJRU5ErkJggg=='
  },
  {
    name: 'Overflowing Bins (Organic/Wet)',
    desc: 'Rotting food waste and organic materials',
    category: 'Organic',
    text: 'Heavy stench coming from overflowing vegetable peelings and rotting flowers near Panchavati market stalls.',
    base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGA6K09YgAAAABJRU5ErkJggg=='
  }
];

interface CitizenPortalProps {
  onNewTicketCreated: (ticket: TriageTicket) => void;
  selectedMapNode: string | null;
  onSelectMapNode: (nodeName: string) => void;
}

export default function CitizenPortal({
  onNewTicketCreated,
  selectedMapNode,
  onSelectMapNode
}: CitizenPortalProps) {
  const [reportText, setReportText] = useState('');
  const [selectedNode, setSelectedNode] = useState(selectedMapNode || '');
  const [citizenName, setCitizenName] = useState('Citizen Reporter');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isTriageLoading, setIsTriageLoading] = useState(false);
  const [triageLogs, setTriageLogs] = useState<string[]>([]);
  const [successTicket, setSuccessTicket] = useState<TriageTicket | null>(null);
  
  // Chat Bot Assistant State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'agent'; text: string }>>([
    { 
      sender: 'agent', 
      text: 'Namaskar! I am Nashik EcoRoute AI, your dedicated civic sanitation assistant. How can I help you support Nashik\'s cleanliness guidelines today?' 
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize when parent coordinates change
  React.useEffect(() => {
    if (selectedMapNode) {
      setSelectedNode(selectedMapNode);
    }
  }, [selectedMapNode]);

  // Handle Preset Image Quick Test
  const handleSelectPreset = (preset: typeof PRESET_IMAGES[0]) => {
    setReportText(preset.text);
    setCustomImage(preset.base64);
    // Auto-fill node if it is in the preset description
    if (preset.text.includes('Satpur')) {
      setSelectedNode('Satpur (MIDC)');
      onSelectMapNode('Satpur (MIDC)');
    } else if (preset.text.includes('College Road')) {
      setSelectedNode('College Road');
      onSelectMapNode('College Road');
    } else if (preset.text.includes('Cidco')) {
      setSelectedNode('Cidco');
      onSelectMapNode('Cidco');
    } else if (preset.text.includes('Panchavati')) {
      setSelectedNode('Panchavati');
      onSelectMapNode('Panchavati');
    }
  };

  // Handle Custom File Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger Citizen Report Submission to Full-Stack API
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim() && !customImage) return;

    setIsTriageLoading(true);
    setSuccessTicket(null);
    setTriageLogs([
      '⚡ [EcoRoute] Initializing AI Triage Pipeline...',
      '📡 Connecting to Nashik Municipal Corporation server gateway...',
    ]);

    // Simulate progressive analytical logs (extremely engaging)
    const runLogs = async () => {
      await new Promise(r => setTimeout(r, 600));
      setTriageLogs(prev => [...prev, '📸 [Multimodal Node] Inspecting upload pixels via vision network...']);
      await new Promise(r => setTimeout(r, 600));
      setTriageLogs(prev => [...prev, '🔤 [Logistical Parsing] Running Named Entity Recognition (NER) on report text...']);
      await new Promise(r => setTimeout(r, 500));
      setTriageLogs(prev => [...prev, '🗺️ [Geographic Mapper] Pinpointing spatial nodes & Nashik landmarks...']);
      await new Promise(r => setTimeout(r, 500));
      setTriageLogs(prev => [...prev, '⚙️ [Civic Agent] Classifying waste materials and estimating volume threat...']);
    };

    runLogs();

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: reportText,
          image: customImage,
          selectedNode: selectedNode
        })
      });

      const data: GeminiTriageResponse & { notes?: string } = await response.json();

      setTriageLogs(prev => [
        ...prev,
        `✅ [Agent Triage] Ticket ${data.ticketId} successfully resolved!`,
        `📦 Classification: ${data.category}`,
        `⚠️ Severity Level: ${data.severityScore}/5`,
        `📍 Assigned Ward: ${data.geographicNode || selectedNode || 'General Nashik'}`,
        data.notes ? `ℹ️ ${data.notes}` : `🤖 Gemini 3.5 Active`
      ]);

      // Create actual ticket to append to global state
      const newTicket: TriageTicket = {
        ticketId: data.ticketId || `NMC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        category: data.isUnrelated ? 'Organic' : data.category,
        severityScore: data.severityScore || 3,
        actionRequired: data.actionRequired || 'Dispatch standard municipal pickup crew.',
        geographicNode: data.geographicNode || selectedNode || 'Panchavati',
        isEmergency: data.isEmergency || false,
        timestamp: new Date().toISOString(),
        status: 'Pending',
        reportedBy: `${citizenName} (Citizen)`,
        description: reportText,
        imageUrl: customImage || undefined
      };

      if (data.isUnrelated) {
        setTriageLogs(prev => [...prev, '⚠️ WARNING: Report marked as UNRELATED to municipal sanitation. Ticket is placed in general review.']);
      }

      await new Promise(r => setTimeout(r, 600));
      onNewTicketCreated(newTicket);
      setSuccessTicket(newTicket);
      
      // Clear form inputs
      setReportText('');
      setCustomImage(null);
    } catch (err) {
      console.error(err);
      setTriageLogs(prev => [...prev, '❌ Fatal Error: AI Triage failed. Reconnecting...']);
    } finally {
      setIsTriageLoading(false);
    }
  };

  // Bot Assistant Q&A
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    // Process reply based on Nashik FAQ rules
    setTimeout(() => {
      const matchedFaq = CIVIC_FAQs.find(faq => 
        userMsg.toLowerCase().includes(faq.question.toLowerCase().split(' ').slice(0, 3).join(' ')) ||
        faq.question.toLowerCase().split(' ').some(word => word.length > 4 && userMsg.toLowerCase().includes(word))
      );

      let reply = "I've registered your question. Under NMC guidelines, all citizens are required to separate dry and wet waste. For complaints regarding delayed collection or heavy dumping, please submit a visual ticket in the portal above and Nashik EcoRoute AI will dispatch an optimized truck route immediately!";

      if (matchedFaq) {
        reply = matchedFaq.answer;
      } else if (userMsg.toLowerCase().includes('hello') || userMsg.toLowerCase().includes('namaskar')) {
        reply = "Namaskar! How can I assist you with Nashik's sanitation, recycling guidelines, or garbage collection reporting today?";
      } else if (userMsg.toLowerCase().includes('emergency') || userMsg.toLowerCase().includes('fire')) {
        reply = "⚠️ If you witness active fires or hazardous chemical smoke, please alert the Nashik Fire Department immediately (Call 101). You can also report it above, and our system will instantly prioritize it with high-priority warnings.";
      }

      setChatHistory(prev => [...prev, { sender: 'agent', text: reply }]);
    }, 500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="citizen-portal-view">
      {/* Left reporting Form panel */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 tracking-tight">Citizen Waste Triage Portal</h3>
              <p className="text-xs text-slate-500">File a smart visual complaint to Nashik EcoRoute AI</p>
            </div>
          </div>

          {/* Quick presets for easy testing */}
          <div className="mb-5 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              Developer Preset: Click to test AI Image analysis
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_IMAGES.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className="text-left text-xs bg-white hover:bg-slate-100 border border-slate-200 hover:border-indigo-500/50 p-2.5 rounded transition-all group flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center w-full mb-1">
                    <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{preset.name}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      preset.category === 'Hazardous' ? 'bg-red-500' :
                      preset.category === 'Construction Debris' ? 'bg-amber-500' :
                      preset.category === 'Recyclable' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}></span>
                  </div>
                  <span className="text-[10px] text-slate-500 leading-normal">{preset.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Core Report Form */}
          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Your Name</label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Anonymous Citizen"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Landmark / Nearest Area</label>
                <select
                  value={selectedNode}
                  onChange={(e) => {
                    setSelectedNode(e.target.value);
                    onSelectMapNode(e.target.value);
                  }}
                  className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  <option value="">-- Choose nearest area --</option>
                  {Object.keys(NASHIK_NODES).map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Describe the waste hazard / volume</label>
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                rows={3}
                className="w-full bg-white border border-slate-200 rounded p-3 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Describe what you see. Nashik EcoRoute AI parses this to assign severity score, waste category, and alert emergency crews..."
                required
              ></textarea>
            </div>

            {/* Image Selection Area */}
            <div>
              <span className="block text-xs font-bold text-slate-500 mb-1">Upload Photo of Waste (Multimodal Support)</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div className="sm:col-span-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 bg-white hover:bg-slate-50 border border-slate-200 border-dashed rounded flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group"
                  >
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    <span className="text-xs font-bold text-slate-600">Click to upload photo</span>
                    <span className="text-[10px] text-slate-400">JPG, PNG supported</span>
                  </button>
                </div>

                <div className="relative h-24 bg-white rounded border border-slate-200 overflow-hidden flex items-center justify-center">
                  {customImage ? (
                    <>
                      <img src={customImage} alt="Uploaded preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCustomImage(null)}
                        className="absolute top-1 right-1 bg-white/80 p-1 rounded text-red-600 hover:bg-red-50 transition-all shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-2">
                      <Camera className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-400">No Image</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isTriageLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-2.5 px-4 rounded transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer uppercase tracking-widest text-xs"
            >
              {isTriageLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Triaging Citizen Report...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Report to EcoRoute AI
                </>
              )}
            </button>
          </form>
        </div>

        {/* Success ticket feedback */}
        {successTicket && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs leading-relaxed">
            <div className="flex items-center gap-2 mb-1.5 font-bold text-emerald-700">
              <CheckCircle className="w-4 h-4" />
              Ticket Registered Successfully!
            </div>
            <p className="mb-2"><strong>Ticket ID:</strong> {successTicket.ticketId} has been successfully submitted and cataloged into the NMC Live Dispatch matrix.</p>
            <div className="grid grid-cols-2 gap-2 text-slate-700 font-mono text-[10px] bg-slate-55 p-2 rounded border border-emerald-100">
              <div>Category: <span className="text-indigo-600 font-bold">{successTicket.category}</span></div>
              <div>Severity: <span className="text-red-600 font-bold">{successTicket.severityScore}/5</span></div>
              <div className="col-span-2">Action: {successTicket.actionRequired}</div>
            </div>
          </div>
        )}
      </div>

      {/* Right AI Triage Terminal & Assistant */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Real-time Triage Logger - Embedded dark theme diagnostic */}
        <div className="bg-slate-950 border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-[230px] justify-between font-mono">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                AI TRIAGE PIPELINE LOG
              </span>
              <span className="text-[10px] text-slate-500">NMC-V3.5-FLASH</span>
            </div>
            <div className="space-y-1.5 text-[11px] overflow-y-auto max-h-[140px] pr-2 scrollbar-thin">
              {triageLogs.length === 0 ? (
                <div className="text-slate-500 italic flex items-center gap-1.5 mt-4 justify-center">
                  <Info className="w-4 h-4" />
                  Ready to process incoming citizen logs. Submit a ticket to view system diagnostics.
                </div>
              ) : (
                triageLogs.map((log, idx) => (
                  <div key={idx} className={
                    log.includes('✅') || log.includes('Success') ? 'text-emerald-400' :
                    log.includes('❌') || log.includes('Error') ? 'text-red-400' :
                    log.includes('⚡') ? 'text-amber-400 font-semibold' : 'text-slate-300'
                  }>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Citizen Helper FAQ / Chatbot */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-[254px]">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-800">NMC Citizen Guidelines Helper</h4>
            </div>
            
            {/* Chat History View */}
            <div className="space-y-3 overflow-y-auto h-[125px] text-xs pr-2 mb-3 scrollbar-thin">
              {chatHistory.map((chat, idx) => (
                <div key={idx} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded p-2.5 ${
                    chat.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none font-bold shadow-sm' 
                      : 'bg-slate-150 text-slate-700 border border-slate-200 rounded-tl-none leading-relaxed'
                  }`}>
                    {chat.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Form */}
          <form onSubmit={handleChatSubmit} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="Ask about segregation, e-waste fines..."
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
