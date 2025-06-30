import React from 'react';

const styles = {
  header: {
    background: 'linear-gradient(to right, #2C3E50 70%, #F4F4F4 100%)',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid #1ABC9C',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    fontFamily: "'Poppins', sans-serif",
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: 600,
    color: '#FFFFFF', 
    letterSpacing: '1.5px',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  emoji: {
    fontSize: '2.2rem',
  },
};

const Header = () => {
  return (
    <header style={styles.header}>
      <h1 style={styles.title}>
        <span style={styles.emoji}>👨‍🍳</span> Chef Claude
      </h1>
    </header>
  );
};

export default Header;
