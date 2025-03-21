import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseconfig";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard"); // Redirect on success
    } catch (err) {
      setError(err.message || "Invalid email or password");
    }
  };

  return (
    <>

    <div className="login_container">
      <h1 className="heading_login_box">Login</h1>
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        className="mb-2 text-black p-2 border bg-white"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="mb-2 text-black p-2 border bg-white"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleLogin}>
        Login
      </button>
      <p className="mt-2">
        Don't have an account? <a href="/signup" className="text-blue-500">Sign up</a>
        </p>

    </div>

    </>
  );
};

export default Login;
