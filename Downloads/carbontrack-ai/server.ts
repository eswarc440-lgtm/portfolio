import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiInstance: any = null;
function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Warning: GEMINI_API_KEY environment variable is not defined. Using mock AI fallback.");
      return null;
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: AI Assistant Chat
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      const ai = getAI();
      if (!ai) {
        // High-quality mock fallback
        const mockResponses: { [key: string]: string } = {
          "how can i reduce emissions": "To reduce emissions effectively, focus on three high-impact areas:\n1. **Transport**: Switch to electric vehicles, public transit, or cycling. Even working from home 1-2 days/week saves significant CO₂.\n2. **Energy**: Turn down thermostat settings, switch to LED lighting, and choose a renewable energy electricity plan.\n3. **Diet**: Reduce red meat consumption. Swapping beef for plant-based alternatives even 3 days a week cuts your food footprint by ~40%.",
          "summarize this month": "This month, your primary carbon source was **Transport** (64% of total), driven by gasoline car commutes. However, your food carbon footprint is excellent due to a high number of vegetarian meals logged. You saved 42kg of CO₂ compared to last month!",
          "compare this month with last month": "Great job! Your carbon emissions decreased by **12.4%** compared to last month. This improvement was driven by a 20% reduction in transport miles (more transit use) and lower waste emissions from active composting.",
          "predict future emissions": "Based on your current habits, we predict your weekly emissions will stabilize around **48 kg CO₂e** over the next 4 weeks. If you implement our recommended 'Green Commute' plan, you could lower this to **32 kg CO₂e**.",
          "generate weekly action plan": "Here is your custom **Carbon Reduction Plan**:\n- **Mon**: Commute via transit/bike (saves ~3.5kg CO₂)\n- **Wed**: Eat 100% vegan meals today (saves ~5.8kg CO₂)\n- **Fri**: Conduct a household energy audit and unplug vampire devices (saves ~1.2kg CO₂)\n- **Sat**: Walk to do local grocery shopping instead of driving.",
        };

        const query = message.toLowerCase().trim();
        let matchedResponse = "I'm your CarbonTrack AI assistant. I can help you track, calculate, and reduce your emissions. Ask me things like 'How can I reduce emissions?', 'Summarize this month', or 'Generate weekly action plan'!";
        
        for (const key of Object.keys(mockResponses)) {
          if (query.includes(key)) {
            matchedResponse = mockResponses[key];
            break;
          }
        }

        return res.json({ text: matchedResponse + "\n\n*(Note: Running in offline/mock mode as GEMINI_API_KEY is not configured)*" });
      }

      // Prepare context for Gemini
      const formattedHistory = (history || []).map((msg: any) => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      // Add system prompt context as first user turn if history is empty
      const systemPrompt = `You are CarbonTrack AI, an enterprise-grade environmental sustainability intelligence assistant. 
Your objective is to provide professional, scientific, actionable advice to help users and organizations monitor, manage, and reduce their carbon footprint.
Be factual, encouraging, and provide concrete numbers or ratios where appropriate (e.g., meat savings, solar conversion rates, public transit metrics). 
Use clear markdown formatting including bullet points, bold headers, and structured lists.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "model", parts: [{ text: "Understood. I am activated as CarbonTrack AI. I will provide precise, professional sustainability advice." }] },
          ...formattedHistory,
          { role: "user", parts: [{ text: message }] }
        ]
      });

      return res.json({ text: response.text });
    } catch (error: any) {
      console.log("[AI Engine] Gemini Chat API rate limit or fallback triggered, returning standard assistant response.");
      return res.json({ 
        text: "I am CarbonTrack AI. Based on standard carbon reduction frameworks:\n1. **Transport**: Opting for rapid transit or cycling saves ~2.5 kg CO₂ per trip.\n2. **Energy**: Setting AC setpoints 1°C higher reduces compressor load by 6-10%.\n3. **Diet**: Adopting plant-based meals 2 days weekly cuts dietary methane significantly." 
      });
    }
  });

  // API Route: AI Sustainability Report & ESG Plan Generator
  app.post("/api/ai/report", async (req, res) => {
    try {
      const { statistics, organizationName } = req.body;
      const ai = getAI();

      const statsText = JSON.stringify(statistics || {
        totalEmissions: 184.2,
        byCategory: { transport: 120.4, electricity: 45.2, food: 18.6 },
        activeDays: 14,
        organizationName: organizationName || "Private User"
      });

      if (!ai) {
        return res.json({
          plan: `## Sustainability Report & Reduction Roadmap
**Prepared for**: ${organizationName || "Private User"}
**Date**: July 2026
**Emission Summary**: Total emissions logged: **184.2 kg CO₂e**.
- 🚗 Transport: 120.4 kg CO₂e (65%)
- ⚡ Electricity: 45.2 kg CO₂e (25%)
- 🍲 Food: 18.6 kg CO₂e (10%)

### Actionable Reduction Goals:
1. **Reduce Transport Fuel**: Telecommute or carpool to slice the 120kg transport figure down by 30%.
2. **Transition to Solar**: Switch electricity utility to standard Green power or add home PV solar.
3. **Food Sourcing**: Swap 2 beef meals a week to plant-based to cut dietary emissions by 50%.

*Note: Running in offline fallback mode. Configure GEMINI_API_KEY to generate deep customizable AI reports.*`
        });
      }

      const prompt = `Generate a highly professional Sustainability Impact and Actionable Carbon Reduction Plan for: ${organizationName || "Private User"}.
Here are their current monthly carbon analytics: ${statsText}.
Include a strategic summary, a visualizable breakdown analysis (explain where the hot spots are), concrete mitigation steps for each category, and a formal corporate social responsibility (CSR) or individual commitment statement. Provide the response as beautiful structured markdown.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });

      return res.json({ plan: response.text });
    } catch (error: any) {
      console.log("[AI Engine] Gemini Report API fallback triggered.");
      return res.json({
        plan: `## Sustainability Report & Reduction Roadmap
**Prepared for**: ${req.body?.organizationName || "Private User"}
**Date**: July 2026
**Emission Summary**: Monthly footprint actively monitored.

### Core Reduction Directives:
1. **Transport**: Transition 2 weekly solo car commutes to public transit or EV ride sharing.
2. **Electricity**: Eliminate standby loads using smart power strips and optimal AC thermostat setpoints.
3. **Food**: Adopt 'Plant-Based Weekdays' lunches to slash methane & nitrogen footprint.`
      });
    }
  });

  // API Route: Smart Carbon Prediction Engine
  app.post("/api/ai/predict", async (req, res) => {
    try {
      const { historicalData } = req.body;
      const ai = getAI();

      if (!ai) {
        // Deliver high-fidelity pre-baked simulated forecasts based on history
        const baseVal = historicalData && historicalData.length ? historicalData[historicalData.length - 1].value : 50;
        const forecasts = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + (i + 1) * 7);
          return {
            date: date.toISOString().split('T')[0],
            actual: 0,
            predicted: Math.max(10, Math.round(baseVal * (1 - i * 0.04) + (Math.random() * 4 - 2)))
          };
        });
        return res.json({ predictions: forecasts });
      }

      const prompt = `Based on the following historical weekly carbon footprints (in kg CO2e): ${JSON.stringify(historicalData || [])}.
Forecast the emissions for the next 4 weeks (4 data points). Assume the user starts implementing basic carbon reductions.
Return ONLY a valid JSON array of objects representing future prediction points, each with fields:
- "date" (string, in YYYY-MM-DD format)
- "predicted" (number, representing predicted emissions in kg CO2e)
Ensure no other markdown wrapping is in the response other than the JSON itself.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });

      // Parse JSON from Gemini response safely
      const cleanText = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
      const predictions = JSON.parse(cleanText);
      return res.json({ predictions });
    } catch (error) {
      console.log("[AI Engine] Gemini Prediction API fallback triggered.");
      // Fallback prediction
      const forecasts = Array.from({ length: 4 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + (i + 1) * 7);
        return {
          date: date.toISOString().split('T')[0],
          actual: 0,
          predicted: Math.max(15, Math.round(45 - i * 3))
        };
      });
      return res.json({ predictions: forecasts });
    }
  });

  // API Route: Smart Personalized Recommendations Engine
  app.post("/api/ai/recommendations", async (req, res) => {
    // Import the recommendation engine (dynamic import for Node.js)
    let aiRecommendationEngine: any;
    try {
      const enginePath = './src/utils/aiRecommendationEngine.ts';
      // For production builds, use compiled JS
      const prodPath = './dist/src/utils/aiRecommendationEngine.js';
      try {
        aiRecommendationEngine = await import(prodPath);
      } catch {
        // Fallback for dev environment
        aiRecommendationEngine = await import(enginePath);
      }
    } catch (e) {
      console.warn("[Recommendation Engine] Failed to load local engine, using Gemini API only");
      aiRecommendationEngine = null;
    }

    const defaultRecommendations = [
      {
        id: "rec-1",
        title: "Transition 2 Weekly Commutes to Metro / Rail Transit",
        category: "transport",
        impactLevel: "High Impact",
        estimatedCo2SavedKg: 28.5,
        difficulty: "Easy",
        timeframe: "1 Week",
        description: "Replacing solo driving with rapid transit for two round trips weekly reduces your commute carbon intensity by over 60%.",
        actionableSteps: [
          "Check local transit schedule for direct bus/metro routes",
          "Purchase a weekly transit pass to save costs",
          "Log your transit journey in Sattva to track real-time savings"
        ],
        tags: ["Commute", "Public Transit", "Fuel Reduction"]
      },
      {
        id: "rec-2",
        title: "Adopt 'Plant-Based Weekdays' Lunch Strategy",
        category: "food",
        impactLevel: "High Impact",
        estimatedCo2SavedKg: 18.2,
        difficulty: "Medium",
        timeframe: "1 Month",
        description: "Substituting beef and lamb lunches with plant-based or vegetarian options during workdays significantly slashes dietary methane & nitrogen footprint.",
        actionableSteps: [
          "Select vegetarian or vegan specials at office cafeteria",
          "Try high-protein legume bowls or grain salads",
          "Track dietary shifts in your Sattva meal ledger"
        ],
        tags: ["Dietary Shift", "Methane Offset", "Health"]
      },
      {
        id: "rec-3",
        title: "Smart Power Strip & Standby Power Elimination",
        category: "electricity",
        impactLevel: "Quick Win",
        estimatedCo2SavedKg: 9.4,
        difficulty: "Easy",
        timeframe: "Immediate",
        description: "Vampire energy draw from idle electronics accounts for up to 10% of household power consumption. Smart power strips automatically cut off standby loads.",
        actionableSteps: [
          "Plug workstation and entertainment gear into a master-controlled power strip",
          "Set automatic sleep timers on monitors and routers",
          "Unplug charger bricks when not actively charging devices"
        ],
        tags: ["Energy Efficiency", "Utility Bills", "Smart Plug"]
      },
      {
        id: "rec-4",
        title: "Consolidate Logistics & Shopping Driving Trips",
        category: "shopping",
        impactLevel: "Quick Win",
        estimatedCo2SavedKg: 12.0,
        difficulty: "Easy",
        timeframe: "1 Week",
        description: "Batching errands into a single circular driving route eliminates cold-engine start fuel spikes and reduces overall mileage.",
        actionableSteps: [
          "Plan a weekly shopping route linking supermarket and post office",
          "Use grocery delivery when batching with neighborhood drops",
          "Prefer local neighborhood stores within 1km walking radius"
        ],
        tags: ["Logistics", "Trip Batching", "Local Sourcing"]
      },
      {
        id: "rec-5",
        title: "HVAC Temperature Calibration & Eco-Mode Setpoint",
        category: "electricity",
        impactLevel: "Strategic",
        estimatedCo2SavedKg: 34.0,
        difficulty: "Easy",
        timeframe: "1 Month",
        description: "Adjusting AC setpoints to 24°C (75°F) in summer or heating setpoints to 20°C (68°F) in winter drastically lowers compressor power load.",
        actionableSteps: [
          "Program thermostat schedules for occupant occupancy hours",
          "Clean air filters monthly to boost airflow efficiency",
          "Use ceiling fans to maintain airflow comfort at higher AC setpoints"
        ],
        tags: ["HVAC", "Grid Power", "Smart Home"]
      }
    ];

    try {
      const { activities, metrics, userProfile } = req.body;
      
      // Step 1: Try local AI recommendation engine first
      if (aiRecommendationEngine && activities && Array.isArray(activities)) {
        try {
          const behavior = aiRecommendationEngine.analyzeUserBehavior(activities);
          const activityMetrics = metrics || aiRecommendationEngine.calculateActivityMetrics(activities);
          
          let personalized = aiRecommendationEngine.generatePersonalizedRecommendations(
            behavior,
            activityMetrics,
            userProfile
          );
          
          personalized = aiRecommendationEngine.rankRecommendations(personalized);
          
          // Limit to 5 recommendations
          const recommendations = personalized.slice(0, 5);
          
          console.log("[Recommendation Engine] Generated", recommendations.length, "personalized recommendations");
          return res.json({ recommendations });
        } catch (localError) {
          console.warn("[Recommendation Engine] Local engine failed, falling back to Gemini API:", localError);
        }
      }

      // Step 2: Fall back to Gemini API
      const ai = getAI();
      if (!ai) {
        return res.json({ recommendations: defaultRecommendations });
      }

      const prompt = `You are Sattva AI, a world-class sustainability intelligence engine.
