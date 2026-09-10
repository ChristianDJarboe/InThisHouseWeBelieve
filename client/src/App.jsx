import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import Header from './components/Header';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="app-shell">
      <div className="page-bg" aria-hidden="true">
        <img src="/classic-bg.png" alt="" className="page-bg-img" />
        <div className="page-bg-veil" />
      </div>
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}