from enum import Enum

class DocumentType(Enum):
    ANAIS_FECITEL = "Anais FECITEL"
    CERTIFICADO_APRESENTACAO = "Certificado de Apresentação"
    INSTRUCOES_AVALIACAO = "Instruções para Avaliação de Trabalhos na FECITEL"
    MENSAGEM_AVALIADOR = "Mensagem Avaliador"
    CERTIFICADO_PREMIACAO = "Certificado de Premiação"
    RELACAO_TRABALHOS = "Relação de Trabalhos"
    SCRIPT_ENCERRAMENTO = "Script Encerramento SCT e FECITEL"
    SLIDE_FECITEL = "Slide FECITEL"
    
    def get_label(self) -> str:
        return self.value
    
    @classmethod
    def get_values(cls) -> dict:
        return {item.value: item.value for item in cls}
