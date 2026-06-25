from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.core.config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)

async def send_otp_email(email: str, otp: str):
    message = MessageSchema(
        subject="Your AxorynAI Verification Code",
        recipients=[email],
        body=f"""
        <h2>Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1 style="color: #2563eb; letter-spacing: 5px;">{otp}</h1>
        <p>This code expires in <b>10 minutes</b>.</p>
        <p>If you didn't register, ignore this email.</p>
        """,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)