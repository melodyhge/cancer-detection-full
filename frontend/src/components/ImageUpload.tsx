
import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Upload, Image as ImageIcon, FileImage } from "lucide-react";

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, className }) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    processFile(files[0]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      onImageUpload(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    inputRef.current?.click();
  };

  return (
    <div 
      className={cn(
        "relative w-full aspect-[3/2] max-w-2xl mx-auto rounded-xl border-2 border-dashed",
        dragActive 
          ? "border-primary bg-primary/5 ring-2 ring-primary/30" 
          : "border-muted-foreground/25 hover:border-primary/50",
        "transition-all duration-300 ease-in-out", 
        className
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={triggerFileInput}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      
      {preview ? (
        <div className="w-full h-full relative fade-in">
          <img
            src={preview}
            alt="Uploaded lung scan"
            className="w-full h-full object-contain rounded-lg"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <p className="text-white bg-black/70 px-4 py-2 rounded-full text-sm">
              Click to change image
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full space-y-6 p-6">
          <div className="w-20 h-20 rounded-full bg-secondary/80 flex items-center justify-center">
            {dragActive ? (
              <FileImage className="h-10 w-10 text-primary animate-pulse" />
            ) : (
              <Upload className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-2 text-center">
            <h3 className="font-medium text-xl">
              {dragActive ? "Drop the image here" : "Upload lung scan image"}
            </h3>
            <p className="text-muted-foreground text-base">
              Drag and drop your image, or click to browse
            </p>
            <div className="mt-2 p-3 bg-secondary/50 rounded-lg inline-block">
              <p className="text-sm text-muted-foreground">
                Supports: JPG, PNG, JPEG
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
