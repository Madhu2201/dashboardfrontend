import api from "./api";
export const createTeam = (name) => {
    return api.post("/teams", { name });
};

export const getTeams = ()=>{
    return api.get("/teams")
}
export const getEmployees = () => api.get("/employees");
export const getManagers = () => api.get("/managers");
export const createEmployee = (employee) => api.post("/employees", employee);
export const createProject = (project) => api.post("/projects", project);
export const getProjects = () => api.get("/projects");
export const getMyTeamProjects = () => api.get("/projects/my-team");
export const createTask = (task) => api.post("/tasks", task);
export const getTasks = () => api.get("/tasks");
export const getMyTasks = () => api.get("/tasks/my-tasks");
export const getManagerDashboard = () => api.get("/dashboard/manager");
export const getEmployeeDashboard = () => api.get("/dashboard/employee");
export const getMyTeamEmployees = () => api.get("/employees/my-team");
export const updateTaskStatus = (taskId, status) => api.patch(`/tasks/${taskId}/status`, { status });
export const assignuser = (teamId, managerId, employeeIds) => {
    return api.patch(`/teams/${teamId}/manager`, { managerId, employeeIds });
}
