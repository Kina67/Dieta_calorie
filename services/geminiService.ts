
import { GoogleGenAI, Type } from "@google/genai";
import { FoodAnalysisResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    dishName: { 
      type: Type.STRING, 
      description: "Il nome del piatto, es. 'Lasagne alla Bolognese' o 'Insalata mista'." 
    },
    quantity: { 
      type: Type.STRING, 
      description: "Stima della quantità o porzione, es. 'circa 250g' o '1 piatto'." 
    },
    calories: { 
      type: Type.NUMBER, 
      description: "Stima delle calorie totali per la porzione mostrata." 
    },
    ingredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Elenco degli ingredienti principali rilevati nel piatto."
    },
    estimatedWeightGrams: {
        type: Type.NUMBER,
        description: "Stima del peso della porzione in grammi. Fornire solo il numero, es. 250."
    },
    carbohydratesGrams: {
        type: Type.NUMBER,
        description: "Stima dei carboidrati totali in grammi per la porzione mostrata."
    },
    proteinsGrams: {
        type: Type.NUMBER,
        description: "Stima delle proteine totali in grammi per la porzione mostrata."
    },
    fatsGrams: {
        type: Type.NUMBER,
        description: "Stima dei grassi totali in grammi per la porzione mostrata."
    }
  },
  required: ['dishName', 'quantity', 'calories', 'ingredients', 'estimatedWeightGrams', 'carbohydratesGrams', 'proteinsGrams', 'fatsGrams']
};

const validateResult = (result: any) => {
    if (
      typeof result.dishName !== 'string' ||
      typeof result.quantity !== 'string' ||
      typeof result.calories !== 'number' ||
      !Array.isArray(result.ingredients) ||
      typeof result.estimatedWeightGrams !== 'number' ||
      typeof result.carbohydratesGrams !== 'number' ||
      typeof result.proteinsGrams !== 'number' ||
      typeof result.fatsGrams !== 'number'
    ) {
      throw new Error("La risposta dell'API non ha il formato corretto.");
    }
}

export const analyzeFoodImage = async (base64ImageData: string, mimeType: string): Promise<FoodAnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { 
            text: "Analizza il cibo in questa immagine. Identifica il piatto. Se è un piatto conosciuto, fornisci il suo nome comune. Stima la dimensione della porzione e il suo peso in grammi. Fornisci una stima delle calorie per la porzione mostrata. Elenca gli ingredienti principali. Includi anche una stima dei macronutrienti: carboidrati, proteine e grassi, in grammi. Rispondi SOLO con un oggetto JSON che segue lo schema fornito, in lingua italiana. Non includere testo aggiuntivo o formattazione markdown." 
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64ImageData,
            },
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      }
    });

    const jsonString = response.text;
    const result = JSON.parse(jsonString);
    
    validateResult(result);
    return result as FoodAnalysisResult;

  } catch (error) {
    console.error("Errore durante l'analisi dell'immagine con Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Analisi fallita: ${error.message}`);
    }
    throw new Error("Si è verificato un errore sconosciuto durante l'analisi.");
  }
};

export const analyzeFoodText = async (description: string): Promise<FoodAnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { 
            text: `Analizza questa descrizione di un pasto: "${description}". Identifica il piatto. Stima la dimensione della porzione e il suo peso in grammi. Fornisci una stima delle calorie per la porzione mostrata. Elenca gli ingredienti principali. Includi anche una stima dei macronutrienti: carboidrati, proteine e grassi, in grammi. Rispondi SOLO con un oggetto JSON che segue lo schema fornito, in lingua italiana. Non includere testo aggiuntivo o formattazione markdown.`
          }
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      }
    });

    const jsonString = response.text;
    const result = JSON.parse(jsonString);
    
    validateResult(result);
    return result as FoodAnalysisResult;

  } catch (error) {
    console.error("Errore durante l'analisi del testo con Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Analisi fallita: ${error.message}`);
    }
    throw new Error("Si è verificato un errore sconosciuto durante l'analisi.");
  }
};
