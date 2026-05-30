from typing import Optional

from pydantic import BaseModel, Field


class TextClassificationRequest(BaseModel):
    text: str = Field(..., min_length=1)


class ClassificationResponse(BaseModel):
    status: str
    category: str
    confidence: float
    model: str
    language: str
    extracted_text_length: int
    message: Optional[str] = None
