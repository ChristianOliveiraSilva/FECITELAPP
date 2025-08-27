import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import ExclusaoConta from "./pages/ExclusaoConta";
import { DashboardWrapper } from "@/components/layout/DashboardWrapper";
import HomePage from "@/pages/dashboard/HomePage";
import { AvaliacoesPage } from "@/pages/dashboard/AvaliacoesPage";
import { AreasPage } from "@/pages/dashboard/AreasPage";
import { ProjetosPage } from "@/pages/dashboard/ProjetosPage";
import { AvaliadoresPage } from "@/pages/dashboard/AvaliadoresPage";
import { EstudantesPage } from "@/pages/dashboard/EstudantesPage";
import { EscolasPage } from "@/pages/dashboard/EscolasPage";
import { EventosPage } from "@/pages/dashboard/EventosPage";
import { UsuariosPage } from "@/pages/dashboard/UsuariosPage";
import { PremiacoesPage } from "@/pages/dashboard/PremiacoesPage";
import { PerguntasPage } from "@/pages/dashboard/PerguntasPage";
import { DocumentosPage } from "@/pages/dashboard/DocumentosPage";
import { DocumentosConfiguracoesPage } from "@/pages/dashboard/DocumentosConfiguracoesPage";
import PasswordResetConfigPage from "@/pages/dashboard/PasswordResetConfigPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
            <Route path="/exclusao-conta" element={<ExclusaoConta />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardWrapper />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<HomePage />} />
            
              {/* Resources */}
              <Route path="avaliacoes" element={<AvaliacoesPage view="list" />} />
              <Route path="avaliacoes/create" element={<AvaliacoesPage view="create" />} />
              <Route path="avaliacoes/:id" element={<AvaliacoesPage view="detail" />} />
              <Route path="avaliacoes/:id/edit" element={<AvaliacoesPage view="edit" />} />
              
              <Route path="areas" element={<AreasPage view="list" />} />
              <Route path="areas/create" element={<AreasPage view="create" />} />
              <Route path="areas/:id" element={<AreasPage view="detail" />} />
              <Route path="areas/:id/edit" element={<AreasPage view="edit" />} />
              
              <Route path="projetos" element={<ProjetosPage view="list" />} />
              <Route path="projetos/create" element={<ProjetosPage view="create" />} />
              <Route path="projetos/:id" element={<ProjetosPage view="detail" />} />
              <Route path="projetos/:id/edit" element={<ProjetosPage view="edit" />} />
              
              <Route path="avaliadores" element={<AvaliadoresPage view="list" />} />
              <Route path="avaliadores/create" element={<AvaliadoresPage view="create" />} />
              <Route path="avaliadores/:id" element={<AvaliadoresPage view="detail" />} />
              <Route path="avaliadores/:id/edit" element={<AvaliadoresPage view="edit" />} />
              
              <Route path="estudantes" element={<EstudantesPage view="list" />} />
              <Route path="estudantes/create" element={<EstudantesPage view="create" />} />
              <Route path="estudantes/:id" element={<EstudantesPage view="detail" />} />
              <Route path="estudantes/:id/edit" element={<EstudantesPage view="edit" />} />
              
              <Route path="escolas" element={<EscolasPage view="list" />} />
              <Route path="escolas/create" element={<EscolasPage view="create" />} />
              <Route path="escolas/:id" element={<EscolasPage view="detail" />} />
              <Route path="escolas/:id/edit" element={<EscolasPage view="edit" />} />
              
              <Route path="eventos" element={<EventosPage view="list" />} />
              <Route path="eventos/create" element={<EventosPage view="create" />} />
              <Route path="eventos/:id" element={<EventosPage view="detail" />} />
              <Route path="eventos/:id/edit" element={<EventosPage view="edit" />} />
              
              <Route path="usuarios" element={<UsuariosPage view="list" />} />
              <Route path="usuarios/create" element={<UsuariosPage view="create" />} />
              <Route path="usuarios/:id" element={<UsuariosPage view="detail" />} />
              <Route path="usuarios/:id/edit" element={<UsuariosPage view="edit" />} />
              
              <Route path="premiacoes" element={<PremiacoesPage view="list" />} />
              <Route path="premiacoes/create" element={<PremiacoesPage view="create" />} />
              <Route path="premiacoes/:id" element={<PremiacoesPage view="detail" />} />
              <Route path="premiacoes/:id/edit" element={<PremiacoesPage view="edit" />} />
              
              <Route path="perguntas" element={<PerguntasPage view="list" />} />
              <Route path="perguntas/create" element={<PerguntasPage view="create" />} />
              <Route path="perguntas/:id" element={<PerguntasPage view="detail" />} />
              <Route path="perguntas/:id/edit" element={<PerguntasPage view="edit" />} />

              {/* Settings */}
              <Route path="documentos" element={<DocumentosPage />} />
              <Route path="documentos/configuracoes" element={<DocumentosConfiguracoesPage />} />
              <Route path="password-reset-config" element={<PasswordResetConfigPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
