import re
import unicodedata
from collections import defaultdict
from threading import Lock
from typing import Dict, List, Optional, Tuple

from app.config import (
    AMBIGUITY_MARGIN,
    CATEGORIES,
    CHUNK_SIZE,
    CONFIDENCE_THRESHOLD,
    FALLBACK_MODEL_NAME,
    KEYWORD_BOOST,
    KEYWORD_FAST_PATH,
    MAX_CHUNKS,
    MAX_TEMPLATES,
    MAX_TEXT_CHARS,
    MODEL_DEVICE,
    MODEL_NAME,
)


# The Transformer only sees real classes. "Autre" is assigned by our confidence
# rules, because broad "other" labels often steal probability from clear classes.
MODEL_CATEGORIES = [category for category in CATEGORIES if category != "Autre"]

LABEL_DESCRIPTIONS = {
    "Contrat": "un contrat juridique ou administratif avec parties, obligations, clauses, signatures ou conditions",
    "Facture": "une facture avec montant, TVA, numéro de facture, client, fournisseur ou paiement",
    "Rapport": "un rapport de projet académique, technique ou professionnel avec sommaire, introduction, objectifs, méthodologie, analyse, réalisation, résultats ou conclusion",
    "CV": "un curriculum vitae avec formation, expériences professionnelles, compétences, projets ou informations personnelles",
    "Diplôme": "un diplôme, certificat ou attestation académique avec université, école, mention ou année d'obtention",
    "Lettre administrative": "une lettre administrative, demande officielle, réclamation, attestation ou correspondance formelle",
}

LABEL_TO_CATEGORY = {label: category for category, label in LABEL_DESCRIPTIONS.items()}
MODEL_LABELS = list(LABEL_DESCRIPTIONS.values())

ALL_HYPOTHESIS_TEMPLATES = [
    "Ce document est {}.",
    "Le type de ce document est {}.",
    "Ce fichier correspond à {}.",
    "Le contenu principal de ce document est {}.",
]

KEYWORD_RULES = {
    "Facture": [
        "facture",
        "montant",
        "tva",
        "total à payer",
        "total a payer",
        "référence client",
        "reference client",
        "paiement",
        "fournisseur",
        "client",
    ],
    "Contrat": [
        "contrat",
        "les parties",
        "signature",
        "clause",
        "article",
        "obligations",
        "conditions",
        "convention",
    ],
    "CV": [
        "curriculum vitae",
        "expérience professionnelle",
        "experience professionnelle",
        "experiences professionnelles",
        "expériences professionnelles",
        "experience",
        "expérience",
        "formation",
        "compétences",
        "competences",
        "projets réalisés",
        "projets realises",
        "stage",
        "stages",
        "emploi",
        "poste",
        "langues",
        "profil",
        "contact",
        "email",
        "e-mail",
        "téléphone",
        "telephone",
        "linkedin",
        "github",
        "adresse",
        "centres d'intérêt",
        "centres d'interet",
    ],
    "Rapport": [
        "rapport",
        "rapport de projet",
        "projet",
        "mini projet",
        "sommaire",
        "table des matières",
        "table des matieres",
        "introduction",
        "objectif",
        "objectifs",
        "problématique",
        "problematique",
        "méthodologie",
        "methodologie",
        "analyse",
        "conception",
        "réalisation",
        "realisation",
        "implémentation",
        "implementation",
        "résultats",
        "resultats",
        "discussion",
        "conclusion",
        "chapitre",
        "base de données",
        "base de donnees",
        "sql",
        "pl/sql",
        "oracle",
        "requête",
        "requete",
        "procédure",
        "procedure",
        "déclencheur",
        "declencheur",
    ],
    "Diplôme": [
        "diplôme",
        "diplome",
        "diplôme de",
        "diplome de",
        "certificat",
        "certifie que",
        "certifions que",
        "attestation de réussite",
        "attestation de reussite",
        "a obtenu",
        "délivré",
        "delivre",
        "décerné",
        "decerne",
        "université",
        "universite",
        "école",
        "ecole",
        "mention",
        "année d'obtention",
        "annee d'obtention",
    ],
    "Lettre administrative": [
        "demande",
        "objet",
        "monsieur",
        "madame",
        "lettre",
        "administratif",
        "administrative",
        "réclamation",
        "reclamation",
        "veuillez agréer",
        "veuillez agreer",
    ],
}

