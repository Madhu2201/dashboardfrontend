import Navbar from "./Navbar"
import { Navigate } from "react-router-dom";

function Dashboard() {
    const user = JSON.parse(localStorage.getItem("user"));
    if(!user){
        return <Navigate to="/" replace />;
    }
    if(user.role ==="ADMIN"){
        return <Navigate to="/admin-dashboard" replace />;
    }
    if(user.role ==="MANAGER"){
        return <Navigate to="/manager-dashboard" replace />;
    }
    if(user.role ==="EMPLOYEE"){
        return <Navigate to="/employee-dashboard" replace />;
    }
  return (
    <div>
        <Navbar />
    </div>
  )
}

export default Dashboard