import { ArrowLeft, Shield, Lock, Eye, Database, Users, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const PoliticaPrivacidade = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-ifms-green-light to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-ifms-green mr-3" />
              <h1 className="text-4xl font-bold text-ifms-green-dark">
                Política de Privacidade
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Conheça como o saipru protege e gerencia suas informações pessoais
            </p>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Introdução */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-ifms-green-dark">
                <FileText className="h-5 w-5 mr-2" />
                Sobre o saipru
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                O <strong>saipru</strong> é um aplicativo para avaliação de trabalhos em Feiras de Ciências e Tecnologia. 
                Com ele, os avaliadores podem registrar notas e comentários de forma prática, digital e organizada.
              </p>
              <p className="text-muted-foreground">
                O uso do aplicativo otimiza o tempo de compilação dos resultados da feira, elimina a necessidade de impressão de formulários em papel e, assim, contribui com o meio ambiente. 
                Dessa forma, o processo de avaliação torna-se mais eficiente.
              </p>
            </CardContent>
          </Card>

          {/* Coleta de Dados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-ifms-green-dark">
                <Database className="h-5 w-5 mr-2" />
                Coleta de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Coletamos apenas as informações necessárias para o funcionamento do sistema:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Informações de identificação (nome, email, instituição)</li>
                <li>Credenciais de acesso (senha criptografada)</li>
                <li>Dados de avaliação dos projetos</li>
                <li>Logs de atividade para segurança</li>
              </ul>
            </CardContent>
          </Card>

          {/* Uso dos Dados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-ifms-green-dark">
                <Eye className="h-5 w-5 mr-2" />
                Como Utilizamos Suas Informações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Suas informações são utilizadas exclusivamente para:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Autenticação e controle de acesso ao sistema</li>
                <li>Processamento e armazenamento das avaliações</li>
                <li>Geração de relatórios e estatísticas</li>
                <li>Melhoria da experiência do usuário</li>
                <li>Cumprimento de obrigações legais</li>
              </ul>
            </CardContent>
          </Card>

          {/* Compartilhamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-ifms-green-dark">
                <Users className="h-5 w-5 mr-2" />
                Compartilhamento de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                <strong>Não vendemos, alugamos ou compartilhamos</strong> suas informações pessoais com terceiros, exceto:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Quando exigido por lei ou ordem judicial</li>
                <li>Para proteger nossos direitos e propriedade</li>
                <li>Com prestadores de serviços que nos auxiliam (sempre com contratos de confidencialidade)</li>
                <li>Com sua autorização explícita</li>
              </ul>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-ifms-green-dark">
                <Lock className="h-5 w-5 mr-2" />
                Segurança dos Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Implementamos medidas rigorosas de segurança para proteger suas informações:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Criptografia de dados em trânsito e em repouso</li>
                <li>Controle de acesso baseado em funções</li>
                <li>Monitoramento contínuo de segurança</li>
                <li>Backups regulares e seguros</li>
                <li>Treinamento da equipe em práticas de segurança</li>
              </ul>
            </CardContent>
          </Card>

          {/* Retenção */}
          <Card>
            <CardHeader>
              <CardTitle className="text-ifms-green-dark">
                Retenção de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Mantemos suas informações pelo tempo necessário para:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Fornecer os serviços solicitados</li>
                <li>Cumprir obrigações legais e regulamentares</li>
                <li>Resolver disputas e fazer cumprir nossos acordos</li>
                <li>Melhorar nossos serviços</li>
              </ul>
              <p className="text-muted-foreground">
                Quando não forem mais necessárias, as informações são excluídas de forma segura.
              </p>
            </CardContent>
          </Card>

          {/* Seus Direitos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-ifms-green-dark">
                Seus Direitos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Você tem o direito de:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Acessar suas informações pessoais</li>
                <li>Corrigir dados incorretos ou incompletos</li>
                <li>Solicitar a exclusão de seus dados</li>
                <li>Portabilidade dos seus dados</li>
                <li>Revogar consentimento a qualquer momento</li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-ifms-green-dark">
                Cookies e Tecnologias Similares
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Utilizamos cookies essenciais para:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Manter sua sessão ativa</li>
                <li>Lembrar suas preferências</li>
                <li>Analisar o uso do sistema</li>
                <li>Melhorar a funcionalidade</li>
              </ul>
              <p className="text-muted-foreground">
                Você pode controlar o uso de cookies através das configurações do seu navegador.
              </p>
            </CardContent>
          </Card>

          {/* Alterações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-ifms-green-dark">
                Alterações nesta Política
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas através de:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Notificação no aplicativo</li>
                <li>Email para usuários registrados</li>
                <li>Atualização da data de revisão</li>
              </ul>
              <p className="text-muted-foreground">
                Recomendamos revisar esta política regularmente.
              </p>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="text-ifms-green-dark">
                Entre em Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Se você tiver dúvidas sobre esta política ou sobre como tratamos suas informações, entre em contato:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">Suporte Técnico</p>
                <p className="text-muted-foreground">Para dúvidas sobre privacidade e proteção de dados</p>
                <p className="text-muted-foreground">Email: gt.computacao.tl@gmail.com</p>
              </div>
            </CardContent>
          </Card>

          {/* Data de Revisão */}
          <div className="text-center py-6">
            <Separator className="mb-4" />
            <p className="text-sm text-muted-foreground">
              <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
            </p>
            <p className="text-sm text-muted-foreground">
              Versão 1.0 - Política de Privacidade do saipru
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { PoliticaPrivacidade };
