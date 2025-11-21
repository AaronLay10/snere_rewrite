import { useQuery } from '@tanstack/react-query';
import { SentientEye, type SystemHealth } from '../components/SentientEye/SentientEye';
import { api } from '../lib/api';

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

  return (
    <div style={{ padding: '1.5rem', height: '100%' }}>
      <SentientEye health={health!} onIssueClick={handleIssueClick} />
    </div>
  );
}
