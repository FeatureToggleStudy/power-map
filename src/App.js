import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Axis from "./axis/axis";

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Power Mapping Tool</h1>
        </header>
        <Axis></Axis>
      </div>
    );
  }
}

export default App;