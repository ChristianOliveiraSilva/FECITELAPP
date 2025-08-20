import { apiService } from "@/lib/api";

export interface Projeto {
  id: number;
  title: string;
  description?: string;
  year: number;
  category_id: number;
  projectType: number;
  external_id?: string;
  file?: string;
  created_at?: string;
  updated_at?: string;
  category?: {
    id: number;
    name: string;
  };
  students?: Array<{
    id: number;
    name: string;
    school_grade: string;
  }>;
  assessments?: Array<{
    id: number;
    evaluator_id: number;
    created_at: string;
  }>;
}

export interface ProjectsResponse {
  status: boolean;
  message: string;
  data: Projeto[];
}

class ProjectsService {
  async getProjectsByStatus(status: 'pending' | 'evaluated' | 'missing_1' | 'missing_2' | 'missing_3'): Promise<Projeto[]> {
    try {
      // Para simplificar, vamos buscar todos os projetos
      // Em uma implementação real, seria melhor ter endpoints específicos no backend
      const response = await apiService.get<Projeto[]>('/projects', {
        limit: 1000,
        include_relations: true
      });

      if (response.status) {
        // Por enquanto, retornamos todos os projetos
        // TODO: Implementar filtro correto baseado no status
        return response.data[0] || [];
      } else {
        throw new Error(response.message || 'Erro ao buscar projetos');
      }
    } catch (error) {
      console.error('Erro ao buscar projetos por status:', error);
      throw new Error('Erro ao buscar projetos por status');
    }
  }

  async getAllProjects(): Promise<Projeto[]> {
    try {
      const response = await apiService.get<Projeto[]>('/projects', {
        limit: 1000,
        include_relations: true
      });

      if (response.status) {
        return response.data[0] || [];
      } else {
        throw new Error(response.message || 'Erro ao buscar projetos');
      }
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      throw new Error('Erro ao buscar projetos');
    }
  }
}

export const projectsService = new ProjectsService();
