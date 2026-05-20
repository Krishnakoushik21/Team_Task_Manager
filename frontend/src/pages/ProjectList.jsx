import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { SkeletonList } from '../components/Skeleton';

function CreateProjectModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/projects', form);
      onCreate(res.data);
      toast.success('Project created');
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create project';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">New Project</h2>
        {error && <div className="error-msg mb-16">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Project Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Q3 Product Launch" />
          </div>
          <div className="form-group">
            <label>Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What's this project about?" />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api.get('/projects')
      .then(res => setProjects(res.data))
      .catch(err => toast.error(err.response?.data?.message || 'Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  const getRoleInProject = (project) => {
    const member = project.members.find(m => m.user._id === user._id);
    return member?.role || 'Member';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-sub">Your team workspaces</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Project</button>
      </div>

      {loading ? (
        <SkeletonList count={4} />
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">+</div>
          <div className="empty-state-text">No projects yet. Create one to get started.</div>
          <button className="btn btn-primary btn-sm mt-16" onClick={() => setShowCreate(true)}>Create Project</button>
        </div>
      ) : (
        <div className="project-list">
          {projects.map(p => (
            <div key={p._id} className="project-item" onClick={() => navigate(`/projects/${p._id}`)}>
              <div>
                <div className="project-item-name">{p.name}</div>
                <div className="project-item-meta">
                  {p.members.length} member{p.members.length !== 1 ? 's' : ''}
                  {p.description && ` - ${p.description.slice(0, 60)}${p.description.length > 60 ? '...' : ''}`}
                </div>
              </div>
              <span className={`badge badge-${getRoleInProject(p).toLowerCase()}`}>{getRoleInProject(p)}</span>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreate={project => setProjects([project, ...projects])}
        />
      )}
    </div>
  );
}
