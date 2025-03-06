import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface PanelAnalysisResult {
  compliant: boolean;
  issues: string[];
  recommendations: string[];
  summary: string;
}

export async function analyzePanelImage(base64Image: string): Promise<PanelAnalysisResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert electrical inspector with deep knowledge of the National Electrical Code (NEC 2023). Analyze the electrical panel image and provide detailed compliance information. Focus on safety issues, code violations, and recommendations. Provide output in JSON format with fields: compliant (boolean), issues (array), recommendations (array), and summary (string)."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this electrical panel for NEC 2023 compliance."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(response.choices[0].message.content);
    return {
      compliant: analysis.compliant,
      issues: analysis.issues,
      recommendations: analysis.recommendations,
      summary: analysis.summary
    };
  } catch (error) {
    throw new Error("Failed to analyze panel image: " + error.message);
  }
}
