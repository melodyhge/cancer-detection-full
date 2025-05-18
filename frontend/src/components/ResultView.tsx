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

  const prediction = result.prediction?.toLowerCase() as "cancerous" | "non_cancerous" | "uncertain";
  const confidencePercent = result.confidence.toFixed(2);

  const isCancerous = prediction === "cancerous";
  const isNonCancerous = prediction === "non_cancerous";
  const isUncertain = prediction === "uncertain";

  const getDiagnosisText = () => {
    if (isCancerous) return "⚠️ Cancer Detected";
    if (isNonCancerous) return "✅ No Cancer Detected";
    if (isUncertain) return "❓ Prediction Uncertain";
    return "❓ Invalid Prediction";
  };

  const getDiagnosisColor = () => {
    if (isCancerous) return "text-destructive";
    if (isNonCancerous) return "text-emerald-600";
    if (isUncertain) return "text-yellow-500";
    return "text-gray-500";
  };

  const getBarColor = () => {
    if (isCancerous) return "bg-destructive";
    if (isNonCancerous) return "bg-emerald-500";
    if (isUncertain) return "bg-yellow-500";
    return "bg-gray-400";
  };

  const getInterpretation = () => {
    if (isUncertain)
      return "The AI model wasn't confident enough to determine the result. Please upload a clearer image or consult a specialist.";
    if (isCancerous)
      return "The scan shows indicators consistent with cancerous tissue. Please consult a healthcare professional.";
    if (isNonCancerous)
      return "The scan appears normal. Still, consult a healthcare professional for full evaluation.";
    return "No interpretation available. Please try another image.";
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
            <div className={`text-xl font-medium ${getDiagnosisColor()}`}>
              {getDiagnosisText()}
            </div>
          </div>

          <div>
            <p className="subtle-text mb-1">Confidence</p>
            <div className="flex items-center space-x-3">
              <div className="w-full bg-secondary rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${getBarColor()}`}
                  style={{ width: `${confidencePercent}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium w-16">{confidencePercent}%</span>
            </div>
          </div>

          {result.processing_time_ms && (
            <div>
              <p className="subtle-text mb-1">Processing Time</p>
              <div className="text-sm">
                {result.processing_time_ms.toFixed(2)} ms
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 text-sm text-muted-foreground">
          <p className="italic">{getInterpretation()}</p>
        </div>

        
      </div>
    </div>
  );
};

export default ResultView;
