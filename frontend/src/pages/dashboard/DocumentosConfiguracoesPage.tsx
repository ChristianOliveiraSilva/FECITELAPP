import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  Save,
  FileText,
  Users,
  Building,
  Mail,
  Phone,
  Globe,
  Image
} from "lucide-react";

interface ConfiguracoesDocumentos {
  cabecalho: {
    titulo: string;
    subtitulo: string;
    logo: string;
    instituicao: string;
  };
  apoiadores: {
    nome: string;
    tipo: string;
    logo: string;
  }[];
  footer: {
    texto: string;
    contato: string;
    email: string;
    telefone: string;
    website: string;
  };
  configuracoes: {
    corPrimaria: string;
    corSecundaria: string;
    fonte: string;
    tamanhoFonte: string;
    margem: string;
  };
}

const configuracoesIniciais: ConfiguracoesDocumentos = {
  cabecalho: {
    titulo: "FECITEL",
    subtitulo: "Feira de Ciência e Tecnologia",
    logo: "",
    instituicao: "Instituto Federal de Mato Grosso do Sul"
  },
  apoiadores: [
    {
      nome: "IFMS",
      tipo: "Instituição",
      logo: ""
    },
    {
      nome: "Secretaria de Educação",
      tipo: "Órgão Público",
      logo: ""
    }
  ],
  footer: {
    texto: "© 2024 FECITEL - Todos os direitos reservados",
    contato: "Coordenação Geral",
    email: "fecitel@ifms.edu.br",
    telefone: "(67) 3357-8500",
    website: "www.ifms.edu.br"
  },
  configuracoes: {
    corPrimaria: "#1f5f5f",
    corSecundaria: "#2d7d7d",
    fonte: "Arial",
    tamanhoFonte: "12pt",
    margem: "2.5cm"
  }
};

