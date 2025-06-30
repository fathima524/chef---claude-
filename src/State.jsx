import React, { use, useState } from "react";

//Toggle Text

// function ToggleText() {
//   const [show, setShow] = useState(true);

//   return (
//     <>
//       <button onClick={() => setShow(!show)}>Toggle</button>
//       {show && <p>Hello, I am visible!</p>}
//     </>
//   );
// }

// export default ToggleText;




//Change Text 

// function State()
// {
//     const [text , setText] = useState('');

//     function changes(e){
//         setText(e.target.value);
//     }

//   return (
//     <>
//     <input type="text" placeholder="text here" onChange={changes}/>
//     <p>You  typed :{text}</p>
//     </>
   
     
//   )
// }

//button uses 








// USING MULTIPLE STATE VALUES
function State(){

const styles = {
  container: {
    textAlign: "center",
    marginTop: "50px",
    fontFamily: "Arial, sans-serif"
  },
  input: {
    margin: "10px",
    padding: "8px 12px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px"
  }
};


  const[name , setName] = useState();
  const[id, setId] = useState();

  function nameFunction(e){
    setName(e.target.value);
  }
  function idFunction(e){
    setId(e.target.value)
  }
  return(
   <div style={styles.container}>
      <h2>Hi, enter your name and ID</h2>
      <input
        type="text"
        value={name}
        placeholder="Enter your name here"
        onChange={nameFunction}
        style={styles.input}
      />
      <input
        type="number"
        value={id}
        placeholder="Enter your ID here"
        onChange={idFunction}
        style={styles.input}
      />
      <h2>Your name is {name} and ID is {id}</h2>
    </div>
  );

}
export default State;