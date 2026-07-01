import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Express JSON body parser
app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", message: "PromptLib server is healthy" });
});

// API endpoint to execute/test a prompt with variables
app.post("/api/gemini/generate", async (req: Request, res: Response) => {
  try {
    const { instructions, variables } = req.body;
    if (!instructions) {
      return res.status(400).json({ error: "Instructions are required to run the prompt." });
    }

    // Replace placeholders in format like [VARIABLE_NAME] or {{variable_name}}
    let compiledPrompt = instructions;
    if (variables && typeof variables === "object") {
      for (const key of Object.keys(variables)) {
        const val = variables[key] || "";
        // Support multiple placeholder styles
        compiledPrompt = compiledPrompt.replace(new RegExp(`\\[${key}\\]`, "gi"), val);
        compiledPrompt = compiledPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "gi"), val);
        compiledPrompt = compiledPrompt.replace(new RegExp(`:${key}`, "gi"), val);
      }
    }

    const ai = getGemini();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: compiledPrompt,
      config: {
        systemInstruction: "Eres un motor de ejecución de prompts avanzado para PromptLib. Analiza el prompt provisto y ejecútalo fielmente con las variables provistas.",
      }
    });

    res.json({
      success: true,
      compiledPrompt,
      result: response.text || "No se obtuvo respuesta de Gemini.",
    });
  } catch (error: any) {
    console.error("Error executing prompt with Gemini:", error);
    res.status(500).json({ error: error?.message || "Error al procesar el prompt con Gemini." });
  }
});

// API endpoint to optimize a prompt template
app.post("/api/gemini/optimize", async (req: Request, res: Response) => {
  try {
    const { instructions, description } = req.body;
    if (!instructions) {
      return res.status(400).json({ error: "Instructions are required to optimize." });
    }

    const ai = getGemini();
    const systemPrompt = `Eres un experto Ingeniero de Prompts de IA. Tu tarea es analizar el prompt que te dará el usuario y devolver una versión significativamente optimizada y más precisa.
Usa las mejores prácticas de Prompt Engineering:
1. Define un rol/persona claro para la IA.
2. Añade delimitadores claros para separar entradas de instrucciones.
3. Especifica restricciones de formato claras y pasos secuenciales para el pensamiento de la IA.
4. Mantén las variables originales o marcadores de posición intactos (e.g., [VARIABLE] o {{variable}}).

Debes responder en formato JSON que cumpla exactamente con este esquema:
{
  "optimizedInstructions": "El prompt optimizado final con su formato estructurado",
  "improvements": ["Mejora 1...", "Mejora 2...", "Mejora 3..."]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Prompt original:\n${instructions}\n\nDescripción del propósito:\n${description || "No provista"}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimizedInstructions: { type: Type.STRING },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["optimizedInstructions", "improvements"]
        }
      }
    });

    const resultText = response.text || "{}";
    const parsed = JSON.parse(resultText);

    res.json({
      success: true,
      optimizedInstructions: parsed.optimizedInstructions,
      improvements: parsed.improvements,
    });
  } catch (error: any) {
    console.error("Error optimizing prompt with Gemini:", error);
    res.status(500).json({ error: error?.message || "Error al optimizar el prompt con Gemini." });
  }
});

// API endpoint to auto-categorize, generate summary and recommend model for a prompt
app.post("/api/gemini/auto-categorize", async (req: Request, res: Response) => {
  try {
    const { instructions } = req.body;
    if (!instructions) {
      return res.status(400).json({ error: "Instructions are required to analyze." });
    }

    const ai = getGemini();
    const systemPrompt = `Eres un asistente de clasificación y análisis de prompts para PromptLib.
Analiza las instrucciones de este prompt de IA y determina:
1. Su categoría más apropiada de entre estas opciones: "Portrait", "Isometric", "Architecture", "Abstract", "Technical", "Interior", "General" (elige una de ellas).
2. El modelo recomendado para este prompt (e.g. "Midjourney", "DALL-E 3", "Stable Diffusion", "GPT-4o", "Claude 3.5 Sonnet", "Gemini 3.5 Flash").
3. Una descripción resumida de una oración, clara y precisa, que explique qué hace el prompt.

Debes responder exactamente en formato JSON con este esquema:
{
  "category": "Una de las categorías especificadas arriba",
  "model": "El modelo de IA recomendado",
  "description": "Una breve descripción de una oración del prompt"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: instructions,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            model: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["category", "model", "description"]
        }
      }
    });

    const resultText = response.text || "{}";
    const parsed = JSON.parse(resultText);

    res.json({
      success: true,
      category: parsed.category,
      model: parsed.model,
      description: parsed.description,
    });
  } catch (error: any) {
    console.error("Error analyzing prompt with Gemini:", error);
    res.status(500).json({ error: error?.message || "Error al analizar el prompt con Gemini." });
  }
});

// Start server setup
async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
