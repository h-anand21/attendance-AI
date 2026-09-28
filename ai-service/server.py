import base64
import io
import re
from typing import List, Optional
import numpy as np
from PIL import Image
import cv2
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from uniface import FaceAnalyzer

app = FastAPI(title="AttendEase UniFace Biometric Engine", version="1.0.0")

# Enable CORS for Web (Next.js localhost/Netlify) and Mobile (Expo/Android)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize UniFace Analyzer (RetinaFace + ArcFace)
print("Loading UniFace FaceAnalyzer models...")
analyzer = FaceAnalyzer()
print("UniFace FaceAnalyzer models loaded successfully!")


def decode_base64_to_bgr(b64_string: str) -> np.ndarray:
    """Decodes a base64 data URI or raw base64 string to an OpenCV BGR image."""
    try:
        if "," in b64_string:
            b64_string = b64_string.split(",", 1)[1]
        img_bytes = base64.b64decode(b64_string)
        pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        # Convert RGB to BGR for OpenCV
        rgb_arr = np.array(pil_img)
        bgr_arr = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2BGR)
        return bgr_arr
    except Exception as e:
        raise ValueError(f"Failed to decode image: {str(e)}")


def cosine_similarity(v1: np.ndarray, v2: np.ndarray) -> float:
    """Calculates cosine similarity between two 1D face embeddings."""
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(np.dot(v1, v2) / (norm1 * norm2))


# --- Data Models ---
class StudentCandidate(BaseModel):
    id: str
    name: str
    avatar: Optional[str] = None
    embedding: Optional[List[float]] = None


class RecognizeRequest(BaseModel):
    scenePhoto: str  # Base64 string of camera snapshot
    students: List[StudentCandidate]
    threshold: Optional[float] = 0.52  # Cosine similarity threshold


class RecognizeResponse(BaseModel):
    recognizedStudentIds: List[str]
    recognizedStudentNames: List[str]
    totalFacesDetected: int
    matches: List[dict]


class VerifyPhotoRequest(BaseModel):
    photo: str  # Base64 string of student profile photo


class VerifyPhotoResponse(BaseModel):
    valid: bool
    faceCount: int
    message: str
    embedding: Optional[List[float]] = None
    bbox: Optional[List[float]] = None


# --- Endpoints ---

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "engine": "UniFace ArcFace / RetinaFace",
        "device": "CPU",
        "message": "UniFace biometric face engine is running!"
    }


@app.post("/api/verify-registration-photo", response_model=VerifyPhotoResponse)
def verify_registration_photo(req: VerifyPhotoRequest):
    """
    Validates a student photo during registration:
    1. Ensures exactly ONE face is detected.
    2. Extracts 512-dim ArcFace embedding.
    3. Returns embedding to be saved in Firebase.
    """
    try:
        img_bgr = decode_base64_to_bgr(req.photo)
    except Exception as e:
        return VerifyPhotoResponse(
            valid=False,
            faceCount=0,
            message=f"Invalid image format: {str(e)}"
        )

    faces = analyzer.analyze(img_bgr)
    face_count = len(faces)

    if face_count == 0:
        return VerifyPhotoResponse(
            valid=False,
            faceCount=0,
            message="No face detected. Please upload a clear photo of the student's face."
        )

    if face_count > 1:
        return VerifyPhotoResponse(
            valid=False,
            faceCount=face_count,
            message=f"{face_count} faces detected. Please upload a photo with only ONE student."
        )

    primary_face = faces[0]
    if primary_face.embedding is None:
        return VerifyPhotoResponse(
            valid=False,
            faceCount=1,
            message="Could not extract biometric face embedding. Please try a clearer photo."
        )

    embedding_list = primary_face.embedding.flatten().tolist()
    bbox_list = [float(x) for x in primary_face.bbox] if primary_face.bbox is not None else None

    return VerifyPhotoResponse(
        valid=True,
        faceCount=1,
        message="Face verified successfully!",
        embedding=embedding_list,
        bbox=bbox_list
    )


@app.post("/api/recognize-faces", response_model=RecognizeResponse)
def recognize_faces(req: RecognizeRequest):
    """
    Main Attendance Face Recognition Endpoint:
    1. Detects all faces in the classroom scene photo.
    2. Extracts ArcFace embeddings for each face.
    3. Matches against candidate students using Cosine Similarity.
    4. Returns recognized student IDs.
    """
    try:
        scene_bgr = decode_base64_to_bgr(req.scenePhoto)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid scene photo: {str(e)}")

    # Detect and embed all faces in the scene
    scene_faces = analyzer.analyze(scene_bgr)
    if not scene_faces:
        return RecognizeResponse(
            recognizedStudentIds=[],
            recognizedStudentNames=[],
            totalFacesDetected=0,
            matches=[]
        )

    # Prepare student candidate embeddings (either precomputed or extract from avatar)
    student_embeddings = []
    for s in req.students:
        emb = None
        if s.embedding and len(s.embedding) > 0:
            emb = np.array(s.embedding, dtype=np.float32)
        elif s.avatar and len(s.avatar) > 50:
            try:
                stu_bgr = decode_base64_to_bgr(s.avatar)
                stu_faces = analyzer.analyze(stu_bgr)
                if stu_faces and stu_faces[0].embedding is not None:
                    emb = stu_faces[0].embedding.flatten()
            except Exception as e:
                print(f"Warning: could not process avatar for student {s.id}: {e}")

        if emb is not None:
            student_embeddings.append({
                "id": s.id,
                "name": s.name,
                "embedding": emb
            })

    if not student_embeddings:
        return RecognizeResponse(
            recognizedStudentIds=[],
            recognizedStudentNames=[],
            totalFacesDetected=len(scene_faces),
            matches=[]
        )

    # Match each scene face against student embeddings
    threshold = req.threshold or 0.52
    recognized_ids = set()
    matches = []

    for scene_idx, s_face in enumerate(scene_faces):
        if s_face.embedding is None:
            continue
        scene_emb = s_face.embedding.flatten()

        best_score = -1.0
        best_student = None

        for student in student_embeddings:
            score = cosine_similarity(scene_emb, student["embedding"])
            if score > best_score:
                best_score = score
                best_student = student

        if best_student and best_score >= threshold:
            recognized_ids.add(best_student["id"])
            matches.append({
                "studentId": best_student["id"],
                "studentName": best_student["name"],
                "similarity": round(best_score, 3),
                "bbox": [float(x) for x in s_face.bbox] if s_face.bbox is not None else []
            })

    # Preserve mapping of recognized student names
    id_to_name = {s.id: s.name for s in req.students}
    recognized_names = [id_to_name.get(s_id, s_id) for s_id in recognized_ids]

    return RecognizeResponse(
        recognizedStudentIds=list(recognized_ids),
        recognizedStudentNames=recognized_names,
        totalFacesDetected=len(scene_faces),
        matches=matches
    )
