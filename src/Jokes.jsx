import { useState } from "react";

function Jokes() {
  const [line1, setLine1] = useState(false);
  const [line2, setLine2] = useState(false);
  const [line3, setLine3] = useState(false);

  return (
    <>
      <h2>Why don’t scientists trust atoms?</h2>
      <button onClick={() => setLine1(prev => !prev)}>
        {line1 ? "Hide" : "Show "} punchline
      </button>
      {line1 && <p>Punchline: Because they make up everything!</p>}
      <hr />

      <h2>Why did the scarecrow win an award?</h2>
      <button onClick={() => setLine2(prev => !prev)}>
        {line2 ? "Hide " : "Show "}punchline
      </button>
      {line2 && <p>Punchline: Because he was outstanding in his field!</p>}
      <hr />

      <h2>Why did the math book look sad?</h2>
      <button onClick={() => setLine3(prev => !prev)}>
        {line3 ? "Hide " : "Show "}punchline
      </button>
      {line3 && <p>Punchline: Because it had too many problems.</p>}

      

     
    </>
  );
}

export default Jokes;
