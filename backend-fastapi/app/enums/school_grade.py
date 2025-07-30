from enum import Enum

class SchoolGrade(Enum):
    FUNDAMENTAL = 1
    MEDIO = 2
    
    def get_label(self) -> str:
        return {
            self.FUNDAMENTAL: "Ensino Fundamental",
            self.MEDIO: "Ensino Médio",
        }[self]
    
    @classmethod
    def get_values(cls) -> dict:
        return {
            cls.FUNDAMENTAL.value: "Ensino Fundamental",
            cls.MEDIO.value: "Ensino Médio",
        } 