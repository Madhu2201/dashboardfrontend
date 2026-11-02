import { useEffect, useMemo, useState } from "react";
import {
  createProject,
  createTask,
  getEmployees,
  getProjects,
  getTeams
} from "../services/apiservice";
import { Link } from "react-router-dom";
import "./ProjectsTasks.css";

const initialProject = {
  name: "",
  description: "",
  teamId: "",
  status: "PLANNING",
  startDate: "",
  dueDate: ""
};

function ProjectsTasks() {
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projectForm, setProjectForm] = useState(initialProject);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    teamId: "",
    projectId: "",
    priority: "MEDIUM",
    dueDate: ""
  });
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [savingProject, setSavingProject] = useState(false);
  const [savingTask, setSavingTask] = useState(false);

  const loadData = async () => {
    try {
      const [teamResponse, projectResponse, employeeResponse] = await Promise.all([
        getTeams(),
        getProjects(),
        getEmployees()
      ]);
      setTeams(teamResponse.data.teams ?? []);
      setProjects(projectResponse.data.projects ?? []);
      setEmployees(employeeResponse.data.employees ?? []);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Could not load teams, projects, and employees.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const teamProjects = useMemo(
    () => projects.filter((project) => String(project.teamId?._id ?? project.teamId) === taskForm.teamId),
    [projects, taskForm.teamId]
  );

  const teamEmployees = useMemo(
    () => employees.filter((employee) => String(employee.teamId?._id ?? employee.teamId) === taskForm.teamId),
    [employees, taskForm.teamId]
  );

  const onProjectTeamChange = (teamId) => {
    setProjectForm((form) => ({ ...form, teamId }));
  };

  const onTaskTeamChange = (teamId) => {
    setTaskForm((form) => ({ ...form, teamId, projectId: "" }));
    setSelectedEmployeeIds([]);
  };

  const submitProject = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSavingProject(true);
    try {
      await createProject({
        ...projectForm,
        startDate: projectForm.startDate || undefined,
        dueDate: projectForm.dueDate || undefined
      });
      setProjectForm(initialProject);
      setMessage("Project created successfully.");
      await loadData();
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Could not create project.");
    } finally {
      setSavingProject(false);
    }
  };

  const submitTasks = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (selectedEmployeeIds.length === 0) {
      setError("Select at least one employee for the task.");
      return;
    }
    setSavingTask(true);
    try {
      await Promise.all(selectedEmployeeIds.map((assignedTo) => createTask({
        ...taskForm,
        assignedTo,
        dueDate: taskForm.dueDate || undefined
      })));
      const count = selectedEmployeeIds.length;
      setTaskForm((form) => ({ ...form, title: "", description: "", priority: "MEDIUM", dueDate: "" }));
      setSelectedEmployeeIds([]);
      setMessage(`Task created and assigned to ${count} employee${count === 1 ? "" : "s"}.`);
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Could not create task for all selected employees.");
    } finally {
      setSavingTask(false);
    }
  };

  return (
    <main className="projects-tasks-page">
      <header className="projects-tasks-header">
        <div>
          <p className="eyebrow">WORKSPACE</p>
          <h1>Projects &amp; Tasks</h1>
          <p>Create projects for a team, then assign tasks to one or more employees.</p>
        </div>
        <Link className="back-link" to="/admin-dashboard">Back to admin dashboard</Link>
      </header>

      {message && <div className="form-feedback success" role="status">{message}</div>}
      {error && <div className="form-feedback error" role="alert">{error}</div>}

      <div className="creation-grid">
        <form className="creation-card" onSubmit={submitProject}>
          <div className="card-heading"><span className="step-badge">01</span><div><h2>Create project</h2><p>Set up a project under one of your teams.</p></div></div>
          <label>Project name<input required value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} placeholder="e.g. Website redesign" /></label>
          <label>Description<textarea value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} placeholder="What is this project about?" /></label>
          <label>Team<select required value={projectForm.teamId} onChange={(e) => onProjectTeamChange(e.target.value)}><option value="">Choose a team</option>{teams.map((team) => <option key={team._id} value={team._id}>{team.name}</option>)}</select></label>
          <div className="field-row">
            <label>Status<select value={projectForm.status} onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}><option value="PLANNING">Planning</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option></select></label>
            <label>Start date<input type="date" value={projectForm.startDate} onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })} /></label>
          </div>
          <label>Due date<input type="date" min={projectForm.startDate || undefined} value={projectForm.dueDate} onChange={(e) => setProjectForm({ ...projectForm, dueDate: e.target.value })} /></label>
          <button className="primary-action" disabled={savingProject || teams.length === 0}>{savingProject ? "Creating..." : "Create project"}</button>
          {teams.length === 0 && <small className="field-hint">Create a team before adding a project.</small>}
        </form>

        <form className="creation-card" onSubmit={submitTasks}>
          <div className="card-heading"><span className="step-badge step-purple">02</span><div><h2>Create task</h2><p>Assign the task to one or more team members.</p></div></div>
          <label>Task title<input required value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="e.g. Prepare homepage mockups" /></label>
          <label>Description<textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Add task details" /></label>
          <label>Team<select required value={taskForm.teamId} onChange={(e) => onTaskTeamChange(e.target.value)}><option value="">Choose a team</option>{teams.map((team) => <option key={team._id} value={team._id}>{team.name}</option>)}</select></label>
          <label>Project<select required value={taskForm.projectId} onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value })} disabled={!taskForm.teamId}><option value="">Choose a project</option>{teamProjects.map((project) => <option key={project._id} value={project._id}>{project.name}</option>)}</select></label>
          <label>Employees</label>
          <div className="employee-picker">
            <button className="picker-trigger" type="button" onClick={() => setEmployeeDropdownOpen((open) => !open)} aria-expanded={employeeDropdownOpen} disabled={!taskForm.teamId}>
              <span>{selectedEmployeeIds.length ? `${selectedEmployeeIds.length} employee${selectedEmployeeIds.length === 1 ? "" : "s"} selected` : "Choose employees"}</span><span aria-hidden="true">v</span>
            </button>
            {employeeDropdownOpen && taskForm.teamId && <div className="employee-picker-menu">
              {teamEmployees.map((employee) => <label className="employee-option" key={employee._id}><input type="checkbox" checked={selectedEmployeeIds.includes(employee._id)} onChange={(e) => setSelectedEmployeeIds((selected) => e.target.checked ? [...selected, employee._id] : selected.filter((id) => id !== employee._id))} /><span><strong>{employee.name}</strong><small>{employee.email}</small></span></label>)}
              {teamEmployees.length === 0 && <p className="empty-options">No employees assigned to this team yet.</p>}
            </div>}
          </div>
          <div className="field-row">
            <label>Priority<select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></label>
            <label>Due date<input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} /></label>
          </div>
          <button className="primary-action purple-action" disabled={savingTask || !taskForm.teamId || !taskForm.projectId || selectedEmployeeIds.length === 0}>{savingTask ? "Creating..." : "Create and assign task"}</button>
          {taskForm.teamId && teamProjects.length === 0 && <small className="field-hint">Create a project for this team before adding a task.</small>}
        </form>
      </div>
    </main>
  );
}

export default ProjectsTasks;
