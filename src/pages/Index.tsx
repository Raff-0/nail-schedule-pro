import { useAuth } from '@/contexts/AuthContext';
import LoginPage from './LoginPage';
import ClientHome from './ClientHome';
import NewBookingPage from './NewBookingPage';
import ManagerDashboard from './ManagerDashboard';

const Index = () => {
  const { isAuthenticated, isLoading, profile } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">💅</p>
          <p className="text-sm text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (profile?.role === 'manager') {
    return <ManagerDashboard />;
  }

  return <ClientHome />;
};

export default Index;
