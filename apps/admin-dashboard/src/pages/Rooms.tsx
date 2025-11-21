import { useState, useEffect } from 'react';
import { Layout, Plus, Pencil, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Tenant {
  id: string;
  name: string;
}

interface Venue {
  id: string;
  name: string;
  tenantId: string;
}

interface Room {
  id: string;
  name: string;
  tenantId: string;
  venueId: string;
  created_at: string;
}

export function Rooms() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    tenantId: '',
    venueId: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch tenants
      const tenantsRes = await fetch(`${API_URL}/tenants`);
      if (tenantsRes.ok) {
        const tenantsData = await tenantsRes.json();
        setTenants(tenantsData);

        // Fetch venues for each tenant
        const allVenues: Venue[] = [];
        for (const tenant of tenantsData) {
          const venuesRes = await fetch(`${API_URL}/tenants/${tenant.id}/venues`);
          if (venuesRes.ok) {
            const venuesData = await venuesRes.json();
            allVenues.push(...venuesData);
          }
        }
        setVenues(allVenues);

        // Fetch rooms for each venue
        const allRooms: Room[] = [];
        for (const venue of allVenues) {
          const roomsRes = await fetch(`${API_URL}/tenants/${venue.tenantId}/venues/${venue.id}/rooms`);
          if (roomsRes.ok) {
            const roomsData = await roomsRes.json();
            allRooms.push(...roomsData);
          }
        }
        setRooms(allRooms);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { tenantId, venueId, ...payload } = formData;

      const url = editingId
        ? `${API_URL}/tenants/${tenantId}/venues/${venueId}/rooms/${editingId}`
        : `${API_URL}/tenants/${tenantId}/venues/${venueId}/rooms`;

      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchData();
        setShowForm(false);
        setFormData({ id: '', name: '', tenantId: '', venueId: '' });
        setEditingId(null);
      }
    } catch (error) {
      console.error('Failed to save room:', error);
    }
  };

  const handleEdit = (room: Room) => {
    setFormData({
      id: room.id,
      name: room.name,
      tenantId: room.tenantId,
      venueId: room.venueId,
    });
    setEditingId(room.id);
    setShowForm(true);
  };

  const handleDelete = async (room: Room) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      const response = await fetch(
        `${API_URL}/tenants/${room.tenantId}/venues/${room.venueId}/rooms/${room.id}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to delete room:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ id: '', name: '', tenantId: '', venueId: '' });
    setEditingId(null);
  };

  const getVenueName = (venueId: string) => {
    return venues.find(v => v.id === venueId)?.name || venueId;
  };

  const getTenantName = (tenantId: string) => {
    return tenants.find(t => t.id === tenantId)?.name || tenantId;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <Layout size={32} className="page-icon" />
          <div>
            <h1 className="page-title">Rooms</h1>
            <p className="page-subtitle">Manage escape rooms and attractions</p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="action-button"
          disabled={venues.length === 0}
          style={{
            backgroundColor: venues.length === 0 ? 'rgba(100, 116, 139, 0.3)' : 'rgba(124, 58, 237, 0.8)',
            color: venues.length === 0 ? '#64748b' : 'white',
            border: `1px solid ${venues.length === 0 ? 'rgba(148, 163, 184, 0.3)' : 'rgba(124, 58, 237, 1)'}`,
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            cursor: venues.length === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          <Plus size={16} />
          Add Room
        </button>
      </div>

      {venues.length === 0 && !loading && (
        <div style={{
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1rem',
          color: '#fbbf24',
          fontSize: '0.875rem',
        }}>
          Please create a tenant and venue first before adding rooms
        </div>
      )}

      {showForm && (
        <div className="glow-border corner-brackets" style={{
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <h3 className="text-glow" style={{ margin: '0 0 1rem 0', color: '#e0e7ff', fontSize: '1.25rem' }}>
            {editingId ? 'Edit Room' : 'New Room'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                Tenant
              </label>
              <select
                value={formData.tenantId}
                onChange={(e) => {
                  setFormData({ ...formData, tenantId: e.target.value, venueId: '' });
                }}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(124, 58, 237, 0.2)',
                  borderRadius: '0.5rem',
                  color: '#e0e7ff',
                  fontSize: '0.875rem',
                }}
              >
                <option value="">Select tenant...</option>
                {tenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                Venue
              </label>
              <select
                value={formData.venueId}
                onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                required
                disabled={!formData.tenantId}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(124, 58, 237, 0.2)',
                  borderRadius: '0.5rem',
                  color: '#e0e7ff',
                  fontSize: '0.875rem',
                }}
              >
                <option value="">Select venue...</option>
                {venues.filter(v => v.tenantId === formData.tenantId).map(venue => (
                  <option key={venue.id} value={venue.id}>{venue.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                Room ID
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                required
                disabled={editingId !== null}
                placeholder="e.g., clockwork"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: editingId ? 'rgba(30, 41, 59, 0.3)' : 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(124, 58, 237, 0.2)',
                  borderRadius: '0.5rem',
                  color: '#e0e7ff',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                Room Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Clockwork"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(124, 58, 237, 0.2)',
                  borderRadius: '0.5rem',
                  color: '#e0e7ff',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'rgba(100, 116, 139, 0.3)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'rgba(124, 58, 237, 0.8)',
                  border: '1px solid rgba(124, 58, 237, 1)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
          <p>Loading rooms...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
          <Layout size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p>No rooms yet</p>
          <small>Create your first room to get started</small>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {rooms.map((room) => (
            <div
              key={room.id}
              className="glow-border"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#e0e7ff', fontSize: '1.125rem' }}>
                  {room.name}
                </h3>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.875rem' }}>
                  ID: {room.id}
                </p>
                <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.75rem' }}>
                  Tenant: {getTenantName(room.tenantId)} / Venue: {getVenueName(room.venueId)}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleEdit(room)}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#60a5fa',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(room)}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#f87171',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
