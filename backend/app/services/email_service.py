import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.database import settings
import os

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.mailtrap.io")
        self.smtp_port = int(os.getenv("SMTP_PORT", "2525"))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@ifms.edu.br")
    
    def send_password_reset_email(self, to_email: str, reset_token: str, user_name: str):
        """Send password reset email"""
        try:
            # Criar mensagem
            msg = MIMEMultipart()
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = "Recuperação de Senha - IFMS FECITEL"
            
            # URL de reset (ajustar conforme necessário)
            reset_url = f"http://localhost:8080/reset-password?token={reset_token}"
            
            # Corpo do email
            body = f"""
            <html>
            <body>
                <h2>Recuperação de Senha - IFMS FECITEL</h2>
                <p>Olá {user_name},</p>
                <p>Você solicitou a recuperação de senha para sua conta no sistema IFMS FECITEL.</p>
                <p>Clique no link abaixo para redefinir sua senha:</p>
                <p><a href="{reset_url}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">Redefinir Senha</a></p>
                <p>Se você não solicitou esta recuperação, ignore este email.</p>
                <p>Este link expira em 24 horas.</p>
                <br>
                <p>Atenciosamente,<br>Equipe IFMS FECITEL</p>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(body, 'html'))
            
            # Enviar email
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

# Instância global do serviço de email
email_service = EmailService() 