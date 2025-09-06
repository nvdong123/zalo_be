import React from 'react';

console.log('Services Debug Component Loading...');

const ServicesDebug: React.FC = () => {
  console.log('ServicesDebug: Component rendered');
  
  React.useEffect(() => {
    console.log('ServicesDebug: useEffect triggered');
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h1 style={{ color: 'red' }}>🔴 DEBUG: Services Page Loaded Successfully!</h1>
      <p>Current time: {new Date().toLocaleString()}</p>
      <p>Current URL: {window.location.href}</p>
      <p>Pathname: {window.location.pathname}</p>
      <button onClick={() => console.log('Button clicked!')}>Test Button</button>
    </div>
  );
};

console.log('Services Debug Component Exported');

export default ServicesDebug;
