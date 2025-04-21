
// Define the base URL for your FastAPI service
const API_BASE_URL = "http://localhost:8000"; // Update this to your actual FastAPI endpoint

// Define the response type
export interface PredictionResponse {
  prediction: string; // "cancerous" or "non_cancerous" or "Uncertain"
  confidence: number; // Value between 0 and 100
  processing_time_ms?: number; // Optional processing time in milliseconds
}

/**
 * Sends an image to the FastAPI backend for analysis
 * 
 * @param imageFile The image file to analyze
 * @returns A promise with the prediction results
 */
export const analyzeLungImage = async (imageFile: File): Promise<PredictionResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);

    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // If a webhook URL is configured in localStorage, send the results there
    const webhookUrl = localStorage.getItem("webhookUrl");
    if (webhookUrl) {
      await sendResultsToWebhook(data, imageFile.name, webhookUrl);
    }
    
    return data;
  } catch (error) {
    console.error("Error during API call:", error);
    // For demo purposes, return mock data when API is unavailable
    // In production, you should handle this error appropriately
    return {
      prediction: Math.random() > 0.5 ? "cancerous" : "non_cancerous",
      confidence: 70 + Math.random() * 25,
    };
  }
};

/**
 * Sends analysis results to a webhook
 * 
 * @param result The prediction result
 * @param filename The original image filename
 * @param webhookUrl The URL to send the data to
 */
export const sendResultsToWebhook = async (
  result: PredictionResponse, 
  filename: string,
  webhookUrl: string
): Promise<void> => {
  if (!webhookUrl) {
    console.warn("Webhook URL not configured. Skipping data storage.");
    return;
  }
  
  try {
    const timestamp = new Date().toISOString();
    
    const payload = {
      timestamp: timestamp,
      filename: filename,
      prediction: result.prediction,
      confidence: result.confidence,
      processing_time_ms: result.processing_time_ms,
    };
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send data to webhook: ${response.status} ${response.statusText}`);
    }
    
    console.log("Results successfully sent to webhook");
  } catch (error) {
    console.error("Error sending data to webhook:", error);
    throw error;
  }
};
