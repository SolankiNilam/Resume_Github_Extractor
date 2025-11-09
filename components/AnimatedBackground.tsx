import React from 'react';

const AnimatedBackground: React.FC = () => {
  // Defines the properties of the shapes to be rendered
  const shapes = [
    { style: 'w-48 h-48 rounded-full bg-brand-purple/10', top: '10vh', left: '10vw', duration: '35s', delay: '0s' },
    { style: 'w-24 h-24 rounded-lg bg-brand-pink/10', top: '50vh', left: '80vw', duration: '40s', delay: '5s' },
    { style: 'w-32 h-32 rounded-2xl bg-brand-purple/5', top: '80vh', left: '20vw', duration: '30s', delay: '10s' },
    { style: 'w-64 h-64 rounded-full bg-brand-pink/5', top: '20vh', left: '70vw', duration: '45s', delay: '2s' },
    { style: 'w-16 h-16 rounded-full bg-brand-purple/20', top: '90vh', left: '90vw', duration: '28s', delay: '7s' },
    { style: 'w-40 h-40 rounded-3xl bg-brand-pink/10', top: '5vh', left: '40vw', duration: '38s', delay: '12s' },
  ];

  return (
    <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden bg-background dark:bg-background-dark dark:[--bg-image-url:radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.3),hsla(0,0%,100%,0))]" style={{backgroundImage: 'var(--bg-image-url, radial-gradient(ellipse 80% 50% at 50% -20%,rgba(120,119,198,0.1),hsla(0,0%,100%,0)))'}}>
      {shapes.map((shape, index) => (
        <div
          key={index}
          className={`absolute animate-float-bg blur-3xl ${shape.style}`}
          style={{
            top: shape.top,
            left: shape.left,
            animationDuration: shape.duration,
            animationDelay: shape.delay,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