export const DocumentosConfiguracoesPage = () => {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesDocumentos>(configuracoesIniciais);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleVoltar = () => {
    navigate("/dashboard/documentos");
  };

  const handleSalvar = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações dos documentos foram salvas com sucesso!",
    });
  };

  const handleAdicionarApoiador = () => {
    setConfiguracoes(prev => ({
      ...prev,
      apoiadores: [
        ...prev.apoiadores,
        {
          nome: "",
          tipo: "",
          logo: ""
        }
      ]
    }));
  };

  const handleRemoverApoiador = (index: number) => {
    setConfiguracoes(prev => ({
      ...prev,
      apoiadores: prev.apoiadores.filter((_, i) => i !== index)
    }));
  };

  const handleApoiadorChange = (index: number, field: string, value: string) => {
    setConfiguracoes(prev => ({
      ...prev,
      apoiadores: prev.apoiadores.map((apoiador, i) => 
        i === index ? { ...apoiador, [field]: value } : apoiador
      )
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleVoltar}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-ifms-green-dark">Configurações de Documentos</h1>
            <p className="text-muted-foreground">
              Configure cabeçalhos, apoiadores, footer e outras configurações dos documentos
            </p>
          </div>
        </div>
        <Button
          onClick={handleSalvar}
          className="bg-ifms-green hover:bg-ifms-green-dark"
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Cabeçalho */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Cabeçalho dos Documentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título Principal</Label>
                <Input
                  id="titulo"
                  value={configuracoes.cabecalho.titulo}
                  onChange={(e) => setConfiguracoes(prev => ({
                    ...prev,
                    cabecalho: { ...prev.cabecalho, titulo: e.target.value }
                  }))}
                  placeholder="Ex: FECITEL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitulo">Subtítulo</Label>
                <Input
                  id="subtitulo"
                  value={configuracoes.cabecalho.subtitulo}
                  onChange={(e) => setConfiguracoes(prev => ({
                    ...prev,
                    cabecalho: { ...prev.cabecalho, subtitulo: e.target.value }
                  }))}
                  placeholder="Ex: Feira de Ciência e Tecnologia"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instituicao">Instituição</Label>
                <Input
                  id="instituicao"
                  value={configuracoes.cabecalho.instituicao}
                  onChange={(e) => setConfiguracoes(prev => ({
                    ...prev,
                    cabecalho: { ...prev.cabecalho, instituicao: e.target.value }
                  }))}
                  placeholder="Ex: Instituto Federal de Mato Grosso do Sul"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">URL do Logo</Label>
                <Input
                  id="logo"
                  value={configuracoes.cabecalho.logo}
                  onChange={(e) => setConfiguracoes(prev => ({
                    ...prev,
                    cabecalho: { ...prev.cabecalho, logo: e.target.value }
                  }))}
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Apoiadores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Apoiadores e Parceiros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {configuracoes.apoiadores.map((apoiador, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Apoiador {index + 1}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoverApoiador(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remover
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input
                      value={apoiador.nome}
                      onChange={(e) => handleApoiadorChange(index, "nome", e.target.value)}
                      placeholder="Nome do apoiador"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Input
                      value={apoiador.tipo}
                      onChange={(e) => handleApoiadorChange(index, "tipo", e.target.value)}
                      placeholder="Ex: Instituição, Empresa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL do Logo</Label>
                    <Input
                      value={apoiador.logo}
                      onChange={(e) => handleApoiadorChange(index, "logo", e.target.value)}
                      placeholder="https://exemplo.com/logo.png"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={handleAdicionarApoiador}
              className="w-full"
            >
              + Adicionar Apoiador
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Rodapé dos Documentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="footer-texto">Texto do Rodapé</Label>
              <Textarea
                id="footer-texto"
                value={configuracoes.footer.texto}
                onChange={(e) => setConfiguracoes(prev => ({
                  ...prev,
                  footer: { ...prev.footer, texto: e.target.value }
                }))}
                placeholder="Texto que aparecerá no rodapé dos documentos"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contato">Contato</Label>
                <Input
                  id="contato"
                  value={configuracoes.footer.contato}
                  onChange={(e) => setConfiguracoes(prev => ({
                    ...prev,
                    footer: { ...prev.footer, contato: e.target.value }
                  }))}
                  placeholder="Ex: Coordenação Geral"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={configuracoes.footer.email}
                  onChange={(e) => setConfiguracoes(prev => ({
                    ...prev,
                    footer: { ...prev.footer, email: e.target.value }
                  }))}
                  placeholder="contato@fecitel.edu.br"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={configuracoes.footer.telefone}
                  onChange={(e) => setConfiguracoes(prev => ({
                    ...prev,
                    footer: { ...prev.footer, telefone: e.target.value }
                  }))}
                  placeholder="(67) 3357-8500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={configuracoes.footer.website}
                  onChange={(e) => setConfiguracoes(prev => ({
                    ...prev,
                    footer: { ...prev.footer, website: e.target.value }
                  }))}
                  placeholder="www.fecitel.edu.br"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Configurações de Formatação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cor-primaria">Cor Primária</Label>
                <Input
                  id="cor-primaria"
                  type="color"
                  value={configuracoes.configuracoes.corPrimaria}
                  onChange={(e) => setConfiguracoes(prev => ({
                    ...prev,
                    configuracoes: { ...prev.configuracoes, corPrimaria: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cor-secundaria">Cor Secundária</Label>
                <Input
                  id="cor-secundaria"
                  type="color"
                  value={configuracoes.configuracoes.corSecundaria}
                  onChange={(e) => setConfiguracoes(prev => ({
                    ...prev,
                    configuracoes: { ...prev.configuracoes, corSecundaria: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fonte">Fonte</Label>
                <select
                  id="fonte"
                  value={configuracoes.configuracoes.fonte}
                  onChange={(e) => setConfiguracoes(prev => ({
                    ...prev,
                    configuracoes: { ...prev.configuracoes, fonte: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Calibri">Calibri</option>
                  <option value="Helvetica">Helvetica</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tamanho-fonte">Tamanho da Fonte</Label>
                <select
                  id="tamanho-fonte"
                  value={configuracoes.configuracoes.tamanhoFonte}
                  onChange={(e) => setConfiguracoes(prev => ({
                    ...prev,
                    configuracoes: { ...prev.configuracoes, tamanhoFonte: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="10pt">10pt</option>
                  <option value="11pt">11pt</option>
                  <option value="12pt">12pt</option>
                  <option value="14pt">14pt</option>
                  <option value="16pt">16pt</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="margem">Margem</Label>
                <select
                  id="margem"
                  value={configuracoes.configuracoes.margem}
                  onChange={(e) => setConfiguracoes(prev => ({
                    ...prev,
                    configuracoes: { ...prev.configuracoes, margem: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="1.5cm">1.5cm</option>
                  <option value="2cm">2cm</option>
                  <option value="2.5cm">2.5cm</option>
                  <option value="3cm">3cm</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 