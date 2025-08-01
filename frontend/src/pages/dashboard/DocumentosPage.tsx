import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  Download, 
  File,
  FileSpreadsheet,
  Presentation,
  Settings
} from "lucide-react";

interface Documento {
  id: string;
  nome: string;
  tipo: "doc" | "pdf" | "docx" | "pptx" | "odp" | "xlsx";
  tamanho: string;
  dataUpload: string;
  categoria: "anais" | "apresentacao" | "instrucoes" | "mensagem" | "premiacao" | "relacao" | "script" | "slide" | "certificado" | "ficha";
  descricao: string;
  endpoint: string;
}

const documentos: Documento[] = [
  {
    id: "1",
    nome: "Anais",
    tipo: "doc",
    tamanho: "2.4 MB",
    dataUpload: "15/03/2024",
    categoria: "anais",
    descricao: "Anais da FECITEL com todos os trabalhos apresentados",
    endpoint: "/api/v3/docs/anais"
  },
  {
    id: "2",
    nome: "Apresentação",
    tipo: "pdf",
    tamanho: "1.8 MB",
    dataUpload: "10/03/2024",
    categoria: "apresentacao",
    descricao: "Apresentação geral da FECITEL",
    endpoint: "/api/v3/docs/apresentacao"
  },
  {
    id: "3",
    nome: "Instruções para Avaliação",
    tipo: "docx",
    tamanho: "156 KB",
    dataUpload: "05/03/2024",
    categoria: "instrucoes",
    descricao: "Instruções detalhadas para avaliação de trabalhos",
    endpoint: "/api/v3/docs/instrucoes"
  },
  {
    id: "4",
    nome: "Mensagem Avaliador",
    tipo: "docx",
    tamanho: "89 KB",
    dataUpload: "05/03/2024",
    categoria: "mensagem",
    descricao: "Mensagem especial para os avaliadores",
    endpoint: "/api/v3/docs/mensagem-avaliador"
  },
  {
    id: "5",
    nome: "Premiação",
    tipo: "pdf",
    tamanho: "3.2 MB",
    dataUpload: "12/03/2024",
    categoria: "premiacao",
    descricao: "Documento sobre premiação e critérios",
    endpoint: "/api/v3/docs/premiacao"
  },
  {
    id: "6",
    nome: "Relação de Trabalhos",
    tipo: "pptx",
    tamanho: "4.1 MB",
    dataUpload: "08/03/2024",
    categoria: "relacao",
    descricao: "Apresentação com relação de todos os trabalhos",
    endpoint: "/api/v3/docs/relacao-trabalhos"
  },
  {
    id: "7",
    nome: "Script Encerramento",
    tipo: "docx",
    tamanho: "234 KB",
    dataUpload: "14/03/2024",
    categoria: "script",
    descricao: "Script para cerimônia de encerramento",
    endpoint: "/api/v3/docs/script-encerramento"
  },
  {
    id: "8",
    nome: "Slide FECITEL",
    tipo: "odp",
    tamanho: "5.6 MB",
    dataUpload: "06/03/2024",
    categoria: "slide",
    descricao: "Slides de apresentação da FECITEL",
    endpoint: "/api/v3/docs/slide-fecitel"
  },
  {
    id: "9",
    nome: "Certificado Feiras",
    tipo: "docx",
    tamanho: "1.2 MB",
    dataUpload: "11/03/2024",
    categoria: "certificado",
    descricao: "Modelo de certificado para feiras",
    endpoint: "/api/v3/docs/certificado"
  },

];

const getFileIcon = (tipo: Documento["tipo"]) => {
  switch (tipo) {
    case "pdf":
      return <FileText className="h-5 w-5 text-red-500" />;
    case "doc":
    case "docx":
      return <FileText className="h-5 w-5 text-blue-500" />;
    case "pptx":
    case "odp":
      return <Presentation className="h-5 w-5 text-orange-500" />;
    case "xlsx":
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    default:
      return <File className="h-5 w-5 text-gray-500" />;
  }
};

const getCategoriaBadge = (categoria: Documento["categoria"]) => {
  const variants = {
    anais: "bg-purple-100 text-purple-800",
    apresentacao: "bg-blue-100 text-blue-800",
    instrucoes: "bg-green-100 text-green-800",
    mensagem: "bg-yellow-100 text-yellow-800",
    premiacao: "bg-red-100 text-red-800",
    relacao: "bg-indigo-100 text-indigo-800",
    script: "bg-pink-100 text-pink-800",
    slide: "bg-orange-100 text-orange-800",
    certificado: "bg-teal-100 text-teal-800",
    ficha: "bg-gray-100 text-gray-800"
  };

  const labels = {
    anais: "Anais",
    apresentacao: "Apresentação",
    instrucoes: "Instruções",
    mensagem: "Mensagem",
    premiacao: "Premiação",
    relacao: "Relação",
    script: "Script",
    slide: "Slide",
    certificado: "Certificado",
    ficha: "Ficha"
  };

  return (
    <Badge className={variants[categoria]}>
      {labels[categoria]}
    </Badge>
  );
};

export const DocumentosPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Flag para controlar se os downloads estão habilitados
  const downloadsEnabled = false;

  const handleConfiguracoes = () => {
    navigate("/dashboard/documentos/configuracoes");
  };

  const handleDownload = async (documento: Documento) => {
    try {
      const response = await fetch(`http://localhost:8000${documento.endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      // Criar blob e fazer download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documento.nome}.${documento.tipo}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download realizado",
        description: `${documento.nome} foi baixado com sucesso!`,
      });
    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro no download",
        description: `Falha ao baixar ${documento.nome}. Tente novamente.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ifms-green-dark">Documentos FECITEL</h1>
          <p className="text-muted-foreground">
            Gerencie e acesse todos os documentos da FECITEL
          </p>
        </div>
        <Button
          onClick={handleConfiguracoes}
          className="bg-ifms-green hover:bg-ifms-green-dark"
        >
          <Settings className="h-4 w-4 mr-2" />
          Configurações de Documentos
        </Button>
      </div>

      {/* Lista de Documentos */}
      <div className="grid gap-4">
        {documentos.map((documento) => (
          <Card key={documento.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getFileIcon(documento.tipo)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{documento.nome}</h3>
                      {getCategoriaBadge(documento.categoria)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {documento.descricao}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Tipo: {documento.tipo.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleDownload(documento)}
                    className="bg-ifms-green hover:bg-ifms-green-dark"
                    disabled={!downloadsEnabled}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 