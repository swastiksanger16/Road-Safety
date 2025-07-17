import boto3
import os
import uuid
from fastapi import UploadFile

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

s3 = boto3.client(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
)

def upload_to_s3(file: UploadFile, folder: str = "hazards") -> str:
    ext = file.filename.split('.')[-1]
    key = f"{folder}/{uuid.uuid4()}.{ext}"

    s3.upload_fileobj(
        file.file,
        Bucket=AWS_BUCKET_NAME,
        Key=key,
        ExtraArgs={"ACL": "public-read", "ContentType": file.content_type}
    )

    return f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{key}"
