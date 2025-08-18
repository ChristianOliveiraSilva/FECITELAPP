import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.database import settings, SessionLocal
from app.models.password_reset_config import PasswordResetConfig
import os

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.mailtrap.io")
        self.smtp_port = int(os.getenv("SMTP_PORT", "2525"))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@ifms.edu.br")
    
    def get_mail_template(self) -> str:
        db = SessionLocal()
        try:
            config = db.query(PasswordResetConfig).first()
            if config:
                return config.mail_template
            else:
                return """<html><body><h2>Recuperação de Senha</h2><p>Olá {user_name},</p><p>Clique aqui para redefinir sua senha: <a href="{reset_url}">Redefinir Senha</a></p></body></html>"""
        except Exception as e:
            print(f"Error fetching mail template: {e}")
            return """<html><body><h2>Recuperação de Senha</h2><p>Olá {user_name},</p><p>Clique aqui para redefinir sua senha: <a href="{reset_url}">Redefinir Senha</a></p></body></html>"""
        finally:
            db.close()
    
    def send_password_reset_email(self, to_email: str, reset_token: str, user_name: str):
        try:
            msg = MIMEMultipart()
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = "Recuperação de Senha - IFMS FECITEL"
            
            reset_url = f"http://localhost:8080/reset-password?token={reset_token}"
            
            template = self.get_mail_template()
            body = template.format(user_name=user_name, reset_url=reset_url)
            
            msg.attach(MIMEText(body, 'html'))
            
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)
            text = msg.as_string()
            server.sendmail(self.from_email, to_email, text)
            server.quit()
            
            return True
            
        except Exception as e:
            print(f"Erro ao enviar email: {e}")
            return False

email_service = EmailService() 