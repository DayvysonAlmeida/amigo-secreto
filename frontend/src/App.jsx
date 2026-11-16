import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthLayout } from './layouts/AuthLayout/AuthLayout';
import { MainLayout } from './layouts/MainLayout/MainLayout';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { CriarGrupo } from './pages/CriarGrupo/CriarGrupo';
import { Grupo } from './pages/Grupo/Grupo';
import { Resultado } from './pages/Resultado/Resultado';
import { Perfil } from './pages/Perfil/Perfil';

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Carregando...</div>;
  }
  
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              <Route path="/revelar/:token" element={<Resultado />} />

              <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/grupos/novo" element={<CriarGrupo />} />
                <Route path="/grupos/:adminToken" element={<Grupo />} />
                <Route path="/configuracoes" element={<Perfil />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
