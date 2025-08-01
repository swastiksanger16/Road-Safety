import boto3
import os
import uuid
from fastapi import UploadFile
from io import BytesIO

# Load AWS credentials from environment variables
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

# Initialize boto3 S3 client
s3 = boto3.client(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
)

def upload_to_s3(file: UploadFile = None, image_bytes: bytes = None, folder: str = "hazards") -> str:
    """
    Uploads a file or raw image bytes to S3 and returns only the S3 key.
    """
    if not file and not image_bytes:
        raise ValueError("Either file or image_bytes must be provided.")

    if file and file.content_type not in {"image/jpeg", "image/png"}:
        raise ValueError("Unsupported file type. Please upload a JPEG or PNG image.")

    ext = file.filename.split('.')[-1] if file else "jpg"
    key = f"{folder}/{uuid.uuid4()}.{ext}"

    try:
        if file:
            s3.upload_fileobj(
                file.file,
                AWS_BUCKET_NAME,
                key,
                ExtraArgs={"ContentType": file.content_type}
            )
        else:
            s3.upload_fileobj(
                BytesIO(image_bytes),
                AWS_BUCKET_NAME,
                key,
                ExtraArgs={"ContentType": "image/jpeg"}
            )
    except Exception as e:
        raise RuntimeError(f"Failed to upload to S3: {str(e)}")

    return key

def get_presigned_url(s3_key: str, expires_in: int = 3600) -> str:
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": AWS_BUCKET_NAME, "Key": s3_key},
        ExpiresIn=expires_in
    )
