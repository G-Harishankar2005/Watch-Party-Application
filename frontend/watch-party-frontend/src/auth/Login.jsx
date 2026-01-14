import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const submit = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token);
      navigate("/home");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="login-container">
      {/* LEFT SIDE */}
      <div className="login-left">
        <img
          src="/login-illustration.png"
          alt="Login Illustration"
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="login-right">
        <div className="login-card">
          <h2>Hello!</h2>
          <p>Sign Up to Get Started</p>

          <div className="input-box">
            <span>📧</span>
            <input
              type="email"
              placeholder="Email Address"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-box">
            <span>🔒</span>
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button onClick={submit}>Login</button>

          <a href="#" className="forgot">Forgot Password</a>
        </div>
      </div>
    </div>
  );
};

export default Login;

