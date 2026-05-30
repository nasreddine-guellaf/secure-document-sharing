from fastapi import FastAPI, File, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from langdetect import DetectorFactory, LangDetectException, detect

from app.classifier import classify_text as run_classification
from app.config import SERVICE_NAME
from app.schemas import TextClassificationRequest
from app.text_extractor import UnsupportedFileTypeError, extract_text


DetectorFactory.seed = 0

app = FastAPI(
    title="AI Document Classification Service",
    version="1.0.0",
    description="FastAPI microservice for document text extraction and AI classification.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def error_payload(message: str, language: str = "unknown", extracted_text_length: int = 0):
    return {
        "status": "error",
        "category": "Autre",
        "confidence": 0,
        "model": "unknown",
        "language": language,
        "extracted_text_length": extracted_text_length,
        "message": message,
    }


def success_payload(classification: dict, language: str, extracted_text_length: int):
    return {
        "status": "success",
        "category": classification["category"],
        "confidence": classification["confidence"],
        "model": classification["model"],
        "language": language,
        "extracted_text_length": extracted_text_length,
    }


def detect_language(text: str) -> str:
    try:
        language = detect(text)
    except LangDetectException:
        return "unknown"

    if language == "fr":
        return "fr"

    if language == "en":
        return "en"

    return language or "unknown"


def classify_extracted_text(text: str):
    cleaned_text = (text or "").strip()
    extracted_text_length = len(cleaned_text)
    print(f"[AI API] Extracted text length: {extracted_text_length}")

    if not cleaned_text:
        return error_payload(
            "Aucun texte exploitable n'a été extrait du document.",
            extracted_text_length=0,
        )

    language = detect_language(cleaned_text)
    print(f"[AI API] Detected language: {language}")
    classification = run_classification(cleaned_text)
    return success_payload(classification, language, extracted_text_length)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=200,
        content=error_payload(f"Invalid request: {exc.errors()}"),
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=200,
        content=error_payload(str(exc) or "Unexpected AI service error."),
    )


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": SERVICE_NAME,
    }


@app.post("/classify")
async def classify_file(file: UploadFile = File(...)):
    try:
        if not file.filename:
            return error_payload("A file with a valid filename is required.")

        file_bytes = await file.read()

        if not file_bytes:
            return error_payload("Uploaded file is empty.")

        text = extract_text(file.filename, file_bytes)
        return classify_extracted_text(text)
    except UnsupportedFileTypeError as error:
        return error_payload(str(error))
    except Exception as error:
        return error_payload(str(error) or "Document classification failed.")
    finally:
        await file.close()


@app.post("/classify-text")
async def classify_text(request: TextClassificationRequest):
    try:
        return classify_extracted_text(request.text)
    except Exception as error:
        return error_payload(str(error) or "Text classification failed.")
