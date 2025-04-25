import ParticlesBackground from "./components/ParticlesBackground";
import AppRoutes from "./routes";
import { useEffect } from "react";
import { initEmailJS } from "./utils/notificationService";

function App() {
  useEffect(() => {
    // Initialize EmailJS when the app loads
    initEmailJS();
    console.log("📧 EmailJS initialized");
  }, []);

  return (
    <div style={{ position: "relative", minHeight: "100vh", backgroundColor: "#152029" }}>
      <ParticlesBackground />  {/* Background applied globally */}
      <div style={{ position: "relative", zIndex: 1, color: "white", textAlign: "center" }}>
        <h1 className="text-3xl font-bold head-head bg-[#152029]">TaskFlow AI</h1>
        <AppRoutes /> {/* Routes will be rendered here */}
      </div>
    </div>
  );
}

export default App;
