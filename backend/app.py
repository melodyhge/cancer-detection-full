from transformers import ViTImageProcessor, ViTForImageClassification
import torch
from PIL import Image
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

import io
import time
import random
import numpy as np
import hashlib
import logging



# ✅ Logging Setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("CancerPredictor")

# ✅ Reproducibility
torch.manual_seed(42)
random.seed(42)
np.random.seed(42)
torch.backends.cudnn.deterministic = True
torch.backends.cudnn.benchmark = False

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081"],  # Use "*" for all origins if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = r"C:\Users\User\Desktop\internship\OncoProject\backend\fine_tuned_model"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

logger.info(f"🖥 Using device: {device}")
logger.info(f"📁 Loading model from: {MODEL_PATH}")

# ✅ Load model and processor
try:
    processor = ViTImageProcessor.from_pretrained(MODEL_PATH, do_rescale=False)
    logger.info("✅ Processor loaded.")

    model = ViTForImageClassification.from_pretrained(MODEL_PATH).to(device)
    model.eval()
    logger.info("✅ Fine-tuned model loaded and set to eval mode.")
except Exception as e:
    logger.error(f"❌ Model loading failed: {e}")
    raise

LABELS = ["cancerous", "non_cancerous"]
CONFIDENCE_THRESHOLD = 0.50

def tensor_hash(tensor):
    return hashlib.sha256(tensor.cpu().numpy().tobytes()).hexdigest()

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        logger.info(f"📂 Received file: {file.filename}")
        start_time = time.time()

        image_bytes = await file.read()
        logger.info(f"🧪 Image byte size: {len(image_bytes)}")

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        logger.info(f"🖼 Image loaded - Mode: {image.mode}, Size: {image.size}")

        image = image.resize((224, 224))

        inputs = processor(
            images=image,
            return_tensors="pt",
            do_resize=False,
            do_center_crop=False,
            do_rescale=True  # ✅ Let processor normalize to [0,1] as in training
        )

        pixel_values = inputs["pixel_values"]
        logger.info(f"🎯 Tensor Stats — Mean: {pixel_values.mean().item():.4f}, Std: {pixel_values.std().item():.4f}")
        logger.info(f"🔐 SHA-256 Tensor Hash: {tensor_hash(pixel_values)}")

        inputs = {k: v.to(device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits

        logger.info(f"🔢 Logits: {logits}")

        probs = torch.nn.functional.softmax(logits, dim=-1).squeeze()  # shape: (2,)
        confidence, predicted_class_idx = torch.max(probs, dim=0)

        LABELS = {0: "cancerous", 1: "non_cancerous"}
        predicted_label = LABELS[predicted_class_idx.item()]
        confidence_percent = round(confidence.item() * 100, 2)

        # 💡 Threshold logic: mark uncertain if confidence is too low
        if confidence.item() < CONFIDENCE_THRESHOLD:
            predicted_label = "uncertain"
            logger.warning(f"⚠️ Confidence below threshold ({confidence_percent}%). Marked as uncertain.")

        response_time = round((time.time() - start_time) * 1000, 2)
        logger.info(f"✅ Final Prediction: {predicted_label} ({confidence_percent}%) | ⏱ Time: {response_time}ms")

        return JSONResponse({
            "prediction": predicted_label,
            "confidence": confidence_percent,
            "processing_time_ms": response_time
        })

    except Exception as e:
        logger.error(f"❌ Prediction error: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)