STRONG_KEYWORDS = {
    "Facture": ["facture", "tva", "total à payer", "total a payer"],
    "Contrat": ["contrat", "convention"],
    "CV": ["curriculum vitae", "compétences", "competences", "expérience professionnelle", "experience professionnelle"],
    "Rapport": ["rapport", "rapport de projet", "sommaire", "introduction", "conclusion", "chapitre", "projet"],
    "Diplôme": ["attestation de réussite", "attestation de reussite", "certifie que", "a obtenu", "diplôme de", "diplome de"],
    "Lettre administrative": ["objet", "monsieur", "madame"],
}

_pipeline = None
_loaded_model_name = None
_pipeline_lock = Lock()


def _load_pipeline(model_name: str):
    from transformers import pipeline

    return pipeline(
        "zero-shot-classification",
        model=model_name,
        device=MODEL_DEVICE,
    )


def get_classifier_pipeline():
    global _pipeline, _loaded_model_name

    if _pipeline is not None:
        return _pipeline, _loaded_model_name

    with _pipeline_lock:
        if _pipeline is not None:
            return _pipeline, _loaded_model_name

        try:
            print(f"Loading AI classification model: {MODEL_NAME}")
            _pipeline = _load_pipeline(MODEL_NAME)
            _loaded_model_name = MODEL_NAME
        except Exception as primary_error:
            if not FALLBACK_MODEL_NAME or FALLBACK_MODEL_NAME == MODEL_NAME:
                raise RuntimeError(f"Could not load AI model '{MODEL_NAME}': {primary_error}") from primary_error

            try:
                print(f"Primary model failed. Loading fallback AI model: {FALLBACK_MODEL_NAME}")
                _pipeline = _load_pipeline(FALLBACK_MODEL_NAME)
                _loaded_model_name = FALLBACK_MODEL_NAME
            except Exception as fallback_error:
                raise RuntimeError(
                    "Could not load AI classification models. "
                    f"Primary error: {primary_error}. Fallback error: {fallback_error}"
                ) from fallback_error

    return _pipeline, _loaded_model_name


