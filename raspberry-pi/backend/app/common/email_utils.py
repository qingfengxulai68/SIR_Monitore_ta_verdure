import smtplib
import ssl
from email.message import EmailMessage
from dotenv import load_dotenv
import os

load_dotenv()

def send_email(sender_email, sender_password, receiver_email, subject, body):
    """
    Sends a simple text email using Python.
    
    Args:
        sender_email (str): Your email address.
        sender_password (str): Your app password (not your login password).
        receiver_email (str): The recipient's email address.
        subject (str): The subject line of the email.
        body (str): The content of the email.
    """
    # 1. Create the email object
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg.set_content(body)

    # 2. SSL context for security
    context = ssl.create_default_context()

    # 3. Connect to the server and send
    # Note: Using Gmail's server settings by default
    try:
        with smtplib.SMTP_SSL(os.getenv("SMTP_SERVER") or "smtp.gmail.com", 465, context=context) as server:
            server.login(sender_email, sender_password)
            server.send_message(msg)
            print("✅ Email sent successfully!")
    except Exception as e:
        print(f"❌ Error sending email: {e}")

# --- Usage Example ---
if __name__ == "__main__":
    SENDER = os.getenv("EMAIL") or "sender@example.com"
    # IMPORTANT: Use an App Password, not your normal login password
    PASSWORD = os.getenv("EMAIL_PASSWORD") or "your_app_password"
    RECEIVER = "trung-thien.vo@insa-lyon.fr"
    print(SENDER, PASSWORD, RECEIVER)
    
    send_email(
        SENDER, 
        PASSWORD, 
        RECEIVER, 
        "Hello from Python!", 
        "This is a test email sent using a Python script."
    )