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
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardWrapper />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<HomePage />} />
              <Route path="avaliacoes" element={<AvaliacoesPage />} />
              <Route path="areas" element={<AreasPage />} />
              <Route path="projetos" element={<ProjetosPage />} />
              <Route path="avaliadores" element={<AvaliadoresPage />} />
              <Route path="estudantes" element={<EstudantesPage />} />
              <Route path="escolas" element={<EscolasPage />} />
              <Route path="eventos" element={<EventosPage />} />
              <Route path="usuarios" element={<UsuariosPage />} />
              <Route path="premiacoes" element={<PremiacoesPage />} />
              <Route path="perguntas" element={<PerguntasPage />} />
              <Route path="documentos" element={<DocumentosPage />} />
              <Route path="documentos/configuracoes" element={<DocumentosConfiguracoesPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
