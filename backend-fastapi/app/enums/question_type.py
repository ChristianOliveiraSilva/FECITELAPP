from enum import Enum

class QuestionType(Enum):
    MULTIPLE_CHOICE = 1
    TEXT = 2
    
    def get_label(self) -> str:
        return {
            self.MULTIPLE_CHOICE: "Questão de Múltipla Escolha",
            self.TEXT: "Questão de Texto",
        }[self]
    
    @classmethod
    def get_values(cls) -> dict:
        return {
            cls.MULTIPLE_CHOICE.value: "Questão de Múltipla Escolha",
            cls.TEXT.value: "Questão de Texto",
        } 