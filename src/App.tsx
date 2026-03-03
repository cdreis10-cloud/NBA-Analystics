import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import HomePage from './pages/HomePage';
import EPDPage from './pages/EPDPage';
import BreakoutPage from './pages/BreakoutPage';
import PlayersPage from './pages/PlayersPage';
import PlayerDetailPage from './pages/PlayerDetailPage';
import TeamsPage from './pages/TeamsPage';
import ComparePage from './pages/ComparePage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/epd" element={<EPDPage />} />
            <Route path="/breakout" element={<BreakoutPage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/player/:id" element={<PlayerDetailPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/compare" element={<ComparePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
