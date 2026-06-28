import httpx
from app.core.config import settings

RESEND_API_URL = "https://api.resend.com/emails"


async def send_otp_email(email: str, otp: str):
    headers = {
        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "from": "AxorynAI <onboarding@resend.dev>",
        "to": [email],
        "subject": "Your AxorynAI Verification Code",
        "html": f"""
        <h2>Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1 style="color: #2563eb; letter-spacing: 5px;">{otp}</h1>
        <p>This code expires in <b>10 minutes</b>.</p>
        <p>If you didn't register, ignore this email.</p>
        """,
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(RESEND_API_URL, json=payload, headers=headers)
        response.raise_for_status()  # raises an exception if Resend returns an error