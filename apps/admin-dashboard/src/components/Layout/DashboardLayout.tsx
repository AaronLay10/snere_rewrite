import { Outlet, NavLink } from 'react-router-dom';
import { Eye, Cpu, Boxes, Building2, Users, Layout, Activity, Power } from 'lucide-react';
import { MiniSentientEye } from '../SentientEye/MiniSentientEye';
import './DashboardLayout.css';

export function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <div className="neural-grid" />

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            {/* Sentient Eye Logo - Mini version with animation */}
            <MiniSentientEye size={100} />
          </div>
          <h1 className="logo-text">SENTIENT</h1>
          <p className="logo-subtitle">Neural Engine</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/overview" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Eye size={20} />
            <span>Overview</span>
          </NavLink>

          <NavLink to="/gm-console" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Activity size={20} />
            <span>GM Console</span>
          </NavLink>

          <NavLink to="/power-control" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Power size={20} />
            <span>Power Control</span>
          </NavLink>

          <div className="nav-divider" />

          <NavLink to="/controllers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Cpu size={20} />
            <span>Controllers</span>
          </NavLink>

          <NavLink to="/devices" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Boxes size={20} />
            <span>Devices</span>
          </NavLink>

          <NavLink to="/rooms" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Layout size={20} />
            <span>Rooms</span>
          </NavLink>

          <div className="nav-divider" />

          <NavLink to="/tenants" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Building2 size={20} />
            <span>Tenants</span>
          </NavLink>

          <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Users size={20} />
            <span>Users</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="system-info">
            <div className="info-label">System Version</div>
            <div className="info-value">v1.0.0</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
