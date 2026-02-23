from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from typing import Any
import hashlib
import uuid

app = FastAPI(title="PolicyForge.ai API", version="1.0.0")


class ReviewRequest(BaseModel):
    organization_id: str
    requested_by: str


class ChatRequest(BaseModel):
    organization_id: str
    user_id: str
    question: str


class AcknowledgeRequest(BaseModel):
    organization_id: str
    user_id: str
    document_id: str


def malware_scan(file_bytes: bytes) -> bool:
    # Hook for ClamAV or managed malware scanner.
    return True


def clean_text(raw: str) -> str:
    cleaned_lines = []
    for line in raw.splitlines():
        stripped = line.strip()
        if stripped.lower().startswith("page "):
            continue
        cleaned_lines.append(stripped)
    return "\n".join(line for line in cleaned_lines if line)


def semantic_chunk(text: str, max_chars: int = 1200) -> list[str]:
    paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
    chunks: list[str] = []
    bucket = ""
    for paragraph in paragraphs:
        if len(bucket) + len(paragraph) <= max_chars:
            bucket = f"{bucket}\n{paragraph}".strip()
        else:
            chunks.append(bucket)
            bucket = paragraph
    if bucket:
        chunks.append(bucket)
    return chunks


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/upload")
async def upload_document(
    organization_id: str = Form(...),
    uploaded_by: str = Form(...),
    file: UploadFile = File(...),
) -> dict[str, Any]:
    allowed = {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
    }
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    payload = await file.read()
    if not malware_scan(payload):
        raise HTTPException(status_code=400, detail="Malware detected")

    text = payload.decode("utf-8", errors="ignore")
    normalized = clean_text(text)
    chunks = semantic_chunk(normalized)

    # Placeholder for embedding + pgvector write.
    document_id = str(uuid.uuid4())
    checksum = hashlib.sha256(payload).hexdigest()

    return {
        "organization_id": organization_id,
        "uploaded_by": uploaded_by,
        "document_id": document_id,
        "sha256": checksum,
        "chunk_count": len(chunks),
        "status": "indexed",
        "pipeline": [
            "upload",
            "malware_scan",
            "text_extraction",
            "normalization",
            "semantic_chunking",
            "embedding_generation",
            "pgvector_storage",
            "knowledge_index_build",
        ],
    }


@app.post("/review")
def review_policy(req: ReviewRequest) -> dict[str, Any]:
    return {
        "organization_id": req.organization_id,
        "status": "completed",
        "compliance_score": 81,
        "missing_required_policies": ["AI usage in the workplace", "Pay transparency"],
        "high_risk_legal_exposure": [
            "No retaliation safe harbor language for harassment complaints"
        ],
        "ambiguous_language": ["Manager discretion may be interpreted inconsistently"],
        "suggested_replacement_clauses": [
            "Employees may report concerns without fear of retaliation."
        ],
        "state_specific_warnings": ["CA meal break policy language is incomplete"],
        "audit_readiness_status": "Conditional",
        "report_pdf_path": "reports/latest-compliance-report.pdf",
    }


@app.post("/chat")
def chat(req: ChatRequest) -> dict[str, Any]:
    if "pto" in req.question.lower():
        return {
            "answer": "PTO accrues at 1.54 days per month for full-time employees.",
            "citations": [
                {
                    "document": "EmployeeHandbook2026.pdf",
                    "page": 18,
                }
            ],
            "escalated": False,
        }

    return {
        "answer": "I could not locate that answer in approved company policy documents.",
        "citations": [],
        "escalated": True,
        "escalation_reason": "No authoritative source chunk found.",
    }


@app.get("/audit")
def get_audit_log(organization_id: str) -> dict[str, Any]:
    return {
        "organization_id": organization_id,
        "events": [
            {
                "event_type": "policy_upload",
                "created_at": "2026-02-01T12:04:00Z",
                "actor": "owner@acme.com",
            },
            {
                "event_type": "employee_question",
                "created_at": "2026-02-03T09:11:00Z",
                "actor": "employee@acme.com",
            },
        ],
    }


@app.post("/acknowledge")
def acknowledge(req: AcknowledgeRequest) -> dict[str, Any]:
    return {
        "organization_id": req.organization_id,
        "user_id": req.user_id,
        "document_id": req.document_id,
        "status": "acknowledged",
    }
