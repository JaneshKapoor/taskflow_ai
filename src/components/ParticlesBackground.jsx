import Particles from "react-tsparticles";
import { useCallback } from "react";
import { loadSlim } from "tsparticles-slim"; // Lightweight particles engine

const ParticlesBackground = () => {
  const particlesInit = useCallback(async (engine) => {
    console.log("Initializing particles...");
    await loadSlim(engine); // Load lightweight engine
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true },
        fpsLimit: 60,
        background: {
          color: "#152029",
        },
        particles: {
          number: {
            value: 100,
            density: {
              enable: true,
              area: 800,
            },
          },
          size: {
            value: 3,
          },
          color: {
            value: "#bad1de",
          },
          move: {
            enable: true,
            speed: 1,
            direction:"none",
            outModes: {
              default: "bounce",
            },
          },
          opacity: {
            value: 0.5,
          },
          links: {
            enable: true,
            distance: 150,
            color: "#bad1de",
            opacity: 0.5,
            width: 2,
          },
        },
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "repulse", // Particles move away from the mouse
            },
            onClick: {
              enable: true,
              mode: "push", // Clicking adds more particles
            },
          },
          modes: {
            repulse: {
              distance: 100, // How far particles move away
              duration: 0.4,
            },
            push: {
              quantity: 4, // Number of new particles on click
            },
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default ParticlesBackground;
