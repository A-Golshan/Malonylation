import './App.css';
import Navbar from './Components/Navbar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/Home';
import Contact from './Components/Contact';
import Server from './Components/Server';
import About from './Components/About';
import Help from './Components/Help';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={ <Home /> } />
            <Route path="/about" element={ <About /> } />
            <Route path="/contact" element={ <Contact /> } />
            <Route path="/server" element={ <Server /> } />
            <Route path="/help" element={ <Help /> } />
          </Routes>
        </div>
        <footer>footer</footer>
      </div>
    </Router>
  );
}

export default App;
