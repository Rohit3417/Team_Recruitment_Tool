import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Load from './pages/Load';
import MapColumns from './pages/MapColumns';
import Rules from './pages/Rules';
import Results from './pages/Results';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Redirect root to /load */}
          <Route index element={<Navigate to="/load" replace />} />
          <Route path="load" element={<Load />} />
          <Route path="map" element={<MapColumns />} />
          <Route path="rules" element={<Rules />} />
          <Route path="results" element={<Results />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
