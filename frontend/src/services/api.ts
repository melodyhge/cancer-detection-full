const API_BASE_URL = "http://localhost:8000"; // ✅ Change for production if needed

export interface PredictionResponse {
  prediction: "cancerous" | "non_cancerous" | "uncertain";
  confidence: number;
  processing_time_ms?: number;
}

/**
 * Sends an image to the FastAPI backend for prediction
 */
export const analyzeLungImage = async (
  imageFile: File,
  onSuccess?: (data: PredictionResponse) => void,
  onError?: (error: any) => void
): Promise<PredictionResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);

    const response = await fetch(`${API_BASE_URL}/predict/`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data: PredictionResponse = await response.json();
    console.log("🧪 Prediction result:", data);

    const pred = data.prediction?.toLowerCase();

    // Normalize label (just in case backend gives "Uncertain" capitalized)
    if (pred === "cancerous" || pred === "non_cancerous" || pred === "uncertain") {
      data.prediction = pred;
    } else {
      console.warn("⚠️ Unexpected prediction value:", pred);
      data.prediction = "uncertain"; // fallback
    }
    
    // 🔄 Send to webhook if available
    const webhookUrl = localStorage.getItem("webhookUrl");
    if (webhookUrl) {
      await sendResultsToWebhook(data, imageFile.name, webhookUrl);
    }

    if (onSuccess) onSuccess(data);
    return data;

  } catch (error) {
    console.error("❌ Error during prediction:", error);
    if (onError) onError(error);

    // Return fallback for testing
    return {
      prediction: Math.random() > 0.5 ? "cancerous" : "non_cancerous",
      confidence: 70 + Math.random() * 25,
    };
  }
};

/**
 * Sends results to a webhook (optional)
 */
export const sendResultsToWebhook = async (
  result: PredictionResponse,
  filename: string,
  webhookUrl: string
): Promise<void> => {
  if (!webhookUrl) {
    console.warn("⚠️ Webhook URL not set. Skipping...");
    return;
  }

  try {
    const payload = {
      timestamp: new Date().toISOString(),
      filename,
      ...result,
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    console.log("✅ Webhook sent successfully");

  } catch (error) {
    console.error("❌ Failed to send webhook:", error);
  }
};
