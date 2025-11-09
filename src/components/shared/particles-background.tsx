'use client';
import React from 'react';

// A simple component that renders a single particle with CSS animations
const Particle: React.FC<{ index: number }> = ({ index }) => {
  // Use random values for unique animation properties for each particle
  const style: React.CSSProperties = {
    left: `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 10 + 10}s`, // Duration between 10 and 20 seconds
    animationDelay: `${Math.random() * 10}s`,      // Delay up to 10 seconds
  };
  return <div className="particle" style={style} />;
};


// The main background component
export const ParticlesBackground: React.FC = () => {
    return (
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <style jsx>{`
              .particle {
                position: absolute;
                top: 0;
                width: 3px;
                height: 3px;
                background: hsl(var(--primary) / 0.3); /* Use theme primary color with opacity */
                border-radius: 50%;
                opacity: 0;
                animation: fall 20s infinite linear;
              }
              
              @keyframes fall {
                0% {
                  transform: translateY(-10vh);
                  opacity: 0;
                }
                10% {
                  opacity: 1;
                }
                100% {
                  transform: translateY(110vh);
                  opacity: 0;
                }
              }
            `}</style>
            {[...Array(100)].map((_, i) => (
              <Particle key={i} index={i} />
            ))}
        </div>
    );
};
