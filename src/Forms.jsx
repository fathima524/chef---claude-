import React from 'react';

function Forms() {
  const styles = {
    container: {
      maxWidth: '400px',
      margin: '50px auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    heading: {
      textAlign: 'center',
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '12px',
      fontSize: '1rem',
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      marginTop: '4px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '1rem',
    },
    button: {
      width: '100%',
      padding: '10px 0',
      marginTop: '10px',
      backgroundColor: '#1ABC9C',
      border: 'none',
      borderRadius: '4px',
      color: '#fff',
      fontSize: '1rem',
      cursor: 'pointer',
    }
  };

//native code 

// function handleSubmit(event){
//     event.preventDefault();
//     alert("Submitted")
//     const formEl = event.currentTarget;
//     const formData = new FormData(formEl);
//     const email= formData.get("email");
//     console.log(email)
//     const password = formData.get("password");
//     console.log(password)
//     formEl.reset()

// 

//what react offers 
function signUp(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    console.log(email);
}
  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Sign up form</h2>

      <form action="signup" >
        
      <label htmlFor="email" style={styles.label}>
        Email
        <input type="email" placeholder="email" name="email" style={styles.input} />
      </label>

      <label htmlFor="password" style={styles.label}>
        Password
        <input type="password" placeholder="******" name="password" style={styles.input} />
      </label>

      <button style={styles.button}>Submit</button>

      </form>

    </div>
  );
}

export default Forms;
