export default function TestPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'sans-serif',
      backgroundColor: '#111',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '3rem', color: '#00ff00' }}>🚀 TEST SUCCESSFUL!</h1>
      <p style={{ fontSize: '1.5rem' }}>If you can see this, the Vercel routing is FIXED.</p>
      <p style={{ opacity: 0.7 }}>This page uses NO environment variables.</p>
    </div>
  );
}