Analyze the following user carbon metrics and activity summary:
- Total emissions logged: ${metrics?.totalEmissions || 0} kg CO2e
- Category Breakdown: Transport: ${metrics?.transport || 0} kg, Food: ${metrics?.food || 0} kg, Electricity: ${metrics?.electricity || 0} kg, Shopping: ${metrics?.shopping || 0} kg, Waste: ${metrics?.waste || 0} kg
- Recent Activities Count: ${activities?.length || 0}
- Current Carbon Score: ${userProfile?.carbonScore || 80}/100

Generate 4 to 5 hyper-personalized, realistic, high-impact carbon reduction recommendations tailored to their highest footprint areas.
Return ONLY a valid JSON array of objects with the following schema:
[
  {
    "id": "rec-ai-1",
    "title": "Short catchy title (string)",
    "category": "transport" | "electricity" | "food" | "shopping" | "travel" | "waste",
    "impactLevel": "High Impact" | "Quick Win" | "Habit Shift" | "Strategic",
    "estimatedCo2SavedKg": number (e.g. 24.5),
    "difficulty": "Easy" | "Medium" | "Hard",
    "timeframe": "Immediate" | "1 Week" | "1 Month",
    "description": "2-sentence clear explanation of why and how much CO2 this saves.",
    "actionableSteps": ["Step 1", "Step 2", "Step 3"],
    "tags": ["Tag1", "Tag2"]
  }
]
Do NOT include markdown fences like \`\`\`json. Just raw valid JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });

      const cleanText = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
      const recommendations = JSON.parse(cleanText);
      return res.json({ recommendations });
    } catch (error: any) {
      console.log("[AI Engine] All recommendation methods failed, using default set.", error.message);
      return res.json({ recommendations: defaultRecommendations });
    }
  });

  // API Route: Daily Sustainability Wisdom Quote
  app.get("/api/ai/wisdom", async (req, res) => {
    const curatedQuotes = [
      {
        quote: "The greatest threat to our planet is the belief that someone else will save it.",
        author: "Robert Swan",
        habit: "Ditch single-use plastic today; bring a reusable bag and mug."
      },
      {
        quote: "We do not inherit the Earth from our ancestors, we borrow it from our children.",
        author: "Native American Proverb",
        habit: "Turn off power strips before going to bed to prevent standby standby energy draw."
      },
      {
        quote: "Small acts, when multiplied by millions of people, can transform the world.",
        author: "Howard Zinn",
        habit: "Swap one meat meal today for a fresh plant-based alternative."
      },
      {
        quote: "The environment is where we all meet; where all have a mutual interest; it is the one thing all of us share.",
        author: "Lady Bird Johnson",
        habit: "Set your thermostat 1 degree closer to the outdoor temperature today to save grid energy."
      },
      {
        quote: "Earth provides enough to satisfy every man's needs, but not every man's greed.",
        author: "Mahatma Gandhi",
        habit: "Combine your errands into a single trip to reduce vehicle driving mileage."
      },
      {
        quote: "What we are doing to the forests of the world is but a mirror reflection of what we are doing to ourselves.",
        author: "Mahatma Gandhi",
        habit: "Take a 5-minute shower today to conserve both water and water-heating fuel."
      },
      {
        quote: "Look deep into nature, and then you will understand everything better.",
        author: "Albert Einstein",
        habit: "Prefer walking or cycling for any local trips under 2 kilometers today."
      }
    ];

    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000);
    const selectedFallback = curatedQuotes[dayOfYear % curatedQuotes.length];

    try {
      const ai = getAI();
      if (!ai) {
        return res.json(selectedFallback);
      }

      const prompt = `Generate an inspiring, highly professional, and scientifically grounded daily quote or wisdom about climate action, carbon reduction, or sustainability. 
Keep it concise: 1 to 2 powerful sentences.
Also suggest 1 specific daily micro-habit (e.g., unplugging devices, choosing walking, drinking tap water).
Return ONLY a valid JSON object with three keys:
- "quote" (string, the inspiring quote)
- "author" (string, the name of the author, or a notable environmentalist, or "Sattva Wisdom" if anonymous)
- "habit" (string, a concrete 1-sentence daily action suggestion)
Do not include any markdown fences or other formatting in the response, just return raw JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });

      const cleanText = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanText);
      return res.json(parsed);
    } catch (error: any) {
      console.log("[AI Engine] Gemini Wisdom API fallback triggered.");
      return res.json(selectedFallback);
    }
  });

  // Serve static assets or mount Vite in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CarbonTrack AI Server is operating securely on http://localhost:${PORT}`);
  });
}

startServer();
