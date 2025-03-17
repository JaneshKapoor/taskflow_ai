import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseconfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    signOut(auth).then(() => navigate("/"));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {user && <p>Welcome, {user.email}!</p>}
      <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
