import { useCallback, useEffect, useState } from "react";
import { getEmployeeDashboard, getMyTasks, updateTaskStatus } from "../services/apiservice";
import "./WorkDashboard.css";

const taskStatuses = ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"];

function EmployeeDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingTaskId, setUpdatingTaskId] = useState("");

  const loadDashboard = useCallback(async () => {
    setError("");
    try {
      const [dashboardResponse, taskResponse] = await Promise.all([
        getEmployeeDashboard(),
        getMyTasks()
      ]);
      setDashboard(dashboardResponse.data);
      setTasks(taskResponse.data.tasks ?? []);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Could not load your tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    const refreshTimer = window.setInterval(loadDashboard, 15000);
    return () => window.clearInterval(refreshTimer);
  }, [loadDashboard]);

  const changeStatus = async (taskId, status) => {
    setUpdatingTaskId(taskId);
    setError("");
    try {
      await updateTaskStatus(taskId, status);
      await loadDashboard();
    } catch (updateError) {
      setError(updateError.response?.data?.message || "Could not update task status.");
    } finally {
      setUpdatingTaskId("");
    }
  };

  if (loading) return <main className="work-dashboard"><p>Loading your dashboard…</p></main>;

  return (
    <main className="work-dashboard">
      <header className="work-header">
        <div><p className="work-eyebrow">MY WORKSPACE</p><h1>Hello, {dashboard?.employee?.name || "Employee"}</h1><p>{dashboard?.employee?.email} · Your assigned tasks</p></div>
        <button className="work-refresh-button" type="button" onClick={loadDashboard}>Refresh tasks</button>
      </header>

      {error && <div className="work-alert error" role="alert">{error}</div>}

      <section className="work-stats" aria-label="My task summary">
        {[
          ["My tasks", dashboard?.totalTasks],
          ["To do", dashboard?.todoTasks],
          ["In progress", dashboard?.inProgressTasks],
          ["In review", dashboard?.reviewTasks],
          ["Completed", dashboard?.completedTasks]
        ].map(([label, value]) => <article className="work-stat" key={label}><span>{label}</span><strong>{value ?? 0}</strong></article>)}
      </section>

      <section className="work-card employee-tasks-card">
        <div className="work-section-heading"><div><p className="work-eyebrow">YOUR TASK LIST</p><h2>Assigned tasks</h2></div><span>{tasks.length}</span></div>
        {tasks.length === 0 ? <p className="work-empty">No tasks are assigned to you yet.</p> : <div className="work-task-list">
          {tasks.map((task) => <article className="work-task employee-task" key={task._id}>
            <div className="employee-task-copy"><h3>{task.title}</h3><p>{task.teamId?.name || "Team"} · {task.projectId?.name || "Project"}</p>{task.description && <p className="employee-task-description">{task.description}</p>}{task.dueDate && <small>Due {new Date(task.dueDate).toLocaleDateString()}</small>}</div>
            <label className="task-status-control">Status<select value={task.status} disabled={updatingTaskId === task._id} onChange={(event) => changeStatus(task._id, event.target.value)}>{taskStatuses.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}</select></label>
          </article>)}
        </div>}
      </section>
    </main>
  );
}

export default EmployeeDashboard;
