import { useCallback, useEffect, useState } from "react";
import {
  createTask,
  getManagerDashboard,
  getMyTeamEmployees,
  getMyTeamProjects,
  getTasks
} from "../services/apiservice";
import "./WorkDashboard.css";

const emptyTask = { title: "", description: "", projectId: "", assignedTo: "", priority: "MEDIUM", dueDate: "" };

function ManagerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyTask);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    setError("");
    try {
      const dashboardResponse = await getManagerDashboard();
      setDashboard(dashboardResponse.data);
      const [employeeResponse, projectResponse, taskResponse] = await Promise.all([
        getMyTeamEmployees(),
        getMyTeamProjects(),
        getTasks()
      ]);
      setEmployees(employeeResponse.data.employees ?? []);
      setProjects(projectResponse.data.projects ?? []);
      setTasks(taskResponse.data.tasks ?? []);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Could not load manager dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const submitTask = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await createTask({
        ...form,
        teamId: dashboard.team.id,
        dueDate: form.dueDate || undefined
      });
      setForm(emptyTask);
      setMessage("Task assigned successfully.");
      await loadDashboard();
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Could not assign the task.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="work-dashboard"><p>Loading manager dashboard…</p></main>;

  return (
    <main className="work-dashboard">
      <header className="work-header">
        <div><p className="work-eyebrow">MANAGER WORKSPACE</p><h1>{dashboard?.team?.name || "Manager dashboard"}</h1><p>Track team progress and assign work to your employees.</p></div>
      </header>

      {error && <div className="work-alert error" role="alert">{error}</div>}
      {message && <div className="work-alert success" role="status">{message}</div>}

      <section className="work-stats" aria-label="Team task summary">
        {[
          ["Employees", dashboard?.totalEmployees],
          ["Tasks", dashboard?.totalTasks],
          ["To do", dashboard?.todoTasks],
          ["In progress", dashboard?.inProgressTasks],
          ["Completed", dashboard?.completedTasks]
        ].map(([label, value]) => <article className="work-stat" key={label}><span>{label}</span><strong>{value ?? 0}</strong></article>)}
      </section>

      <section className="work-columns">
        <form className="work-card work-form" onSubmit={submitTask}>
          <div><p className="work-eyebrow">TEAM WORK</p><h2>Assign a task</h2></div>
          <label>Task title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Prepare weekly report" /></label>
          <label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Add task details" /></label>
          <label>Project<select required value={form.projectId} onChange={(event) => setForm({ ...form, projectId: event.target.value })}><option value="">Choose project</option>{projects.map((project) => <option key={project._id} value={project._id}>{project.name}</option>)}</select></label>
          <label>Assign to<select required value={form.assignedTo} onChange={(event) => setForm({ ...form, assignedTo: event.target.value })}><option value="">Choose employee</option>{employees.map((employee) => <option key={employee._id} value={employee._id}>{employee.name}</option>)}</select></label>
          <div className="work-form-row">
            <label>Priority<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></label>
            <label>Due date<input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></label>
          </div>
          <button className="work-button" disabled={saving || !projects.length || !employees.length}>{saving ? "Assigning…" : "Assign task"}</button>
          {!projects.length && <small>Create a project for this team before assigning tasks.</small>}
          {!employees.length && <small>No employees are assigned to this team yet.</small>}
        </form>

        <section className="work-card">
          <div className="work-section-heading"><div><p className="work-eyebrow">TEAM TASKS</p><h2>Recent tasks</h2></div><span>{tasks.length}</span></div>
          {tasks.length === 0 ? <p className="work-empty">No tasks have been assigned to this team yet.</p> : <div className="work-task-list">
            {tasks.map((task) => <article className="work-task" key={task._id}>
              <div><h3>{task.title}</h3><p>{task.assignedTo?.name || "Employee"} · {task.projectId?.name || "Project"}</p></div>
              <span className={`work-status status-${task.status?.toLowerCase()}`}>{task.status?.replace("_", " ")}</span>
            </article>)}
          </div>}
        </section>
      </section>
    </main>
  );
}

export default ManagerDashboard;
