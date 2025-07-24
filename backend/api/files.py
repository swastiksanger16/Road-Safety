from fastapi import APIRouter, UploadFile, File, HTTPException
from core.s3_service import upload_to_s3

router = APIRouter()

@router.post("/upload")
def upload_file(file: UploadFile = File(...)):
    try:
        photo_url = upload_to_s3(file)
        return {"photo_url": photo_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
