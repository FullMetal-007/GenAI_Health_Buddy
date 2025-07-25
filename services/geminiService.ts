import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { MedicineInfo, PrescriptionInfo, SymptomInfo } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

// Helper to convert file to base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const medicineSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Name of the medicine." },
        uses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Common uses of the medicine." },
        dosage: { type: Type.STRING, description: "Recommended dosage information." },
        side_effects: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Potential side effects." },
        precautions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Precautions to take." },
    },
    required: ["name", "uses", "dosage", "side_effects", "precautions"],
};

const prescriptionSchema = {
    type: Type.OBJECT,
    properties: {
        medications: {
            type: Type.ARRAY,
            description: "List of prescribed medications.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Name of the medication." },
                    dosage: { type: Type.STRING, description: "Dosage strength, e.g., '500mg'." },
                    timing: { type: Type.STRING, description: "When to take it, e.g., '1-0-1 After food'." },
                    purpose: { type: Type.STRING, description: "The likely medical purpose of this specific medication, e.g., 'Pain relief'." }
                },
                required: ["name", "dosage", "timing", "purpose"],
            },
        },
        precautions: {
            type: Type.ARRAY,
            description: "General precautions or advice mentioned in the prescription.",
            items: { type: Type.STRING },
        },
        vitals: {
            type: Type.OBJECT,
            description: "Patient vitals if mentioned, as key-value pairs.",
            properties: {
                BP: { type: Type.STRING, description: "Blood Pressure reading." },
                Pulse: { type: Type.STRING, description: "Pulse rate." },
                Temp: { type: Type.STRING, description: "Body temperature." },
            },
        },
        drug_interactions: {
            type: Type.ARRAY,
            description: "Analysis of potential interactions between the prescribed drugs.",
            items: {
                type: Type.OBJECT,
                properties: {
                    medicines: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The names of the two or more drugs that interact." },
                    interaction_level: { type: Type.STRING, enum: ['High', 'Moderate', 'Low'], description: "The severity of the potential interaction." },
                    description: { type: Type.STRING, description: "A clear, user-friendly explanation of the potential interaction and what to watch out for." }
                },
                required: ["medicines", "interaction_level", "description"]
            }
        },
        lifestyle_and_diet_recos: {
            type: Type.ARRAY,
            description: "Actionable lifestyle and dietary recommendations relevant to the medications or conditions.",
            items: { type: Type.STRING }
        },
        potential_conditions_summary: {
            type: Type.STRING,
            description: "A brief summary inferring the potential health conditions being treated based on the combination of medications."
        }
    },
    required: ["medications", "precautions", "drug_interactions", "lifestyle_and_diet_recos", "potential_conditions_summary"],
};

const symptomSchema = {
    type: Type.OBJECT,
    properties: {
        disclaimer: { type: Type.STRING, description: "A mandatory disclaimer stating that this is not medical advice and the user should consult a healthcare professional." },
        summary: { type: Type.STRING, description: "A brief summary of the potential issues based on the symptoms." },
        possible_conditions: {
            type: Type.ARRAY,
            description: "A list of possible medical conditions related to the symptoms.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the possible condition." },
                    description: { type: Type.STRING, description: "A brief, user-friendly description of the condition." },
                },
                required: ["name", "description"]
            }
        },
        advice: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Actionable advice and next steps for the user, such as home care or when to see a doctor."
        },
        urgency: {
            type: Type.STRING,
            enum: ['Low', 'Medium', 'High', 'Emergency'],
            description: "An assessment of urgency, indicating if immediate medical attention is needed."
        }
    },
    required: ["disclaimer", "summary", "possible_conditions", "advice", "urgency"]
};


