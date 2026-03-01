import React from 'react';
import './FloatingBackground.css';

const FloatingBackground = () => {
    return (
        <>
            {/* Floating Particles */}
            <div className="floating-particles">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="particle" />
                ))}
            </div>

            {/* Gradient Mesh */}
            <div className="gradient-mesh">
                <div className="mesh-gradient-1" />
                <div className="mesh-gradient-2" />
                <div className="mesh-gradient-3" />
            </div>
        </>
    );
};

export default FloatingBackground;
