from enum import Enum

class SchoolType(Enum):
    ESTADUAL = "estadual"
    MUNICIPAL = "municipal"
    FEDERAL = "federal"
    PARTICULAR = "particular"
    
    def get_label(self) -> str:
        return {
            self.ESTADUAL: "Estadual",
            self.MUNICIPAL: "Municipal",
            self.FEDERAL: "Federal",
            self.PARTICULAR: "Particular",
        }[self]
    
    @classmethod
    def get_values(cls) -> dict:
        return {
            cls.ESTADUAL.value: "Estadual",
            cls.MUNICIPAL.value: "Municipal",
            cls.FEDERAL.value: "Federal",
            cls.PARTICULAR.value: "Particular",
        }