export const analyzePrescription = async (imageFile: File): Promise<PrescriptionInfo> => {
    try {
        const imagePart = await fileToGenerativePart(imageFile);
        const textPart = {
            text: `Provide a deep analysis of this medical prescription image. Your audience is the patient, so make the language clear and easy to understand.
1.  **Medications**: Extract all medications. For each, specify its name, dosage, timing (when to take it), and its likely purpose (e.g., "for blood pressure").
2.  **Drug Interactions**: Critically analyze the list of medications for potential drug-drug interactions. For each interaction found, identify the medicines involved, the severity level ('High', 'Moderate', or 'Low'), and a simple explanation of what could happen. If no interactions are found, return an empty array for this field.
3.  **Potential Conditions**: Based on the collection of medicines, infer the likely health condition(s) being treated and provide a brief summary.
4.  **Lifestyle & Diet**: Give some general lifestyle and dietary recommendations that would be beneficial for the likely conditions.
5.  **Precautions**: List any general precautions or advice written on the prescription.
6.  **Vitals**: If any patient vitals (like BP, pulse) are mentioned, extract them.

Return the final output as a single, clean JSON object that adheres to the provided schema. Do not include any markdown formatting like \`\`\`json or any introductory text.`
        };

        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: prescriptionSchema,
            },
        });

        if (!response.text) {
            throw new Error("No response text received from the AI model.");
        }
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as PrescriptionInfo;
    } catch (error) {
        console.error("Error analyzing prescription:", error);
        throw new Error("Failed to analyze prescription. The image may be unclear or the format is not supported.");
    }
};

export const getMedicineInfo = async (medicineName: string): Promise<MedicineInfo> => {
    try {
        const prompt = `Provide a user-friendly medical overview for "${medicineName}". Detail its primary uses, standard dosage, common side effects, and important precautions. The target audience is a patient, so keep the language clear and concise. Structure the output as a JSON object. Do not include any markdown formatting like \`\`\`json.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: medicineSchema,
            },
        });

        if (!response.text) {
            throw new Error("No response text received from the AI model.");
        }
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as MedicineInfo;
    } catch (error) {
        console.error("Error fetching medicine info:", error);
        throw new Error("Failed to fetch information for the specified medicine.");
    }
};

export const startChatSession = (): Chat => {
    const chat = ai.chats.create({
        model: model,
        config: {
            systemInstruction: "You are 'GenAI Health Buddy', a friendly and empathetic AI assistant. Your goal is to provide helpful information about health, wellness, and medications. You can discuss symptoms, and medicine interactions, or ask general health questions. IMPORTANT: You must always include a disclaimer that you are not a medical professional and your advice should not replace consultation with a qualified healthcare provider, especially when giving suggestions about health conditions or interactions."
        }
    });
    return chat;
};

export const analyzeSymptoms = async (symptoms: string): Promise<SymptomInfo> => {
    try {
        const prompt = `A user has the following symptoms: "${symptoms}". Provide a preliminary analysis. IMPORTANT: You MUST include a clear disclaimer that this is not a medical diagnosis and they must consult a doctor. Based on the symptoms, list possible conditions, provide general advice, and assess the urgency. The language should be clear and for a general audience. Structure the output as a JSON object. Do not include any markdown formatting.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: symptomSchema,
            },
        });

        if (!response.text) {
            throw new Error("No response text received from the AI model.");
        }
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as SymptomInfo;
    } catch (error) {
        console.error("Error analyzing symptoms:", error);
        throw new Error("Failed to analyze symptoms.");
    }
};

export const translateText = async (data: object, langCode: string): Promise<any> => {
    try {
        const dataString = JSON.stringify(data, null, 2);
        const prompt = `Translate the JSON object below into the language with code "${langCode}".
IMPORTANT:
- Translate only the string values of the JSON properties.
- Do NOT translate the JSON keys.
- Do NOT alter the JSON structure.
- Do NOT add any extra text, comments, or markdown formatting like \`\`\`json. The output MUST be only the translated JSON object.

JSON to translate:
${dataString}`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });
        
        if (!response.text) {
            throw new Error("No response text received from the AI model.");
        }
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error(`Translation to ${langCode} failed:`, error);
        throw new Error(`Failed to translate content. Please try again.`);
    }
};