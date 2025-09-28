import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const ImportarDadosGeraisPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      // Verificar se é um arquivo Excel
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'application/vnd.ms-excel.sheet.macroEnabled.12' // .xlsm
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione apenas arquivos Excel (.xlsx, .xls, .xlsm)",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/assets/templates/Trabalhos FECITEL.xlsx';
    link.download = 'Trabalhos FECITEL.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download iniciado",
      description: "Modelo de importação baixado com sucesso",
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo Excel para importar",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/v3/general/import', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Importação realizada com sucesso",
          description: `Arquivo "${selectedFile.name}" foi importado com sucesso`,
        });
        setSelectedFile(null);
        // Resetar o input de arquivo
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        const error = await response.json();
        toast({
          title: "Erro na importação",
          description: error.message || "Erro ao importar o arquivo",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro na importação:', error);
      toast({
        title: "Erro na importação",
        description: "Erro de conexão ao tentar importar o arquivo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Importar Dados Gerais</h1>
        <p className="text-muted-foreground">
          Importe dados gerais do sistema através de arquivos Excel
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Carregar Dados Importados
          </CardTitle>
          <CardDescription>
            Selecione um arquivo Excel (.xlsx, .xls, .xlsm) para importar os dados gerais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file-input">Arquivo Excel</Label>
            <Input
              id="file-input"
              type="file"
              accept=".xlsx,.xls,.xlsm"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                Arquivo selecionado: {selectedFile.name}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleDownloadTemplate}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar Modelo usado em 2025
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex-1"
              size="lg"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Carregar Dados Importados
                </>
              )}
            </Button>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Formato aceito:</strong> Apenas arquivos Excel (.xlsx, .xls, .xlsm)
              <br />
              <strong>Tamanho máximo:</strong> 10MB
              <br />
              <strong>Dica:</strong> Baixe o modelo para ver o formato correto das colunas
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instruções de Importação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">1. Baixar o Modelo</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Clique em "Baixar Modelo" para obter o arquivo de exemplo</li>
                <li>Use o modelo como base para organizar seus dados</li>
                <li>O modelo contém as colunas necessárias já formatadas</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">2. Estrutura Obrigatória das Colunas</h4>
              <div className="bg-muted p-3 rounded-md font-mono text-xs">
                <div className="grid grid-cols-6 gap-2 font-semibold text-foreground mb-2">
                  <div>ID</div>
                  <div>TÍTULO</div>
                  <div>MODALIDADE</div>
                  <div>ÁREA</div>
                  <div>ESCOLA</div>
                  <div>AUTORES</div>
                </div>
                <div className="text-muted-foreground">
                  O arquivo Excel deve conter exatamente estas colunas na primeira linha
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">3. Preparação do Arquivo</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Certifique-se de que o arquivo está no formato Excel (.xlsx, .xls, .xlsm)</li>
                <li>Mantenha os nomes das colunas exatamente como no modelo</li>
                <li>Remova linhas vazias desnecessárias</li>
                <li>Verifique se todos os dados estão preenchidos corretamente</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">4. Processo de Importação</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Selecione o arquivo Excel preparado</li>
                <li>Clique em "Carregar Dados Importados"</li>
                <li>Aguarde o processamento e confirmação da importação</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
