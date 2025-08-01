# backend/core/notification_service.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

def send_hazard_email(recipient_email: str, hazard_type: str, location: str, severity: str, instructions: str):
    try:
        server = os.getenv("SMTP_SERVER")
        port = int(os.getenv("SMTP_PORT"))
        username = os.getenv("SMTP_USERNAME")
        password = os.getenv("SMTP_PASSWORD")
        from_email = os.getenv("FROM_EMAIL")

        message = MIMEMultipart()
        message["From"] = f"Satraksha Hazard Alert <{from_email}>"
        message["To"] = recipient_email
        message["Subject"] = f"Urgent: {hazard_type} Alert in {location}"
        message["X-Priority"] = "1"

        body = f"""
        ⚠️ URGENT HAZARD ALERT ⚠️
        
        Hazard Type: {hazard_type}
        Location: {location}
        Severity Level: {severity}
        
        Safety Instructions:
        {instructions}
        
        ---
        This is an automated alert from the Satrakhs Hazard Monitoring System.
        """
        message.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(server, port) as smtp:
            smtp.ehlo()
            if smtp.has_extn('STARTTLS'):
                smtp.starttls()
                smtp.ehlo()
            smtp.login(username, password)
            smtp.send_message(message)

        logger.info("Hazard email sent successfully to %s", recipient_email)

    except Exception as e:
        logger.error(f"Failed to send hazard email: {e}")
