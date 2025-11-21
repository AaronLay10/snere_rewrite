import { useState, useEffect } from 'react';
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Tenant {
  id: string;
  name: string;
  created_at: string;
}

export function Tenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await fetch(`${API_URL}/tenants`);
      if (response.ok) {
        const data = await response.json();
        setTenants(data);
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `${API_URL}/tenants/${editingId}`
        : `${API_URL}/tenants`;

      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchTenants();
        setShowForm(false);
        setFormData({ name: '' });
        setEditingId(null);
      }
    } catch (error) {
      console.error('Failed to save tenant:', error);
    }
  };

  const handleEdit = (tenant: Tenant) => {
    setFormData({ name: tenant.name });
    setEditingId(tenant.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tenant?')) return;

    try {
      const response = await fetch(`${API_URL}/tenants/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTenants();
      }
    } catch (error) {
      console.error('Failed to delete tenant:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ name: '' });
    setEditingId(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <Building2 size={32} className="page-icon" />
          <div>
            <h1 className="page-title">Tenants</h1>
            <p className="page-subtitle">Manage customer organizations</p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="action-button"
          style={{
            backgroundColor: 'rgba(124, 58, 237, 0.8)',
            color: 'white',
            border: '1px solid rgba(124, 58, 237, 1)',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          <Plus size={16} />
          Add Tenant
        </button>
      </div>

      {showForm && (
        <div className="glow-border corner-brackets" style={{
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <h3 className="text-glow" style={{ margin: '0 0 1rem 0', color: '#e0e7ff', fontSize: '1.25rem' }}>
            {editingId ? 'Edit Tenant' : 'New Tenant'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                Tenant Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
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
                placeholder="Enter tenant name"
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
          <p>Loading tenants...</p>
        </div>
      ) : tenants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
          <Building2 size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p>No tenants yet</p>
          <small>Create your first tenant to get started</small>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '1rem',
        }}>
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
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
                  {tenant.name}
                </h3>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.875rem' }}>
                  ID: {tenant.id}
                </p>
                <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.75rem' }}>
                  Created: {new Date(tenant.created_at).toLocaleDateString()}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleEdit(tenant)}
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
                  onClick={() => handleDelete(tenant.id)}
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