def remove_accents(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    return "".join(character for character in normalized if not unicodedata.combining(character))


def normalize_for_matching(value: str) -> str:
    return remove_accents(value).lower()


def is_page_number_noise(line: str) -> bool:
    normalized = normalize_for_matching(line).strip()

    if not normalized:
        return False

    page_patterns = [
        r"^(page\s*)?\d+\s*(/|sur|of)\s*\d+$",
        r"^page\s+\d+$",
        r"^[-–—]?\s*\d{1,3}\s*[-–—]?$",
    ]

    return any(re.fullmatch(pattern, normalized) for pattern in page_patterns)


def clean_text(text: str) -> str:
    raw_text = (text or "").replace("\x00", " ").replace("\u00a0", " ")
    raw_text = raw_text.replace("\r\n", "\n").replace("\r", "\n")

    cleaned_lines: List[str] = []
    previous_empty = False

    for raw_line in raw_text.split("\n"):
        line = re.sub(r"[ \t]+", " ", raw_line).strip()

        if is_page_number_noise(line):
            continue

        if not line:
            if not previous_empty:
                cleaned_lines.append("")
            previous_empty = True
            continue

        cleaned_lines.append(line)
        previous_empty = False

    cleaned = "\n".join(cleaned_lines)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    cleaned = re.sub(r"[ \t]{2,}", " ", cleaned).strip()

    if len(cleaned) <= MAX_TEXT_CHARS:
        return cleaned

    limited = cleaned[:MAX_TEXT_CHARS]
    return limited.rsplit(" ", 1)[0].strip() or limited.strip()


def split_into_chunks(text: str) -> List[str]:
    words = text.split()
    chunks: List[str] = []
    current_words: List[str] = []
    current_length = 0

    for word in words:
        extra_length = len(word) + (1 if current_words else 0)

        if current_words and current_length + extra_length > CHUNK_SIZE:
            chunks.append(" ".join(current_words))
            current_words = [word]
            current_length = len(word)

            if len(chunks) >= MAX_CHUNKS:
                break
            continue

        current_words.append(word)
        current_length += extra_length

    if current_words and len(chunks) < MAX_CHUNKS:
        chunks.append(" ".join(current_words))

    return chunks or [text]


def normalize_pipeline_result(result):
    return result if isinstance(result, list) else [result]


def active_templates() -> List[str]:
    return ALL_HYPOTHESIS_TEMPLATES[: max(1, min(MAX_TEMPLATES, len(ALL_HYPOTHESIS_TEMPLATES)))]


def average_zero_shot_scores(classifier, chunks: List[str]) -> Dict[str, float]:
    score_sums = defaultdict(float)
    score_counts = defaultdict(int)

    for template in active_templates():
        results = classifier(
            chunks,
            candidate_labels=MODEL_LABELS,
            hypothesis_template=template,
            multi_label=False,
        )

        for result in normalize_pipeline_result(results):
            for label, score in zip(result.get("labels", []), result.get("scores", [])):
                category = LABEL_TO_CATEGORY.get(label)

                if category:
                    score_sums[category] += float(score)
                    score_counts[category] += 1

    scores = {category: 0.0 for category in CATEGORIES}
    for category in MODEL_CATEGORIES:
        if score_counts[category]:
            scores[category] = score_sums[category] / score_counts[category]

    return scores


def count_keyword_support(text: str) -> Dict[str, int]:
    normalized_text = normalize_for_matching(text)
    support = {category: 0 for category in CATEGORIES}

    for category, keywords in KEYWORD_RULES.items():
        for keyword in keywords:
            if normalize_for_matching(keyword) in normalized_text:
                support[category] += 1

    return support


def has_strong_keyword(text: str, category: str) -> bool:
    normalized_text = normalize_for_matching(text)
    return any(normalize_for_matching(keyword) in normalized_text for keyword in STRONG_KEYWORDS.get(category, []))


def looks_like_cv(text: str, keyword_support: Dict[str, int]) -> bool:
    normalized_text = normalize_for_matching(text)

    contact_signal = any(
        re.search(pattern, normalized_text)
        for pattern in [
            r"\b[\w.+-]+@[\w.-]+\.\w+\b",
            r"\b(06|07|\+212|0[1-9])[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}\b",
            r"\blinkedin\b",
            r"\bgithub\b",
            r"\badresse\b",
            r"\bcontact\b",
        ]
    )

    section_signals = 0
    section_groups = [
        ["experience", "experiences", "expérience", "expériences", "stage", "emploi", "poste"],
        ["competences", "compétences", "skills", "outils", "technologies"],
        ["formation", "education", "études", "etudes"],
        ["langues", "languages"],
        ["profil", "objectif professionnel", "resume", "résumé"],
    ]

    for group in section_groups:
        if any(keyword in normalized_text for keyword in map(normalize_for_matching, group)):
            section_signals += 1

    date_range_signal = bool(
        re.search(r"\b(19|20)\d{2}\s*[-–—/]\s*((19|20)\d{2}|present|présent|present)\b", normalized_text)
    )

    return (
        keyword_support.get("CV", 0) >= 3
        and section_signals >= 2
        and (contact_signal or date_range_signal or keyword_support.get("CV", 0) >= 5)
    )


def looks_like_diploma_document(text: str, keyword_support: Dict[str, int]) -> bool:
    normalized_text = normalize_for_matching(text)

    diploma_phrases = [
        "attestation de reussite",
        "certifie que",
        "certifions que",
        "a obtenu",
        "diplome de",
        "delivre",
        "decerne",
        "annee universitaire",
        "mention",
    ]

    return keyword_support.get("Diplôme", 0) >= 2 and any(
        phrase in normalized_text for phrase in diploma_phrases
    )


def sorted_scores(scores: Dict[str, float]) -> List[Tuple[str, float]]:
    return sorted(scores.items(), key=lambda item: item[1], reverse=True)


def keyword_fast_classification(text: str, keyword_support: Dict[str, int]) -> Optional[Dict[str, object]]:
    if looks_like_cv(text, keyword_support):
        return {
            "category": "CV",
            "confidence": 0.94,
            "model": f"cv-structure-rules + {MODEL_NAME}",
        }

    ranked_support = sorted(
        ((category, count) for category, count in keyword_support.items() if category != "Autre"),
        key=lambda item: item[1],
        reverse=True,
    )

    if not ranked_support:
        return None

    top_category, top_count = ranked_support[0]
    second_count = ranked_support[1][1] if len(ranked_support) > 1 else 0

    if top_count <= 0:
        return None

    strong = has_strong_keyword(text, top_category)
    clearly_ahead = top_count >= second_count + 2

    if top_category == "Diplôme" and not looks_like_diploma_document(text, keyword_support):
        if keyword_support.get("CV", 0) >= 2:
            return {
                "category": "CV",
                "confidence": 0.86,
                "model": f"cv-education-section-rules + {MODEL_NAME}",
            }

        return None

    if top_count >= 2 and (strong or clearly_ahead):
        confidence = min(0.96, 0.74 + (top_count * 0.05) + (0.08 if strong else 0.0))
        return {
            "category": top_category,
            "confidence": confidence,
            "model": f"keyword-rules + {MODEL_NAME}",
        }

    if top_count == 1 and strong and second_count == 0:
        return {
            "category": top_category,
            "confidence": 0.72,
            "model": f"keyword-rules + {MODEL_NAME}",
        }

    return None


def apply_keyword_boosts(scores: Dict[str, float], keyword_support: Dict[str, int]) -> Dict[str, float]:
    boosted_scores = dict(scores)

    for category, support_count in keyword_support.items():
        if support_count <= 0 or category == "Autre":
            continue

        boost = min(KEYWORD_BOOST * support_count, KEYWORD_BOOST * 4)
        boosted_scores[category] = min(1.0, boosted_scores.get(category, 0.0) + boost)

    return boosted_scores


def choose_keyword_supported_category(keyword_support: Dict[str, int]) -> Optional[Tuple[str, float]]:
    ranked_support = sorted(
        ((category, count) for category, count in keyword_support.items() if category != "Autre"),
        key=lambda item: item[1],
        reverse=True,
    )

    if not ranked_support:
        return None

    top_category, top_count = ranked_support[0]
    second_count = ranked_support[1][1] if len(ranked_support) > 1 else 0

    if top_count >= 2 and top_count >= second_count + 1:
        return top_category, min(0.88, 0.58 + top_count * 0.06)

    return None


def choose_final_category(scores: Dict[str, float], keyword_support: Dict[str, int]) -> Tuple[str, float, List[Tuple[str, float]]]:
    ranked_scores = sorted_scores(scores)
    top_category, top_score = ranked_scores[0]
    second_score = ranked_scores[1][1] if len(ranked_scores) > 1 else 0.0
    clearly_supported = keyword_support.get(top_category, 0) >= 2

    if top_category == "Diplôme" and keyword_support.get("CV", 0) >= 2:
        return "CV", max(0.78, min(0.9, top_score)), ranked_scores

    if top_score < CONFIDENCE_THRESHOLD:
        keyword_choice = choose_keyword_supported_category(keyword_support)
        if keyword_choice:
            return keyword_choice[0], keyword_choice[1], ranked_scores
        return "Autre", 0.0, ranked_scores

    if top_score - second_score < AMBIGUITY_MARGIN and not clearly_supported:
        keyword_choice = choose_keyword_supported_category(keyword_support)
        if keyword_choice:
            return keyword_choice[0], keyword_choice[1], ranked_scores
        return "Autre", 0.0, ranked_scores

    return top_category, top_score, ranked_scores


def classify_text(text: str) -> Dict[str, object]:
    cleaned_text = clean_text(text)

    if not cleaned_text:
        raise ValueError("No text was provided for classification.")

    print(f"[AI Classifier] Cleaned text length: {len(cleaned_text)}")
    keyword_support = count_keyword_support(cleaned_text)
    print(f"[AI Classifier] Keyword support: {keyword_support}")

    if KEYWORD_FAST_PATH:
        keyword_result = keyword_fast_classification(cleaned_text, keyword_support)

        if keyword_result:
            print(f"[AI Classifier] Fast keyword category: {keyword_result['category']}")
            return keyword_result

    chunks = split_into_chunks(cleaned_text)
    print(f"[AI Classifier] Classifying {len(chunks)} chunk(s) with {len(active_templates())} template(s)")

    classifier, model_name = get_classifier_pipeline()
    base_scores = average_zero_shot_scores(classifier, chunks)
    boosted_scores = apply_keyword_boosts(base_scores, keyword_support)
    category, confidence, ranked_scores = choose_final_category(boosted_scores, keyword_support)

    top_three = [
        {"category": category_name, "score": round(score, 4)}
        for category_name, score in ranked_scores[:3]
    ]

    print(f"[AI Classifier] Top 3 categories with scores: {top_three}")
    print(f"[AI Classifier] Final category after boosting: {category}")

    return {
        "category": category,
        "confidence": max(0.0, min(1.0, float(confidence))),
        "model": model_name,
    }
