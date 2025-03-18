// Using Hugging Face Inference API instead of OpenAI

const HF_API_TOKEN = process.env.HF_API_TOKEN; // Free access token from Hugging Face
const API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

export async function getContextFromAI(text: string): Promise<string> {
  try {
    if (!text || text.trim().length < 3) {
      return '';
    }
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `<s>[INST] Provide brief context (under 100 words) about this text: ${text} [/INST]</s>`,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          return_full_text: false,
        }
      }),
    });

    const data = await response.json();
    
    // Handle response format from Hugging Face
    if (data && data[0] && data[0].generated_text) {
      return data[0].generated_text.trim();
    }
    
    return 'No context available';
  } catch (error) {
    console.error('Error fetching context from AI:', error);
    return 'Error fetching context';
  }
} 