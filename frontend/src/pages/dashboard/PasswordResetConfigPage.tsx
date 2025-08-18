import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Mail } from 'lucide-react';

interface PasswordResetConfig {
  id: number;
  mail_template: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: PasswordResetConfig | PasswordResetConfig[];
}

const PasswordResetConfigPage: React.FC = () => {
  const [config, setConfig] = useState<PasswordResetConfig | null>(null);
  const [mailTemplate, setMailTemplate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v3/password-reset-configs/`);
      if (response.ok) {
        const result: ApiResponse = await response.json();
        if (Array.isArray(result.data) && result.data.length > 0) {
          const firstConfig = result.data[0];
          setConfig(firstConfig);
          setMailTemplate(firstConfig.mail_template);
        } else if (!Array.isArray(result.data) && result.data) {
          // Caso seja uma resposta única
          setConfig(result.data);
          setMailTemplate(result.data.mail_template);
        } else {
          // Se não existir configuração, criar uma padrão
          setMailTemplate(getDefaultTemplate());
        }
      } else {
        throw new Error('Falha ao carregar configuração');
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a configuração de reset de senha",
        variant: "destructive",
      });
      // Usar template padrão em caso de erro
      setMailTemplate(getDefaultTemplate());
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultTemplate = () => {
    return `Olá {nome},

Você solicitou a redefinição de sua senha.

Para continuar com o processo, clique no link abaixo:

{link_reset}

Este link é válido por 24 horas.

Se você não solicitou esta redefinição, ignore este email.

Atenciosamente,
Equipe Fecitel`;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let response;
      
      if (config) {
        // Atualizar configuração existente
        response = await fetch(`${API_BASE_URL}/api/v3/password-reset-configs/${config.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mail_template: mailTemplate
          }),
        });
      } else {
        // Criar nova configuração
        response = await fetch(`${API_BASE_URL}/api/v3/password-reset-configs/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mail_template: mailTemplate
          }),
        });
      }

      if (response.ok) {
        const result: ApiResponse = await response.json();
        if (!Array.isArray(result.data)) {
          setConfig(result.data);
        }
        toast({
          title: "Sucesso",
          description: "Configuração salva com sucesso!",
        });
      } else {
        throw new Error('Falha ao salvar configuração');
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a configuração",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    setMailTemplate(getDefaultTemplate());
    toast({
      title: "Template restaurado",
      description: "Template padrão foi restaurado",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando configuração...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Configuração de Reset de Senha</h1>
        <p className="text-gray-600 mt-2">
          Configure o template de email que será enviado quando um usuário solicitar reset de senha
        </p>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Template de Email
          </CardTitle>
          <CardDescription>
            Personalize o conteúdo do email de reset de senha. Use as variáveis entre chaves para inserir dados dinâmicos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="mailTemplate">Template do Email</Label>
            <Textarea
              id="mailTemplate"
              value={mailTemplate}
              onChange={(e) => setMailTemplate(e.target.value)}
              placeholder="Digite o template do email..."
              className="min-h-[300px] font-mono text-sm"
            />
            <p className="text-sm text-gray-500">
              Variáveis disponíveis: {'{nome}'}, {'{link_reset}'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? 'Salvando...' : 'Salvar Configuração'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleResetToDefault}
              disabled={isSaving}
            >
              Restaurar Padrão
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Dicas de Uso:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>{'{nome}'}</strong> - Será substituído pelo nome do usuário</li>
              <li>• <strong>{'{link_reset}'}</strong> - Será substituído pelo link de reset</li>
              <li>• Mantenha o texto claro e profissional</li>
              <li>• Inclua informações sobre a validade do link</li>
              <li>• Adicione instruções de segurança quando apropriado</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordResetConfigPage;
