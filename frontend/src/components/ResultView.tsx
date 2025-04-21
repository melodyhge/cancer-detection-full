
import React from "react";
import { cn } from "@/lib/utils";
import { Check, Database } from "lucide-react";
import { sendResultsToWebhook } from "@/services/api";
import { toast } from "sonner";

interface ResultViewProps {
  result: {
    prediction: string;
    confidence: number;
    processing_time_ms?: number;
  } | null;
  className?: string;
}

const ResultView: React.FC<ResultViewProps> = ({ result, className }) => {
  if (!result) return null;

  const isCancerous = result.prediction === "cancerous";
  const confidencePercent = result.confidence.toFixed(2);
  
  const handleSaveToDatabase = async () => {
    const webhookUrl = localStorage.getItem("webhookUrl");
    
    if (!webhookUrl) {
      toast.error("Webhook URL not configured. Click on 'Database Config' to set it up.");
      return;
    }
    
    try {
      await sendResultsToWebhook(result, "manually_saved_result", webhookUrl);
      toast.success("Results saved to database via webhook");
    } catch (error) {
      toast.error("Failed to save to database");
    }
  };
  
  return (
    <div className={cn("w-full max-w-md mx-auto animate-slide-up", className)}>
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Analysis Result</h2>
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <Check className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="subtle-text mb-1">Diagnosis</p>
            <div className={`text-xl font-medium ${isCancerous ? "text-destructive" : "text-emerald-600"}`}>
              {isCancerous ? "Cancerous Tissue Detected" : "No Cancer Detected"}
            </div>
          </div>
          
          <div>
            <p className="subtle-text mb-1">Confidence</p>
            <div className="flex items-center space-x-3">
              <div className="w-full bg-secondary rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${isCancerous ? "bg-destructive" : "bg-emerald-500"}`} 
                  style={{ width: `${confidencePercent}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium w-16">{confidencePercent}%</span>
            </div>
          </div>
          
          {result.processing_time_ms && (
            <div>
              <p className="subtle-text mb-1">Processing Time</p>
              <div className="text-sm">{result.processing_time_ms.toFixed(2)} ms</div>
            </div>
          )}
        </div>

        <div className="pt-4 text-sm text-muted-foreground">
          <p className="italic">
            {isCancerous
              ? "The scan shows indicators consistent with cancerous tissue. Please consult with a healthcare professional for a complete diagnosis."
              : "The scan appears to be normal. However, always consult with a healthcare professional for a complete evaluation."}
          </p>
        </div>
        
        <button 
          onClick={handleSaveToDatabase}
          className="mt-4 w-full flex items-center justify-center bg-secondary hover:bg-secondary/90 text-primary py-2 px-4 rounded-md text-sm transition-colors"
        >
          <Database className="mr-2 h-4 w-4" /> Save to Database
        </button>
      </div>
    </div>
  );
};

export default ResultView;
