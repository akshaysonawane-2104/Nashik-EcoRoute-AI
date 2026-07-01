import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Helper to parse base64 data URLs
function parseDataUrl(dataUrl: string) {
  const matches = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
  if (!matches || matches.length !== 3) {
    return { mimeType: "image/jpeg", data: dataUrl };
  }
  return {
    mimeType: matches[1],
    data: matches[2]
  };
}

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      geminiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log("Successfully initialized GoogleGenAI Client.");
    } else {
      console.warn("GEMINI_API_KEY not set or placeholder. Falling back to local civic heuristic engine.");
    }
  }
  return geminiClient;
}

// Local Heuristic Fallback Engine
function getLocalFallbackResponse(text: string, hasImage: boolean): any {
  const normalized = text.toLowerCase();
  
  // Check unrelated
  const keywords = ['waste', 'garbage', 'trash', 'litter', 'bin', 'dump', 'debris', 'organic', 'chemical', 'leak', 'scrap', 'shopp', 'shinde', 'panchavati', 'cidco', 'satpur', 'road', 'college', 'nasik', 'nashik', 'fire', 'emergency', 'clean', 'dirty', 'smell', 'plastic', 'battery', 'brick'];
  const hasKeyword = keywords.some(k => normalized.includes(k)) || hasImage;
  
  if (!hasKeyword && text.length > 5 && !normalized.includes("hello") && !normalized.includes("help")) {
    return {
      ticketId: `NMC-LCL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      category: "Recyclable",
      severityScore: 1,
      actionRequired: "Civic query parsed. No active waste dispatch required.",
      geographicNode: "",
      isEmergency: false,
      responseMessage: "Nashik EcoRoute AI notes your input, but it does not appear to be a waste management report or civic sanitation issue. Please report garbage dumps, hazard spills, or fire in public bins to initiate municipal dispatch.",
      isUnrelated: true
    };
  }

  // Check emergency
  if (normalized.includes('fire') || normalized.includes('smoke') || normalized.includes('burning') || normalized.includes('explosion')) {
    return {
      ticketId: `NMC-EMG-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      category: "Hazardous",
      severityScore: 5,
      actionRequired: "CRITICAL EMERGENCY - CONTACT FIRE AUTHORITIES IMMEDIATELY",
      geographicNode: normalized.includes('panchavati') ? 'Panchavati' : normalized.includes('cidco') ? 'Cidco' : normalized.includes('satpur') ? 'Satpur (MIDC)' : normalized.includes('college') ? 'College Road' : normalized.includes('road') ? 'Nashik Road' : 'Panchavati',
      isEmergency: true,
      responseMessage: "⚠️ CRITICAL EMERGENCY FLAGGED. Smoke or active combustion detected. Standard municipal routing has been bypassed. Dispatching HazMat containment team, and alerting Nashik Fire Department immediately.",
      isUnrelated: false
    };
  }

  // Classify category and severity
  let category = "Organic";
  let severityScore = 3;
  let actionRequired = "Dispatch regular municipal waste collection crew.";
  
  if (normalized.includes('battery') || normalized.includes('chemical') || normalized.includes('acid') || normalized.includes('toxic') || normalized.includes('industry') || normalized.includes('oil')) {
    category = "Hazardous";
    severityScore = 4;
    actionRequired = "Deploy specialized chemical-safe trucks and hazardous containment crew.";
  } else if (normalized.includes('concrete') || normalized.includes('debris') || normalized.includes('brick') || normalized.includes('construction') || normalized.includes('demolish')) {
    category = "Construction Debris";
    severityScore = 5;
    actionRequired = "Dispatch heavy loader loader and commercial debris truck.";
  } else if (normalized.includes('plastic') || normalized.includes('bottle') || normalized.includes('paper') || normalized.includes('cardboard') || normalized.includes('metal') || normalized.includes('can')) {
    category = "Recyclable";
    severityScore = 2;
    actionRequired = "Schedule dry-waste recyclable collection.";
  } else if (normalized.includes('vegetable') || normalized.includes('food') || normalized.includes('compost') || normalized.includes('smell') || normalized.includes('odour') || normalized.includes('leaves')) {
    category = "Organic";
    severityScore = 3;
    actionRequired = "Dispatch food waste composter and sanitizing crew.";
  }

  // Geographic Node
  let geographicNode = "Panchavati"; // Default/Fallback
  if (normalized.includes('cidco')) geographicNode = "Cidco";
  else if (normalized.includes('satpur')) geographicNode = "Satpur (MIDC)";
  else if (normalized.includes('college')) geographicNode = "College Road";
  else if (normalized.includes('indiranagar')) geographicNode = "Indiranagar";
  else if (normalized.includes('gangapur')) geographicNode = "Gangapur Road";
  else if (normalized.includes('nashik road') || normalized.includes('nasik road')) geographicNode = "Nashik Road";

  return {
    ticketId: `NMC-LCL-${Math.floor(1000 + Math.random() * 9000)}`,
    category,
    severityScore,
    actionRequired,
    geographicNode,
    isEmergency: false,
    responseMessage: `[Local Engine Triage] Received waste report at ${geographicNode}. Classified as ${category} (Severity ${severityScore}/5). A dispatch team is scheduled for regular cleanup.`,
    isUnrelated: false,
    isLocalEngine: true
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware with reasonable size limit for base64 image uploads
  app.use(express.json({ limit: "15mb" }));

  // API - Health Check
  app.get("/api/health", (req, res) => {
    const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
    res.json({
      status: "ok",
      geminiConfigured: hasKey,
      time: new Date().toISOString()
    });
  });

  // API - Triage Endpoint (Full Multimodal capability)
  app.post("/api/triage", async (req, res) => {
    const { text, image } = req.body;
    const client = getGeminiClient();

    // Log the incoming request details safely
    console.log(`Received triage request. Text length: ${text?.length || 0}, Has Image: ${!!image}`);

    if (!client) {
      // Key is not configured, fall back immediately to high-fidelity heuristic simulation
      const fallback = getLocalFallbackResponse(text || "", !!image);
      return res.json({
        ...fallback,
        notes: "Processed via Nashik Local Heuristic Engine. Configure GEMINI_API_KEY in the Secrets panel to activate full multimodal AI vision."
      });
    }

    try {
      const parts: any[] = [];

      // If user uploaded an image of trash, include it
      if (image) {
        const parsed = parseDataUrl(image);
        parts.push({
          inlineData: {
            mimeType: parsed.mimeType,
            data: parsed.data
          }
        });
      }

      // Main Instruction for Nashik EcoRoute AI
      const systemPrompt = `You are "Nashik EcoRoute AI", an advanced civic AI Agent built for municipal waste management authorities and citizens of Nashik, India.
Your core objective is to optimize urban waste collection by processing citizen reports, identifying waste hazards, and generating optimized dispatch data.

PROTCOLS:
1. Classify waste type: 'Organic', 'Recyclable', 'Hazardous' (E-waste/Chemicals/Batteries), or 'Construction Debris'.
2. Estimate severity score on a scale of 1 to 5:
   - 1 = Single piece of litter
   - 2 = Small pile of waste
   - 3 = Filled municipal bin, spilling over
   - 4 = Medium dump, industrial batteries, or chemical leakage
   - 5 = Massive dump or pile blocking pedestrian/vehicle lanes
3. Extract geographic landmark or area in Nashik (must try to map to exactly one of: 'College Road', 'Cidco', 'Panchavati', 'Indiranagar', 'Satpur (MIDC)', 'Nashik Road', 'Gangapur Road'). If none can be inferred, set geographicNode to empty string "".
4. If the report is an active fire in a bin, smoke, toxic chemical leakage emergency, or critical hazard, flag 'isEmergency' as true, raise 'severityScore' to 5, and specify 'actionRequired' as "CRITICAL EMERGENCY - CONTACT FIRE AUTHORITIES".
5. Refuse to process content unrelated to civic infrastructure, sanitation, or municipal waste. If unrelated, flag 'isUnrelated' as true.
6. Generate a polite, civic-minded, and highly professional 'responseMessage' acknowledging the citizen's civic responsibility and stating the next municipal steps. Keep it professional.`;

      parts.push({
        text: `Citizen Text Report: "${text || ''}"
Analyze and return strict JSON.`
      });

      // Call Gemini 3.5 Flash for Multimodal Triage
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts },
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              ticketId: { type: Type.STRING, description: "Generate a unique Ticket ID starting with NMC-2026-" },
              category: { type: Type.STRING, description: "Must be exactly 'Organic', 'Recyclable', 'Hazardous', or 'Construction Debris'" },
              severityScore: { type: Type.INTEGER, description: "1 to 5 scale" },
              actionRequired: { type: Type.STRING, description: "Specific operational action details" },
              geographicNode: { type: Type.STRING, description: "Inferred landmark/area in Nashik or empty string if not provided" },
              isEmergency: { type: Type.BOOLEAN },
              responseMessage: { type: Type.STRING, description: "Professional response acknowledging the report" },
              isUnrelated: { type: Type.BOOLEAN }
            },
            required: ["ticketId", "category", "severityScore", "actionRequired", "geographicNode", "isEmergency", "responseMessage", "isUnrelated"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response text returned from Gemini API.");
      }

      const triagedData = JSON.parse(responseText.trim());
      return res.json(triagedData);

    } catch (err: any) {
      console.error("Gemini triage API error:", err);
      // Fail gracefully: use local fallback so user doesn't see a broken page
      const fallback = getLocalFallbackResponse(text || "", !!image);
      return res.json({
        ...fallback,
        notes: `AI vision error (${err.message}). Local heuristic engine processed this report.`
      });
    }
  });

  // Integrate Vite Dev Server Middleware or serve static files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware attached.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static build from /dist");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nashik EcoRoute AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
