from enum import Enum

class ProjectType(Enum):
    TECHNICAL = 1
    SCIENTIFIC = 2
    
    def get_label(self) -> str:
        return {
            self.TECHNICAL: "Tecnológico",
            self.SCIENTIFIC: "Científico",
        }[self]
    
    @classmethod
    def get_values(cls) -> dict:
        return {
            cls.TECHNICAL.value: "Tecnológico",
            cls.SCIENTIFIC.value: "Científico",
        } 