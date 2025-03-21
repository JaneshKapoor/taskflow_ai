import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseconfig";
import "./Login.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard"); // Redirect on successful signup
    } catch (err) {
      setError(err.message || "Signup failed. Try again.");
    }
  };

  return (
    <>

    <div className="login_container">
      <h1 className="heading_login_box">Sign Up</h1>
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
      <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSignup}>
        Sign Up
      </button>
      <p className="mt-2">
        Already have an account? <a href="/" className="text-blue-500">log in</a>
        </p>
    </div>
    </>
  );
};

export default Signup;
