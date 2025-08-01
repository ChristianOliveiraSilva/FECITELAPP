interface StatusAvaliacoes {
  faltam_1_avaliacao: number;
  faltam_2_avaliacoes: number;
  faltam_3_avaliacoes: number;
}

interface CardsData {
  total_projetos: number;
  trabalhos_para_avaliar: number;
  trabalhos_avaliados: number;
  avaliadores_ativos: number;
  progresso_geral: number;
  status_avaliacoes: StatusAvaliacoes;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class CardsService {
  async getCardsData(): Promise<CardsData> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v3/cards`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar dados dos cards');
      }

      const data: CardsData = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar dados dos cards:', error);
      throw new Error('Erro ao buscar dados dos cards');
    }
  }
}

export const cardsService = new CardsService();
export type { CardsData, StatusAvaliacoes }; 