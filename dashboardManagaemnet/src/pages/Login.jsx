import  { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { register } from "../services/authService";

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handlesubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if(isRegister){
        // Handle registration logic here
        const response = await register(name,email,password,role);
        console.log("Registration successful:", response.data);
        setMessage("Registration successful! Please login.");
        setIsRegister(false);
        navigate("/");
      }else{
        const response = await login(email, password);
        console.log("Login successful:", response.data);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data);
      setError(error.response?.data?.message || "Login failed. Please try again.");
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>{isRegister ? "Register" : "Login"}</h2>

        <form onSubmit={handlesubmit}>
          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}

          {isRegister && (
            <div>
              <label>Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {isRegister && (
            <div>
              <label htmlFor="register-role">Role:</label>
              <select id="register-role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
              </select>
            </div>
          )}

          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <p>
          {isRegister
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setMessage("");
            }}
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login
