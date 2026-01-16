import { useEffect, useState } from 'react';

// Palette de couleurs élégante
const theme = {
  bg: '#020617',          // Noir profond
  sidebar: '#0f172a',     // Ardoise sombre
  card: '#1e293b',        // Ardoise moyenne
  accent: '#818cf8',      // Indigo doux
  accentHover: '#6366f1', // Indigo vibrant
  textMain: '#f8fafc',    // Blanc cassé
  textMuted: '#94a3b8',   // Gris bleuté
  border: 'rgba(255, 255, 255, 0.05)'
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: theme.bg,
    color: theme.textMain,
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
  },
  sidebar: {
    width: '380px',
    minWidth: '380px',
    background: theme.sidebar,
    borderRight: `1px solid ${theme.border}`,
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '10px 0 30px rgba(0,0,0,0.2)',
  },
  mainContent: {
    flexGrow: 1,
    padding: '3rem',
    overflowY: 'auto',
  },
  logo: {
    fontSize: '1.8rem',
    fontWeight: '800',
    letterSpacing: '-1px',
    marginBottom: '3rem',
    background: `linear-gradient(to right, ${theme.accent}, #c084fc)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: theme.textMuted,
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    width: '100%',
    padding: '0.8rem 1rem',
    borderRadius: '10px',
    border: `1px solid ${theme.border}`,
    background: 'rgba(2, 6, 23, 0.5)',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '1rem',
    marginTop: '1rem',
    borderRadius: '10px',
    border: 'none',
    background: theme.accent,
    color: 'white',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: `0 4px 14px 0 rgba(129, 140, 248, 0.39)`,
  },
  eventGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  eventCard: {
    background: theme.card,
    borderRadius: '16px',
    padding: '1.5rem',
    border: `1px solid ${theme.border}`,
    transition: 'transform 0.2s, hover 0.2s',
    cursor: 'default',
  },
  bookingItem: {
    background: 'rgba(255,255,255,0.03)',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '0.75rem',
    borderLeft: `3px solid ${theme.accent}`,
    fontSize: '0.9rem',
  }
};

function App() {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState('');
  const [userName, setUserName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [myBookings, setMyBookings] = useState([]);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(setEvents)
      .catch(err => console.error("Erreur fetch:", err));
  }, []);

  const bookEvent = async () => {
    if (!eventId || !userName) return;
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId, user_name: userName, quantity })
    });
    const booking = await res.json();
    setMyBookings([booking, ...myBookings]);
    setUserName('');
    setQuantity(1);
  };

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>EventMesh</div>
        
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Réservation</h2>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Événement</label>
          <select 
            style={styles.input} 
            value={eventId}
            onChange={e => setEventId(e.target.value)}
          >
            <option value="">Choisir un événement</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Nom complet</label>
          <input
            style={styles.input}
            placeholder="John Doe"
            value={userName}
            onChange={e => setUserName(e.target.value)}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Nombre de places</label>
          <input
            style={styles.input}
            type="number"
            min="1"
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
          />
        </div>

        <button 
          style={styles.button}
          onClick={bookEvent}
          onMouseOver={(e) => e.target.style.background = theme.accentHover}
          onMouseOut={(e) => e.target.style.background = theme.accent}
        >
          Réserver maintenant
        </button>

        {myBookings.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <label style={styles.label}>Mes réservations</label>
            {myBookings.map(b => (
              <div key={b.id} style={styles.bookingItem}>
                <strong>{b.quantity} place(s)</strong>
                <div style={{ color: theme.textMuted, fontSize: '0.8rem' }}>Événement #{b.event_id}</div>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main style={styles.mainContent}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '2rem' }}>Événements disponibles</h2>
          <span style={{ color: theme.textMuted }}>{events.length} affiches</span>
        </div>

        <div style={styles.eventGrid}>
          {events.length > 0 ? events.map(e => (
            <div 
                key={e.id} 
                style={styles.eventCard}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ color: theme.accent, fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {e.date}
              </div>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>{e.title}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: theme.textMuted }}>Capacité :</span>
                <span style={{ 
                    background: 'rgba(129, 140, 248, 0.1)', 
                    color: theme.accent, 
                    padding: '4px 12px', 
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                }}>
                  {e.capacity} places
                </span>
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '4rem', color: theme.textMuted }}>
              Chargement des événements...
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;