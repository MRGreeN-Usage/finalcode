'use client';
import React, { useEffect, useRef } from 'react';

// A simple component that renders a single particle with CSS animations
const Particle: React.FC<{ index: number }> = ({ index }) => {
  // Use random values for unique animation properties for each particle
  const style: React.CSSProperties = {
    left: `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 5 + 5}s`, // Duration between 5 and 10 seconds
    animationDelay: `${Math.random() * 5}s`,      // Delay up to 5 seconds
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
                bottom: 0;
                width: 10px;
                height: 10px;
                background: hsl(var(--primary) / 0.3); /* Use theme primary color with opacity */
                border-radius: 50%;
                opacity: 0;
                animation: rise 10s infinite linear;
              }
              
              @keyframes rise {
                0% {
                  transform: translateY(0);
                  opacity: 0;
                }
                10% {
                  opacity: 1;
                }
                100% {
                  transform: translateY(-100vh);
                  opacity: 0;
                }
              }
            `}</style>
            {[...Array(50)].map((_, i) => (
              <Particle key={i} index={i} />
            ))}
        </div>
    );
};
