from transformers import ViTImageProcessor, ViTForImageClassification
import torch
from PIL import Image
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import io
import time
import random
import numpy as np
import hashlib

# ✅ Reproducibility
torch.manual_seed(42)
random.seed(42)
np.random.seed(42)
torch.backends.cudnn.deterministic = True
torch.backends.cudnn.benchmark = False

app = FastAPI()

# ✅ Path to Fine-Tuned Model
MODEL_PATH = r"C:\Users\User\Desktop\internship\OncoProject\backend\fine_tuned_model"

# ✅ Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"✅ Using device: {device}")
print("✅ Using model from:", MODEL_PATH)


# ✅ Load model and processor
try:
    print("🔹 Loading Processor...")
    processor = ViTImageProcessor.from_pretrained(MODEL_PATH, do_rescale=False)
    print("✅ Processor loaded.")

    print("🔹 Loading Fine-Tuned Model...")
    model = ViTForImageClassification.from_pretrained(MODEL_PATH).to(device)
    model.eval()
    print("✅ Model loaded successfully.")

except Exception as e:
    print(f"❌ ERROR: Failed to load model. {e}")
    raise

LABELS = ["cancerous", "non_cancerous"]
CONFIDENCE_THRESHOLD = 50.0

# 🔐 Helper: Hash tensor for consistency check
def tensor_hash(tensor):
    return hashlib.sha256(tensor.cpu().numpy().tobytes()).hexdigest()

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        print(f"📂 Received file: {file.filename}")
        start_time = time.time()

        # ✅ Read image and preprocess
        image_bytes = await file.read()
        print(f"🧪 Image size in bytes: {len(image_bytes)}")

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        print(f"🖼 Image mode: {image.mode}, size: {image.size}")

        # Optional fixed resize for consistency
        image = image.resize((224, 224))  # Avoid randomness in auto-resize
        inputs = processor(images=image, return_tensors="pt", do_resize=False)

        # Tensor debug
        pixel_values = inputs["pixel_values"]
        print(f"🎯 Tensor Mean: {pixel_values.mean().item():.6f}, Std: {pixel_values.std().item():.6f}")
        print(f"🎯 Tensor Min: {pixel_values.min().item():.6f}, Max: {pixel_values.max().item():.6f}")
        print(f"🔐 Input tensor SHA-256: {tensor_hash(pixel_values)}")

        # Send to device
        inputs = {k: v.to(device) for k, v in inputs.items()}

        # ✅ Inference
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
        print(f"🔢 Logits: {logits}")

        # ✅ Prediction
        probs = torch.nn.functional.softmax(logits, dim=-1)
        print(f"📊 Probabilities: {probs}")

        predicted_class_idx = probs.argmax(-1).item()
        predicted_label = LABELS[predicted_class_idx]
        confidence = round(probs[0][predicted_class_idx].item() * 100, 2)

        # Handle low confidence
        if confidence < CONFIDENCE_THRESHOLD:
            predicted_label = "Uncertain"

        response_time = round((time.time() - start_time) * 1000, 2)
        print(f"🔍 Prediction: {predicted_label} ({confidence}%) - Time: {response_time}ms")

        return JSONResponse({
            "prediction": predicted_label,
            "confidence": confidence,
            "processing_time_ms": response_time
        })

    except Exception as e:
        print(f"❌ ERROR: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)
