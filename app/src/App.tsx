import logo from './WebAssembly_Logo.svg';
import './App.css';
import {useEffect} from "react";
import Cam from "./cam";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Cam effects with <code>wasm</code> and <code>rust</code> <span id={"fps"}></span>fps
        </p>

          <Cam />
      </header>
    </div>
  );
}

export default App;
