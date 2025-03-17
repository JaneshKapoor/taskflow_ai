import ParticlesBackground from "./components/ParticlesBackground";
import AppRoutes from "./routes";

function App() {
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
