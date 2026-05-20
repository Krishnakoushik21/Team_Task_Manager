import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { differenceInCalendarDays, format, formatDistanceToNow, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import TaskModal from '../components/TaskModal';
import { SkeletonCard } from '../components/Skeleton';

const STATUSES = ['To Do', 'In Progress', 'Done'];
const STATUS_CLASSES = { 'To Do': 'todo', 'In Progress': 'inprogress', Done: 'done' };
const PRIORITY_CLASSES = { Low: 'low', Medium: 'medium', High: 'high' };

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'NA';

const dueInfo = (task) => {
  if (!task.dueDate) return null;
  const days = differenceInCalendarDays(parseISO(task.dueDate), new Date());
  const isOverdue = days < 0 && task.status !== 'Done';
  let label = 'Due today';

  if (days > 0) label = `Due in ${days}d`;
  if (days < 0) label = `Overdue by ${Math.abs(days)}d`;

  return { isOverdue, label, date: format(parseISO(task.dueDate), 'MMM d') };
};

function AddMemberModal({ onClose, onAdd, projectId }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post(`/projects/${projectId}/members`, { email, role });
      onAdd(res.data);
      toast.success('Member added');
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add member';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Add Member</h2>
        {error && <div className="error-msg mb-16">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="member@example.com" />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option>Member</option>
              <option>Admin</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Member'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskCard({ task, isAdmin, members, projectId, onUpdate, onDelete }) {
  const [showModal, setShowModal] = useState(false);
  const due = dueInfo(task);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      onDelete(task._id);
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  return (
    <>
      <div className={`task-card ${due?.isOverdue ? 'task-card-overdue' : ''}`} onClick={() => setShowModal(true)}>
        <div className="task-card-top">
          <div className="task-card-title">{task.title}</div>
          <span className={`badge badge-${PRIORITY_CLASSES[task.priority]}`}>{task.priority}</span>
        </div>
        {task.description && (
          <div className="task-card-desc">
            {task.description.slice(0, 90)}{task.description.length > 90 ? '...' : ''}
          </div>
        )}
        <div className="task-card-meta">
          {task.assignee ? (
            <span className="assignee-chip">
              <span className="avatar">{initials(task.assignee.name)}</span>
              {task.assignee.name}
            </span>
          ) : (
            <span className="text-muted">Unassigned</span>
          )}
          {due && (
            <span className={due.isOverdue ? 'overdue-chip' : 'due-chip'}>
              {due.label} ({due.date})
            </span>
          )}
          {isAdmin && (
            <button className="btn btn-danger btn-sm task-delete-btn" onClick={handleDelete}>
              Delete
            </button>
          )}
        </div>
      </div>
      {showModal && (
        <TaskModal
          task={task}
          projectId={projectId}
          members={members}
          isAdmin={isAdmin}
          onClose={() => setShowModal(false)}
          onSave={updated => onUpdate(updated)}
        />
      )}
    </>
  );
}

function FilterBar({ filters, setFilters, members }) {
  const clearFilters = () => setFilters({ priority: '', assignee: '', search: '' });

  return (
    <div className="filter-bar">
      <input
        value={filters.search}
        onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
        placeholder="Search tasks"
      />
      <select value={filters.priority} onChange={e => setFilters(prev => ({ ...prev, priority: e.target.value }))}>
        <option value="">All priorities</option>
        <option>High</option>
        <option>Medium</option>
        <option>Low</option>
      </select>
      <select value={filters.assignee} onChange={e => setFilters(prev => ({ ...prev, assignee: e.target.value }))}>
        <option value="">All assignees</option>
        {members.map(m => (
          <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
        ))}
      </select>
      <button className="btn btn-ghost btn-sm" type="button" onClick={clearFilters}>Clear</button>
    </div>
  );
}

function KanbanView({ tasks, isAdmin, members, projectId, onUpdate, onDelete, onCreate }) {
  return (
    <div className="kanban-board">
      {STATUSES.map(status => {
        const columnTasks = tasks.filter(t => t.status === status);
        return (
          <div key={status} className="kanban-col">
            <div className="kanban-col-header">
              <span className={`kanban-col-title badge badge-${STATUS_CLASSES[status]}`}>{status}</span>
              <span className="kanban-col-count">{columnTasks.length}</span>
            </div>
            <div className="kanban-tasks">
              {columnTasks.length === 0 && (
                <div className="empty-column">
                  <p>No tasks yet.</p>
                  {isAdmin && <button className="btn btn-primary btn-sm" onClick={onCreate}>Create Task</button>}
                </div>
              )}
              {columnTasks.map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  isAdmin={isAdmin}
                  members={members}
                  projectId={projectId}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Dashboard({ projectId }) {
  const [data, setData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      api.get(`/dashboard/stats?project=${projectId}`),
      api.get(`/projects/${projectId}/activity`),
    ])
      .then(([statsRes, activityRes]) => {
        if (!active) return;
        setData(statsRes.data);
        setActivities(activityRes.data);
      })
      .catch(err => toast.error(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [projectId]);

  if (loading) {
    return (
      <div className="dashboard-skeleton">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!data) return null;

  const statusData = STATUSES.map(status => ({
    name: status,
    value: data.byStatus?.[status] || 0,
    color: status === 'To Do' ? '#64748b' : status === 'In Progress' ? '#5b9cf6' : '#52d07a',
  }));
  const userData = [...data.tasksPerUser]
    .sort((a, b) => b.count - a.count)
    .map(item => ({ name: item.user.name, tasks: item.count }));

  return (
    <div>
      <div className="stats-grid">
        <div className="card">
          <div className="card-title">Total Tasks</div>
          <div className="card-value">{data.totalTasks}</div>
        </div>
        <div className="card">
          <div className="card-title">In Progress</div>
          <div className="card-value text-blue">{data.byStatus['In Progress']}</div>
        </div>
        <div className="card">
          <div className="card-title">Completed</div>
          <div className="card-value text-green">{data.byStatus.Done}</div>
        </div>
        <div className="card">
          <div className="card-title">Overdue</div>
          <div className={`card-value ${data.overdueTasks > 0 ? 'text-red' : ''}`}>{data.overdueTasks}</div>
        </div>
      </div>

      <div className="grid-2 dashboard-grid">
        <div className="card chart-card">
          <div className="card-title">Tasks by Status</div>
          {data.totalTasks === 0 ? (
            <div className="empty-state compact">No tasks to chart yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} innerRadius={60} outerRadius={82} dataKey="value">
                  {statusData.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card chart-card">
          <div className="card-title">Tasks per Member</div>
          {userData.length === 0 ? (
            <div className="empty-state compact">No assigned tasks yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={userData}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#7c8090' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#7c8090' }} />
                <Tooltip />
                <Bar dataKey="tasks" fill="#e8c547" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card activity-card">
        <div className="card-title">Activity Timeline</div>
        {activities.length === 0 ? (
          <div className="empty-state compact">No recent activity yet.</div>
        ) : (
          <div className="activity-list">
            {activities.map(activity => (
              <div key={activity._id} className="activity-item">
                <span className="avatar">{initials(activity.user?.name)}</span>
                <span>
                  <strong>{activity.user?.name || 'Someone'}</strong> {activity.action}
                  {activity.taskTitle && <em> "{activity.taskTitle}"</em>}
                </span>
                <span className="activity-time">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MembersView({ project, isAdmin, onUpdate }) {
  const { user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);

  const removeMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      const res = await api.delete(`/projects/${project._id}/members/${userId}`);
      onUpdate(res.data);
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  return (
    <div>
      <div className="members-header">
        <span className="text-muted">{project.members.length} member{project.members.length !== 1 ? 's' : ''}</span>
        {isAdmin && <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Member</button>}
      </div>
      <div>
        {project.members.map(member => (
          <div key={member.user._id} className="member-item">
            <div className="member-info-row">
              <span className="avatar">{initials(member.user.name)}</span>
              <div className="member-info">
                <div className="member-name">{member.user.name} {member.user._id === user._id && <span className="text-muted">(you)</span>}</div>
                <div className="member-email">{member.user.email}</div>
              </div>
            </div>
            <div className="member-actions">
              <span className={`badge badge-${member.role.toLowerCase()}`}>{member.role}</span>
              {isAdmin && member.user._id !== user._id && (
                <button className="btn btn-danger btn-sm" onClick={() => removeMember(member.user._id)}>Remove</button>
              )}
            </div>
          </div>
        ))}
      </div>
      {showAdd && <AddMemberModal projectId={project._id} onClose={() => setShowAdd(false)} onAdd={onUpdate} />}
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('board');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [filters, setFilters] = useState({ priority: '', assignee: '', search: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [projectRes, taskRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`),
      ]);
      setProject(projectRes.data);
      setTasks(taskRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const isAdmin = project?.members?.find(member => member.user._id === user._id)?.role === 'Admin';
  const filteredTasks = tasks.filter(task =>
    (!filters.priority || task.priority === filters.priority) &&
    (!filters.assignee || task.assignee?._id === filters.assignee) &&
    (!filters.search || task.title.toLowerCase().includes(filters.search.toLowerCase()))
  );

  const handleTaskUpdate = (updated) => {
    setTasks(prev => prev.map(task => task._id === updated._id ? updated : task));
  };

  const handleTaskCreate = (created) => {
    setTasks(prev => [created, ...prev]);
  };

  const handleTaskDelete = (taskId) => {
    setTasks(prev => prev.filter(task => task._id !== taskId));
  };

  const handleDeleteProject = async () => {
    if (!confirm(`Delete "${project.name}" and all its tasks?`)) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  if (loading) return <div className="loading-page"><SkeletonCard className="loading-card" /></div>;
  if (!project) return <div className="empty-state">Project not found.</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm back-button" onClick={() => navigate('/')}>Back to Projects</button>
          <h1 className="page-title">{project.name}</h1>
          {project.description && <p className="page-sub">{project.description}</p>}
        </div>
        <div className="header-actions">
          {isAdmin && (
            <>
              <button className="btn btn-primary btn-sm" onClick={() => setShowCreateTask(true)}>+ New Task</button>
              <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>Delete Project</button>
            </>
          )}
        </div>
      </div>

      <div className="tabs">
        {['board', 'dashboard', 'members'].map(item => (
          <button key={item} className={`tab ${tab === item ? 'active' : ''}`} onClick={() => setTab(item)}>
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'board' && (
        <>
          <FilterBar filters={filters} setFilters={setFilters} members={project.members} />
          <KanbanView
            tasks={filteredTasks}
            isAdmin={isAdmin}
            members={project.members}
            projectId={id}
            onUpdate={handleTaskUpdate}
            onDelete={handleTaskDelete}
            onCreate={() => setShowCreateTask(true)}
          />
        </>
      )}
      {tab === 'dashboard' && <Dashboard projectId={id} />}
      {tab === 'members' && <MembersView project={project} isAdmin={isAdmin} onUpdate={setProject} />}

      {showCreateTask && (
        <TaskModal
          task={null}
          projectId={id}
          members={project.members}
          isAdmin={true}
          onClose={() => setShowCreateTask(false)}
          onSave={handleTaskCreate}
        />
      )}
    </div>
  );
}
