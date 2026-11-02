import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Navbar from "./pages/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ProjectsTasks from "./pages/ProjectsTasks";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/navbar" element={<Navbar />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/projects-tasks" element={<ProjectsTasks />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
     
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
