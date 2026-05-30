import os


SERVICE_NAME = "ai-classification-service"

CATEGORIES = [
    "Contrat",
    "Facture",
    "Rapport",
    "CV",
    "Diplôme",
    "Lettre administrative",
    "Autre",
]

DEFAULT_MODEL_NAME = "MoritzLaurer/mDeBERTa-v3-base-mnli-xnli"
DEFAULT_FALLBACK_MODEL_NAME = "valhalla/distilbart-mnli-12-1"

MODEL_NAME = os.getenv("AI_MODEL_NAME", DEFAULT_MODEL_NAME)
FALLBACK_MODEL_NAME = os.getenv("AI_FALLBACK_MODEL_NAME", DEFAULT_FALLBACK_MODEL_NAME)
MAX_TEXT_CHARS = int(os.getenv("AI_MAX_TEXT_CHARS", "3500"))
CHUNK_SIZE = int(os.getenv("AI_CHUNK_SIZE", "1200"))
MAX_CHUNKS = int(os.getenv("AI_MAX_CHUNKS", "1"))
MAX_TEMPLATES = int(os.getenv("AI_MAX_TEMPLATES", "1"))
MODEL_DEVICE = int(os.getenv("AI_MODEL_DEVICE", "-1"))
CONFIDENCE_THRESHOLD = float(os.getenv("AI_CONFIDENCE_THRESHOLD", "0.35"))
AMBIGUITY_MARGIN = float(os.getenv("AI_AMBIGUITY_MARGIN", "0.06"))
KEYWORD_BOOST = float(os.getenv("AI_KEYWORD_BOOST", "0.08"))
KEYWORD_FAST_PATH = os.getenv("AI_KEYWORD_FAST_PATH", "true").lower() in {
    "true",
    "1",
    "yes",
    "on",
}
