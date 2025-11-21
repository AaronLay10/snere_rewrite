import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { SystemOverview } from './pages/SystemOverview';
import { Controllers } from './pages/Controllers';
import { Devices } from './pages/Devices';
import { Rooms } from './pages/Rooms';
import { Tenants } from './pages/Tenants';
import { Users } from './pages/Users';
import { GMConsole } from './pages/GMConsole';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 5000, // Real-time updates every 5 seconds
      refetchOnWindowFocus: true,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="overview" element={<SystemOverview />} />
            <Route path="gm-console" element={<GMConsole />} />
            <Route path="controllers" element={<Controllers />} />
            <Route path="devices" element={<Devices />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="tenants" element={<Tenants />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
