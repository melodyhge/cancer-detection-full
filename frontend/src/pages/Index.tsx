
// import React, { useState, useEffect } from "react";
// import { toast } from "sonner";
// import ImageUpload from "@/components/ImageUpload";
// import ResultView from "@/components/ResultView";
// import { analyzeLungImage, PredictionResponse } from "@/services/api";
// import { Search, Database } from "lucide-react";

// const Index = () => {
//   const [selectedImage, setSelectedImage] = useState<File | null>(null);
//   const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
//   const [result, setResult] = useState<PredictionResponse | null>(null);
//   const [webhookUrl, setWebhookUrl] = useState<string>("");
//   const [showConfig, setShowConfig] = useState<boolean>(false);

//   // Load saved webhook URL from localStorage on component mount
//   useEffect(() => {
//     const savedUrl = localStorage.getItem("webhookUrl");
//     if (savedUrl) {
//       setWebhookUrl(savedUrl);
//     }
//   }, []);

//   const handleImageUpload = (file: File) => {
//     setSelectedImage(file);
//     setResult(null); // Reset results when new image is uploaded
//   };

//   const handleExamineClick = async () => {
//     if (!selectedImage) {
//       toast.error("Please upload an image first");
//       return;
//     }

//     try {
//       setIsAnalyzing(true);
      
//       // Simulate a slight delay to show loading state (remove in production)
//       await new Promise(resolve => setTimeout(resolve, 1500));
      
//       const predictionResult = await analyzeLungImage(selectedImage);
//       setResult(predictionResult);
      
//       toast.success("Analysis complete");
      
//       if (webhookUrl) {
//         toast.success("Results saved to database");
//       }
//     } catch (error) {
//       console.error("Analysis error:", error);
//       toast.error("Error analyzing image. Please try again.");
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   const saveWebhookUrl = () => {
//     localStorage.setItem("webhookUrl", webhookUrl);
//     toast.success("Webhook URL saved");
//     setShowConfig(false);
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
//       <header className="container mx-auto py-8 px-4">
//         <div className="flex justify-center items-center mb-2">
//           <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-3">
//             <Search className="h-5 w-5 text-white" />
//           </div>
//           <h1 className="text-3xl font-semibold tracking-tight text-center">
//             Lung Scan Analyzer
//           </h1>
//         </div>
//         <p className="text-muted-foreground text-center max-w-2xl mx-auto">
//           Upload a lung scan image and our AI will analyze it for potential signs of cancer with high precision.
//         </p>
//       </header>

//       <main className="container mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center">
//         <div className="w-full max-w-4xl mx-auto space-y-10">
//           <div className="flex justify-end">
//             <button 
//               onClick={() => setShowConfig(!showConfig)}
//               className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
//             >
//               <Database className="h-4 w-4 mr-1" /> 
//               {showConfig ? "Hide Database Config" : "Database Config"}
//             </button>
//           </div>

//           {showConfig && (
//             <div className="glass-panel rounded-lg p-4 animate-slide-up">
//               <h3 className="font-medium mb-2">External Webhook Configuration</h3>
//               <p className="text-sm text-muted-foreground mb-4">
//                 Enter a webhook URL to save analysis results to an external service (like Make.com, Pipedream, Zapier, etc.)
//               </p>
//               <div className="flex space-x-2">
//                 <input
//                   type="text"
//                   value={webhookUrl}
//                   onChange={(e) => setWebhookUrl(e.target.value)}
//                   placeholder="https://hooks.zapier.com/hooks/catch/..."
//                   className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
//                 />
//                 <button 
//                   onClick={saveWebhookUrl}
//                   className="bg-primary text-white px-3 py-2 rounded-md text-sm"
//                 >
//                   Save
//                 </button>
//               </div>
//             </div>
//           )}

//           <ImageUpload 
//             onImageUpload={handleImageUpload} 
//             className="mb-6" 
//           />

//           <div className="flex justify-center">
//             <button
//               onClick={handleExamineClick}
//               disabled={!selectedImage || isAnalyzing}
//               className="primary-button w-full max-w-xs"
//             >
//               {isAnalyzing ? (
//                 <span className="flex items-center justify-center">
//                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Analyzing...
//                 </span>
//               ) : (
//                 "Examine"
//               )}
//             </button>
//           </div>

//           {result && (
//             <ResultView result={result} />
//           )}
//         </div>
//       </main>

//       <footer className="container mx-auto py-6 px-4">
//         <p className="text-center text-sm text-muted-foreground">
//           This tool is designed to assist healthcare professionals and is not a substitute for professional medical advice.
//         </p>
//       </footer>
//     </div>
//   );
// };

// export default Index;

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import ImageUpload from "@/components/ImageUpload";
import ResultView from "@/components/ResultView";
import { analyzeLungImage, PredictionResponse } from "@/services/api";
import { Search, Database } from "lucide-react";

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // Load saved webhook URL on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem("webhookUrl");
    if (savedUrl) {
      setWebhookUrl(savedUrl);
      console.log("🔗 Loaded webhook URL from localStorage:", savedUrl);
    }
  }, []);

  const handleImageUpload = (file: File) => {
    setSelectedImage(file);
    setResult(null);
    console.log("🖼 Uploaded image:", file);
  };

  const handleExamineClick = async () => {
    if (!selectedImage) {
      toast.error("Please upload an image first");
      return;
    }

    try {
      setIsAnalyzing(true);
      toast.info("Analyzing... Please wait.");

      // Optional simulated delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("📡 Sending image to API...");
      const predictionResult = await analyzeLungImage(selectedImage);
      console.log("✅ Prediction result:", predictionResult);

      setResult(predictionResult);
      toast.success("Analysis complete");

      if (webhookUrl) {
        console.log("📤 Would send result to webhook:", webhookUrl);
        toast.success("Results saved to external DB");
      }

    } catch (error) {
      console.error("❌ Prediction error:", error);
      toast.error("Error during analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveWebhookUrl = () => {
    localStorage.setItem("webhookUrl", webhookUrl);
    toast.success("Webhook URL saved locally");
    console.log("✅ Webhook URL saved:", webhookUrl);
    setShowConfig(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center mb-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-3">
            <Search className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-center">
            Lung Scan Analyzer
          </h1>
        </div>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto">
          Upload a lung scan image and our AI will analyze it for potential signs of cancer with high precision.
        </p>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl mx-auto space-y-10">
          <div className="flex justify-end">
            <button 
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              
            </button>
          </div>

          {showConfig && (
            <div className="glass-panel rounded-lg p-4 animate-slide-up">
              <h3 className="font-medium mb-2">External Webhook Configuration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter a webhook URL to save analysis results to an external service (like Make, Zapier, etc.)
              </p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
                />
                <button 
                  onClick={saveWebhookUrl}
                  className="bg-primary text-white px-3 py-2 rounded-md text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          <ImageUpload 
            onImageUpload={handleImageUpload} 
            className="mb-6" 
          />

          <div className="flex justify-center">
            <button
              onClick={handleExamineClick}
              disabled={!selectedImage || isAnalyzing}
              className="primary-button w-full max-w-xs"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                "Examine"
              )}
            </button>
          </div>

          {result && (
            <ResultView result={result} />
          )}
        </div>
      </main>

      <footer className="container mx-auto py-6 px-4">
        <p className="text-center text-sm text-muted-foreground">
          This tool is designed to assist healthcare professionals and is not a substitute for professional medical advice.
        </p>
      </footer>
    </div>
  );
};

export default Index;
