from sqlalchemy.orm import Session
from app.models.password_reset_config import PasswordResetConfig

class PasswordResetConfigSeeder:
    def __init__(self, db: Session):
        self.db = db
    
    def run(self):
        print("📧 Iniciando seeder de configuração de reset de senha...")
        
        existing_config = self.db.query(PasswordResetConfig).first()
        if existing_config:
            print("ℹ️  Configuração de reset de senha já existe, pulando criação")
            return
        
        template = """
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
        </html>"""
        
        config = PasswordResetConfig(
            mail_template=template
        )
        
        self.db.add(config)
        self.db.commit()
        
        print("✅ Seeder de configuração de reset de senha concluído!")
