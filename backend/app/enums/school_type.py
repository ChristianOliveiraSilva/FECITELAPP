from enum import Enum

class SchoolType(Enum):
    ESTADUAL = "estadual"
    MUNICIPAL = "municipal"
    FEDERAL = "federal"
    
    def get_label(self) -> str:
        return {
            self.ESTADUAL: "Estadual",
            self.MUNICIPAL: "Municipal",
            self.FEDERAL: "Federal",
        }[self]
    
    @classmethod
    def get_values(cls) -> dict:
        return {
            cls.ESTADUAL.value: "Estadual",
            cls.MUNICIPAL.value: "Municipal",
            cls.FEDERAL.value: "Federal",
        }
