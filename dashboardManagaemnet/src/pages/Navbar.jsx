import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const handleclick = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
        navigate("/");

    }
  return (
  
    <div>
        <h1>Navbar</h1>
        <button onClick={handleclick}>Logout</button>
        
    </div>
  )
}

export default Navbar