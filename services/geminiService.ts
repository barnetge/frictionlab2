import { GoogleGenAI } from "@google/genai";
import { SimulationParams, SimulationResult, SurfaceConfig } from "../types";
import { SURFACES } from "../constants";

export const generatePhysicsExplanation = async (
  params: SimulationParams,
  results: SimulationResult[]
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are a physics tutor. Explain the results of a friction simulation.
    
    Global Parameters:
    - Object Mass: ${params.mass} kg
    - Applied Push Force Strength: ${params.appliedForce} N
    - Distance: ${params.distance} m
    - Force Application Mode: ${params.forceMode} 
      ${params.forceMode === 'timed' ? `(Applied for ${params.forceDuration} seconds)` : ''}
      ${params.forceMode === 'distance' ? `(Applied for ${params.forceDistanceLimit} meters)` : ''}
      ${params.forceMode === 'impulse' ? `(Applied as a short initial push)` : ''}
    
    Results per Surface:
    ${results.map(r => `
      - Surface: ${r.surface}
        - Max Static Friction Limit: ${r.staticFrictionLimit.toFixed(2)} N
        - Moved: ${r.didMove ? 'YES' : 'NO'}
        ${r.didMove ? `- Final Time: ${r.finalTime.toFixed(2)}s\n        - Max Velocity: ${r.maxVelocity.toFixed(2)}m/s` : ''}
    `).join('\n')}
    
    Please explain:
    1. Why did some objects move and others didn't (Applied Force vs Static Friction)?
    2. For moving objects, how did the Net Force change? (Consider if the applied force stopped mid-way).
    3. If the force stopped (Impulse/Timed/Distance), how did Friction act to slow the object down (deceleration)?
    4. Provide a brief "Physics Takeaway".

    Keep the explanation concise, formatted with clear headings or bullet points. Use Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful and clear physics educator.",
      }
    });
    return response.text || "No explanation generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate explanation. Please check your API key and try again.";
  }
};
