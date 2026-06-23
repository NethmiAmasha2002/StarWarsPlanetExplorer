import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PlanetDetailsPage } from './pages/PlanetDetailsPage';
import { PlanetsPage } from './pages/PlanetsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/planets" replace />} />
        <Route path="/planets" element={<PlanetsPage />} />
        <Route path="/planets/:planetId" element={<PlanetDetailsPage />} />
        <Route path="*" element={<Navigate to="/planets" replace />} />
      </Route>
    </Routes>
  );
}
