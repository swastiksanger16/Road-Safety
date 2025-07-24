import boto3
import os
import uuid
from fastapi import UploadFile

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

def upload_to_s3(file: UploadFile, folder: str = "hazards") -> str:
    """
    Uploads a file to S3 and returns only the S3 key.
    """
    allowed_types = {"image/jpeg", "image/png"}
    if file.content_type not in allowed_types:
        raise ValueError("Unsupported file type. Please upload a JPEG or PNG image.")

    # Generate unique file name
    ext = file.filename.split('.')[-1]
    key = f"{folder}/{uuid.uuid4()}.{ext}"

    try:
        s3.upload_fileobj(
            file.file,
            AWS_BUCKET_NAME,
            key,
            ExtraArgs={"ContentType": file.content_type}
        )
    except Exception as e:
        raise RuntimeError(f"Failed to upload to S3: {str(e)}")

    return key  # Only return S3 key


def get_presigned_url(s3_key: str, expires_in: int = 3600) -> str:
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": AWS_BUCKET_NAME, "Key": s3_key},
        ExpiresIn=expires_in
    )
