import { useQuery } from '@tanstack/react-query';
import { SentientEye, type SystemHealth } from '../components/SentientEye/SentientEye';
import { api } from '../lib/api';
import { Activity, Cpu, Zap, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export function SystemOverview() {
  // Fetch system health data
  const { data: health, isLoading } = useQuery<SystemHealth>({
    queryKey: ['system-health'],
    queryFn: async () => {
      // For now, return mock data - we'll implement real API calls next
      const controllers = await api.getControllers();
      const devices = await api.getDevices();

      const onlineControllers = controllers.filter(c => c.status === 'online').length;
      const operationalDevices = devices.filter(d => d.status === 'operational').length;

      const controllerWarnings = controllers.filter(c => c.status === 'warning').length;
      const deviceWarnings = devices.filter(d => d.status === 'warning').length;

      const issues: SystemHealth['issues'] = [];

      // Generate issues from offline/warning controllers
      controllers.forEach(c => {
        if (c.status === 'offline') {
          issues.push({
            id: `controller-${c.id}`,
            severity: 'critical',
            message: `Controller "${c.friendly_name}" is offline`,
            source: c.id,
            timestamp: new Date().toISOString(),
          });
        } else if (c.status === 'warning') {
          issues.push({
            id: `controller-${c.id}`,
            severity: 'warning',
            message: `Controller "${c.friendly_name}" has warnings`,
            source: c.id,
            timestamp: new Date().toISOString(),
          });
        }
      });

      // Determine overall health
      let overall: SystemHealth['overall'] = 'healthy';
      if (issues.some(i => i.severity === 'critical')) {
        overall = 'critical';
      } else if (issues.length > 0) {
        overall = 'warning';
      } else if (onlineControllers === 0) {
        overall = 'offline';
      }

      return {
        overall,
        controllers: {
          total: controllers.length,
          online: onlineControllers,
          offline: controllers.length - onlineControllers,
          warnings: controllerWarnings,
          errors: controllers.filter(c => c.status === 'error').length,
        },
        devices: {
          total: devices.length,
          operational: operationalDevices,
          warnings: deviceWarnings,
          errors: devices.filter(d => d.status === 'error').length,
        },
        issues,
      };
    },
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  const handleIssueClick = (issueId: string) => {
    console.log('Issue clicked:', issueId);
    // TODO: Navigate to specific controller/device or show details modal
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'var(--accent-green)';
      case 'warning': return 'var(--accent-orange)';
      case 'critical': return 'var(--accent-red)';
      default: return 'var(--status-offline)';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle size={24} />;
      case 'warning': return <AlertTriangle size={24} />;
      case 'critical': return <XCircle size={24} />;
      default: return <Activity size={24} />;
    }
  };

  return (
    <div style={{
      padding: '1.5rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      overflow: 'auto',
    }}>
      {/* Header with System Status */}
      <div className="tron-panel" style={{
        padding: '1.5rem',
        position: 'relative',
      }}>
        <div className="panel-scanline" />
        <div className="circuit-lines" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="text-glow" style={{
              margin: 0,
              fontSize: '2rem',
              fontFamily: 'Orbitron, monospace',
              letterSpacing: '0.1em',
            }}>
              SENTIENT ENGINE
            </h1>
            <p style={{
              margin: '0.5rem 0 0 0',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              letterSpacing: '0.05em',
            }}>
              Neural Orchestration System v1.0
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 1.5rem',
            background: `linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(255, 170, 50, 0.1))`,
            borderRadius: '0.5rem',
            border: `2px solid ${getHealthColor(health?.overall || 'offline')}`,
            boxShadow: `0 0 20px ${getHealthColor(health?.overall || 'offline')}40`,
          }}>
            {getHealthIcon(health?.overall || 'offline')}
            <div>
              <div style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                System Status
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: getHealthColor(health?.overall || 'offline'),
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {health?.overall || 'OFFLINE'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
        minHeight: 0,
      }}>
        {/* Left Column - Sentient Eye */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>
          <div className="tron-panel" style={{
            padding: '1.5rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '400px',
          }}>
            <div className="panel-scanline" />
            <div className="circuit-bg" style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.3,
            }} />
            <SentientEye health={health!} onIssueClick={handleIssueClick} />
          </div>

          {/* Issues/Alerts Panel - Moved to left column */}
          {health?.issues && health.issues.length > 0 && (
            <div className="tron-panel" style={{
              padding: '1.5rem',
              border: '2px solid var(--accent-red)',
              boxShadow: 'inset 0 0 30px rgba(255, 51, 85, 0.2), 0 0 40px rgba(255, 51, 85, 0.4)',
              position: 'relative',
            }}>
              <div className="panel-scanline" />
              <h3 style={{
                margin: '0 0 1rem 0',
                fontSize: '1.1rem',
                fontFamily: 'Orbitron, monospace',
                color: 'var(--accent-red)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                ⚠ ACTIVE ALERTS
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                {health.issues.slice(0, 5).map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => handleIssueClick(issue.id)}
                    style={{
                      padding: '0.75rem',
                      background: `rgba(255, 51, 85, 0.1)`,
                      border: `1px solid ${issue.severity === 'critical' ? 'var(--accent-red)' : 'var(--accent-orange)'}`,
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.boxShadow = `0 0 20px ${issue.severity === 'critical' ? 'var(--accent-red)' : 'var(--accent-orange)'}40`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      fontSize: '0.875rem',
                      color: issue.severity === 'critical' ? 'var(--accent-red)' : 'var(--accent-orange)',
                      fontWeight: 600,
                    }}>
                      {issue.message}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {new Date(issue.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Stats Panels */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>
          {/* Controllers Panel */}
          <div className="tron-panel" style={{
            padding: '1.5rem',
            position: 'relative',
          }}>
            <div className="panel-scanline" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Cpu size={24} style={{ color: 'var(--accent-cyan)' }} />
              <h2 className="data-value" style={{
                margin: 0,
                fontSize: '1.3rem',
                fontFamily: 'Orbitron, monospace',
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Controllers
              </h2>
            </div>
            <div className="glow-divider" style={{ marginBottom: '1rem' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 1 }}>
              <div className="hex-panel" style={{ padding: '1rem', position: 'relative' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>TOTAL</div>
                <div className="data-value" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {health?.controllers.total || 0}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(0, 255, 136, 0.1)',
                  border: '2px solid var(--accent-green)',
                  borderRadius: '0.5rem',
                  boxShadow: 'inset 0 0 20px rgba(0, 255, 136, 0.1), 0 0 20px rgba(0, 255, 136, 0.3)',
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>ONLINE</div>
                  <div className="data-value" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-green)' }}>
                    {health?.controllers.online || 0}
                  </div>
                </div>

                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(255, 51, 85, 0.1)',
                  border: '2px solid var(--accent-red)',
                  borderRadius: '0.5rem',
                  boxShadow: 'inset 0 0 20px rgba(255, 51, 85, 0.1), 0 0 20px rgba(255, 51, 85, 0.3)',
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>OFFLINE</div>
                  <div className="data-value" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-red)' }}>
                    {health?.controllers.offline || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Devices Panel */}
          <div className="tron-panel" style={{
            padding: '1.5rem',
            position: 'relative',
          }}>
            <div className="panel-scanline" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Zap size={24} style={{ color: 'var(--accent-orange)' }} />
              <h2 className="data-value" style={{
                margin: 0,
                fontSize: '1.3rem',
                fontFamily: 'Orbitron, monospace',
                color: 'var(--accent-orange)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Devices
              </h2>
            </div>
            <div className="glow-divider" style={{ marginBottom: '1rem' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 1 }}>
              <div className="hex-panel" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>TOTAL</div>
                <div className="data-value" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-orange)' }}>
                  {health?.devices.total || 0}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(0, 255, 136, 0.1)',
                  border: '2px solid var(--accent-green)',
                  borderRadius: '0.5rem',
                  boxShadow: 'inset 0 0 20px rgba(0, 255, 136, 0.1), 0 0 20px rgba(0, 255, 136, 0.3)',
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>OPERATIONAL</div>
                  <div className="data-value" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-green)' }}>
                    {health?.devices.operational || 0}
                  </div>
                </div>

                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(255, 170, 50, 0.1)',
                  border: '2px solid var(--accent-orange)',
                  borderRadius: '0.5rem',
                  boxShadow: 'inset 0 0 20px rgba(255, 170, 50, 0.1), 0 0 20px rgba(255, 170, 50, 0.3)',
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>WARNINGS</div>
                  <div className="data-value" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-orange)' }}>
                    {health?.devices.warnings || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
