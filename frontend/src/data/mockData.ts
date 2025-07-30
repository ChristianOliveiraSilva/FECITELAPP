// Mock data for all tables

export const mockAvaliacoes = [
  {
    avaliador: "Dr. João Silva",
    projeto_id: "PRJ001",
    projeto: "Sistema de Monitoramento Ambiental",
    possui_respostas: "Sim"
  },
  {
    avaliador: "Dra. Maria Santos",
    projeto_id: "PRJ002", 
    projeto: "Aplicativo de Educação Digital",
    possui_respostas: "Não"
  },
  {
    avaliador: "Prof. Carlos Lima",
    projeto_id: "PRJ003",
    projeto: "Robô Assistente para Idosos",
    possui_respostas: "Sim"
  }
];

export const mockAreas = [
  { nome: "Ciências Exatas e da Terra" },
  { nome: "Ciências Biológicas" },
  { nome: "Engenharias" },
  { nome: "Ciências da Saúde" },
  { nome: "Ciências Agrárias" },
  { nome: "Ciências Sociais Aplicadas" },
  { nome: "Ciências Humanas" },
  { nome: "Linguística, Letras e Artes" }
];

export const mockProjetos = [
  {
    id_projeto: "PRJ001",
    titulo: "Sistema de Monitoramento Ambiental",
    ano: "2024",
    estudantes: "Ana Costa, Pedro Oliveira",
    area: "Ciências Exatas e da Terra",
    tipo_projeto: "Científico"
  },
  {
    id_projeto: "PRJ002",
    titulo: "Aplicativo de Educação Digital",
    ano: "2024", 
    estudantes: "Juliana Ferreira",
    area: "Ciências Sociais Aplicadas",
    tipo_projeto: "Tecnológico"
  },
  {
    id_projeto: "PRJ003",
    titulo: "Robô Assistente para Idosos",
    ano: "2024",
    estudantes: "Roberto Santos, Marina Silva",
    area: "Engenharias",
    tipo_projeto: "Científico"
  }
];

export const mockAvaliadores = [
  {
    nome: "Dr. João Silva",
    pin: "1234",
    quantidade_projetos: 5,
    area: "Ciências Exatas e da Terra"
  },
  {
    nome: "Dra. Maria Santos",
    pin: "5678",
    quantidade_projetos: 3,
    area: "Ciências Biológicas"
  },
  {
    nome: "Prof. Carlos Lima",
    pin: "9012",
    quantidade_projetos: 7,
    area: "Engenharias"
  }
];

export const mockEstudantes = [
  {
    nome: "Ana Costa",
    email: "ana.costa@estudante.ifms.edu.br",
    grau_escolaridade: "Ensino Médio",
    escola: "IFMS - Campus Aquidauana"
  },
  {
    nome: "Pedro Oliveira", 
    email: "pedro.oliveira@estudante.ifms.edu.br",
    grau_escolaridade: "Ensino Médio",
    escola: "IFMS - Campus Campo Grande"
  },
  {
    nome: "Juliana Ferreira",
    email: "juliana.ferreira@estudante.ifms.edu.br", 
    grau_escolaridade: "Ensino Superior",
    escola: "IFMS - Campus Dourados"
  }
];

export const mockEscolas = [
  {
    nome: "IFMS - Campus Aquidauana",
    cidade: "Aquidauana",
    estado: "MS"
  },
  {
    nome: "IFMS - Campus Campo Grande",
    cidade: "Campo Grande", 
    estado: "MS"
  },
  {
    nome: "IFMS - Campus Dourados",
    cidade: "Dourados",
    estado: "MS"
  },
  {
    nome: "IFMS - Campus Três Lagoas",
    cidade: "Três Lagoas",
    estado: "MS"
  }
];

export const mockUsuarios = [
  {
    nome: "Admin Sistema",
    email: "admin@ifms.edu.br",
    ativo: "Sim"
  },
  {
    nome: "Coordenador FECITEL",
    email: "coordenador@ifms.edu.br",
    ativo: "Sim"
  },
  {
    nome: "Secretaria",
    email: "secretaria@ifms.edu.br",
    ativo: "Não"
  }
];

export const mockPremiacoes = [
  {
    nome: "Melhor Projeto Científico",
    grau_escolaridade: "Ensino Médio",
    total_colocacoes: 3,
    usar_graus_escolaridade: "Sim",
    usar_areas: "Sim"
  },
  {
    nome: "Destaque em Inovação",
    grau_escolaridade: "Ensino Superior",
    total_colocacoes: 1,
    usar_graus_escolaridade: "Não",
    usar_areas: "Sim"
  },
  {
    nome: "Menção Honrosa",
    grau_escolaridade: "Todos",
    total_colocacoes: 5,
    usar_graus_escolaridade: "Sim",
    usar_areas: "Não"
  }
];

export const mockPerguntas = [
  {
    texto_cientifico: "Qual a relevância científica do projeto?",
    texto_tecnologico: "Qual o potencial de aplicação tecnológica?",
    tipo: "Qualitativa"
  },
  {
    texto_cientifico: "O projeto apresenta metodologia adequada?",
    texto_tecnologico: "A solução é viável tecnicamente?",
    tipo: "Quantitativa"
  },
  {
    texto_cientifico: "Os resultados são consistentes?",
    texto_tecnologico: "O protótipo funciona adequadamente?",
    tipo: "Mista"
  }
];