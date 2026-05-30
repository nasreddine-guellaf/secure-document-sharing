# AI Document Classification Service

FastAPI microservice for automatic document classification in the Secure Document Sharing System.

The backend already calls this service at:

```env
AI_SERVICE_URL=http://localhost:8001
```

Compatible endpoint:

```http
POST /classify
Content-Type: multipart/form-data
```

The file field name must be:

```text
file
```

## Features

- TXT, PDF, and DOCX text extraction.
- Hugging Face zero-shot classification.
- Categories restricted to:
  - Contrat
  - Facture
  - Rapport
  - CV
  - Diplôme
  - Lettre administrative
  - Autre
- Language detection with `langdetect`.
- Clean JSON error responses.
- CORS enabled for local development.
- The AI model is loaded lazily and cached, not reloaded on each request.
- Improved classifier using zero-shot Transformer classification, chunk aggregation, keyword boosting, and confidence thresholding.

## Classification Strategy

The classifier keeps the public API categories unchanged. It first uses a fast keyword path for obvious documents, then falls back to zero-shot Transformer classification for ambiguous documents. Long documents are cleaned, limited to useful text, split into chunks, and classified with French hypothesis templates. Scores are averaged per official category, then adjusted with keyword boosts for strong signals such as `facture`, `contrat`, `curriculum vitae`, `rapport`, `diplôme`, and administrative-letter terms.

If the best score is too low, or if the top categories are too close without clear keyword support, the service returns `Autre` to avoid unstable predictions.

## Setup on Windows PowerShell

```powershell
cd ai-service
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

The first classification request can take time because Transformers downloads and loads the model.

## Optional Model Configuration

Default model:

```text
MoritzLaurer/mDeBERTa-v3-base-mnli-xnli
```

You can override it:

```powershell
$env:AI_MODEL_NAME="MoritzLaurer/mDeBERTa-v3-base-mnli-xnli"
$env:AI_FALLBACK_MODEL_NAME="valhalla/distilbart-mnli-12-1"
$env:AI_MAX_TEXT_CHARS="3500"
$env:AI_CHUNK_SIZE="1200"
$env:AI_MAX_CHUNKS="1"
$env:AI_MAX_TEMPLATES="1"
$env:AI_KEYWORD_FAST_PATH="true"
$env:AI_CONFIDENCE_THRESHOLD="0.45"
$env:AI_AMBIGUITY_MARGIN="0.08"
$env:AI_MODEL_DEVICE="-1"
```

Use `AI_MODEL_DEVICE=-1` for CPU. If you have CUDA configured, use `0`.

## Test Health

```powershell
curl http://localhost:8001/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "ai-classification-service"
}
```

## Test File Classification

```powershell
curl.exe -X POST http://localhost:8001/classify `
  -F "file=@test_files/contrat_test.txt"
```

Expected response shape:

```json
{
  "status": "success",
  "category": "Contrat",
  "confidence": 0.92,
  "model": "MoritzLaurer/mDeBERTa-v3-base-mnli-xnli",
  "language": "fr",
  "extracted_text_length": 2450
}
```

## Test Text Classification

```powershell
curl.exe -X POST http://localhost:8001/classify-text `
  -H "Content-Type: application/json" `
  -d "{\"text\":\"Le présent contrat est conclu entre les deux parties.\"}"
```

Expected response shape:

```json
{
  "status": "success",
  "category": "Contrat",
  "confidence": 0.92,
  "model": "MoritzLaurer/mDeBERTa-v3-base-mnli-xnli",
  "language": "fr",
  "extracted_text_length": 54
}
```

## Error Response

```json
{
  "status": "error",
  "category": "Autre",
  "confidence": 0,
  "model": "unknown",
  "language": "unknown",
  "extracted_text_length": 0,
  "message": "Clear error message"
}
```

## Full Integration Run

Terminal 1:

```powershell
cd backend
npm run dev
```

Terminal 2:

```powershell
cd frontend
npm run dev
```

Terminal 3:

```powershell
cd smart-contract
npx hardhat node
```

Terminal 4:

```powershell
cd ai-service
.\venv\Scripts\activate
uvicorn app.main:app --reload --port 8001
```

Then upload a TXT, PDF, or DOCX document from the frontend. The backend will call:

```text
POST http://localhost:8001/classify
```

with form-data key:

```text
file
```
