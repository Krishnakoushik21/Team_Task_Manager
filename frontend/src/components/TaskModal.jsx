import { useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function TaskModal({ task, projectId, members, isAdmin, onClose, onSave }) {
  const isNew = !task;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignee: task?.assignee?._id || '',
    priority: task?.priority || 'Medium',
    status: task?.status || 'To Do',
    dueDate: task?.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        project: projectId,
        assignee: form.assignee || undefined,
        dueDate: form.dueDate || undefined,
      };

      const res = isNew
        ? await api.post('/tasks', payload)
        : await api.put(`/tasks/${task._id}`, payload);

      onSave(res.data, isNew);
      toast.success(isNew ? 'Task created' : 'Task updated');
      onClose();
    } catch (err) {
      const message = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Failed to save task';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{isNew ? 'New Task' : (isAdmin ? 'Edit Task' : 'Update Status')}</h2>
        {error && <div className="error-msg mb-16">{error}</div>}
        <form onSubmit={submit}>
          {(isNew || isAdmin) && (
            <>
              <div className="form-group">
                <label>Title</label>
                <input name="title" value={form.title} onChange={handle} required placeholder="Task title" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handle} placeholder="Optional details" />
              </div>
              <div className="grid-2 form-grid">
                <div className="form-group">
                  <label>Priority</label>
                  <select name="priority" value={form.priority} onChange={handle}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={handle}>
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Done</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Assign to</label>
                <select name="assignee" value={form.assignee} onChange={handle}>
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.user._id} value={m.user._id}>{m.user.name} ({m.user.email})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input name="dueDate" type="date" value={form.dueDate} onChange={handle} />
              </div>
            </>
          )}

          {!isNew && !isAdmin && (
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handle}>
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isNew ? 'Create Task' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
