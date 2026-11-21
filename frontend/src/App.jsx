import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageLoader } from './components/PageLoader/PageLoader';
import { Resultado } from './pages/Resultado/Resultado';

// Quem abre o link de revelação (a maioria, pelo celular) recebe só essa tela, sem esperar
// outros arquivos. Entrar/cadastro e o painel do organizador carregam à parte, cada um de uma vez.
const fromAuth = (name) => lazy(() => import('./routes/auth').then((m) => ({ default: m[name] })));
const fromOrganizer = (name) => lazy(() => import('./routes/organizer').then((m) => ({ default: m[name] })));

const AuthLayout = fromAuth('AuthLayout');
const Login = fromAuth('Login');
const Register = fromAuth('Register');
const MainLayout = fromOrganizer('MainLayout');
const Dashboard = fromOrganizer('Dashboard');
const CriarGrupo = fromOrganizer('CriarGrupo');
const Grupo = fromOrganizer('Grupo');
const Perfil = fromOrganizer('Perfil');

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) return <PageLoader />;

  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
