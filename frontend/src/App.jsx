import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthLayout } from './layouts/AuthLayout/AuthLayout';
import { MainLayout } from './layouts/MainLayout/MainLayout';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';
import { ForgotPassword } from './pages/ForgotPassword/ForgotPassword';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { CriarGrupo } from './pages/CriarGrupo/CriarGrupo';
import { Participantes } from './pages/Participantes/Participantes';
import { Sorteio } from './pages/Sorteio/Sorteio';
import { Resultado } from './pages/Resultado/Resultado';
import { Perfil } from './pages/Perfil/Perfil';
import { Administracao } from './pages/Administracao/Administracao';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/grupos/novo" element={<CriarGrupo />} />
              <Route path="/participantes" element={<Participantes />} />
              <Route path="/sorteios" element={<Sorteio />} />
              <Route path="/resultado" element={<Resultado />} />
              <Route path="/configuracoes" element={<Perfil />} />
              <Route path="/admin" element={<Administracao />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
