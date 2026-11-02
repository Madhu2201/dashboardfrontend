import { createTeam , getTeams , assignuser, getManagers ,getEmployees } from "../services/apiservice";
import { useState, useEffect  } from "react";
import { Link } from "react-router-dom";
import "./ProjectsTasks.css";

function AdminDashboard() {
    const [teamName, setTeamName] = useState("");
    const [getAllTeams, setGetTeams] = useState([]);
    const [managers, setManagers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedTeamId, setSelectedTeamId] = useState("");
    const [selectedManagerId, setSelectedManagerId] = useState("");
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
    const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);

 const createNewTeam = async () => {
    try{
        const response = await createTeam(teamName);
        console.log("Team created successfully:", response.data);
        setTeamName("");
        await getAll();

    }catch(error){
        console.error("Error creating team:", error);
    }
 }
    const getAll = async () => {
        try {
            const response = await getTeams();

            console.log("Teams:", response.data);

            setGetTeams(response.data.teams);

        } catch (error) {
            console.error("Error fetching teams:", error);
        }
    };

    useEffect(() => {
        getAll();
    }, []);
const getallManagers = async () => {
    try {
        const response = await getManagers();   
        console.log("Managers:", response.data);
        setManagers(response.data.managers);
    }catch(error){
        console.error("Error fetching managers:", error);
    }
}
  useEffect(() => {
        getallManagers();
    }, []);
    const getallEmployees = async () => {
        try {
            const response = await getEmployees();
            console.log("Employees:", response.data);
            setEmployees(response.data.employees);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };
    useEffect(() => {
        getallEmployees();
    }, []);
    const assignManagerToTeam = async () => {
        if (!selectedTeamId || (!selectedManagerId && selectedEmployeeIds.length === 0)) return;
        try{
            const assign = await assignuser(
                selectedTeamId,
                selectedManagerId || undefined,
                selectedEmployeeIds
            );
            console.log("Team members assigned successfully:", assign.data);
            await getAll();

        }catch(error){
            console.error(
                "Error assigning manager:",
                error.response?.data ?? error.message
            );
        }

    }
    return (
        <main className="admin-page">
            <h1>Admin dashboard</h1>
            <p>Welcome, Admin. Manage teams and create project work.</p>
            <div className="admin-actions">
                <input type="text" value={teamName} placeholder="Team name" onChange={(e)=>{setTeamName(e.target.value)}} />
                <button onClick={createNewTeam} disabled={!teamName.trim()}>Create team</button>
                <Link className="primary-action" to="/projects-tasks" style={{ display: "inline-flex", alignItems: "center", padding: "0 16px", color: "white", textDecoration: "none" }}>Projects &amp; tasks</Link>
            </div>

            <div className="admin-team-list">
                {getAllTeams.map((team)=>(
                    <div className="admin-team-card" key={team._id}>
                        <h3>{team.name}</h3>
                        <p>{team.managerId?.name ?? "No manager assigned"}</p>
                    </div>
                ))}
            </div>
         <section className="admin-panel">
            <label>Team<select value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value)}>
                <option value="">Select team</option>
                {getAllTeams.map((team) => (
                    <option key={team._id} value={team._id}>{team.name}</option>
                ))}
            </select></label>
            <label>Manager<select value={selectedManagerId} onChange={(e) => setSelectedManagerId(e.target.value)}>
                <option value="">Select manager</option>
                {managers.map((manager) => (
                    <option key={manager._id} value={manager._id}>{manager.name}</option>
                ))}
            </select></label>
            <div className="admin-picker-field">
                <span className="admin-field-label">Employees</span>
                <button
                    className="admin-picker-trigger"
                    type="button"
                    onClick={() => setEmployeeDropdownOpen((open) => !open)}
                    aria-expanded={employeeDropdownOpen}
                >
                    {selectedEmployeeIds.length
                        ? `${selectedEmployeeIds.length} employee(s) selected`
                        : "Select employees"}
                </button>
                
                {employeeDropdownOpen && (
                    <div className="employee-menu">
                        {employees.map((employee) => (
                            <label key={employee._id}>
                                <input
                                    type="checkbox"
                                    checked={selectedEmployeeIds.includes(employee._id)}
                                    onChange={(e) => setSelectedEmployeeIds((selected) =>
                                        e.target.checked
                                            ? [...selected, employee._id]
                                            : selected.filter((id) => id !== employee._id)
                                    )}
                                /> {employee.name}
                            </label>
                        ))}
                        {employees.length === 0 && <p>No employees available</p>}
                    </div>
                )}
            </div>
            <button className="admin-assign-button"
                onClick={assignManagerToTeam}
                disabled={!selectedTeamId || (!selectedManagerId && selectedEmployeeIds.length === 0)}
            >
                Assign selected members
            </button>
         </section>
        </main>
    );
}

export default AdminDashboard;
