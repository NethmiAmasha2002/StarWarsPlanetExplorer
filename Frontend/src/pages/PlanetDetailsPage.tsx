import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPlanetById, type PlanetSummary } from '../data/swapi';

export function PlanetDetailsPage() {
  const { planetId } = useParams();
  const [planet, setPlanet] = useState<PlanetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planetId) {
      setError('Missing planet id.');
      setLoading(false);
      return;
    }

    // Abort previous request if the route changes before it finishes.
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchPlanetById(planetId, controller.signal)
      .then((planetData) => {
        setPlanet(planetData);
      })
      .catch((fetchError: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : 'Unexpected error.');
      })
      .finally(() => {
        // Avoid setting state after unmount/abort.
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [planetId]);

  return (
    <section className="details-layout">
      <div className="details-header">
        <Link className="back-link" to="/planets">
          Back to planets
        </Link>
        <div>
          <p className="eyebrow">Planet details</p>
          <h2>{planet?.name ?? 'Planet details'}</h2>
        </div>
      </div>

      {loading ? <div className="state-card">Loading planet details...</div> : null}
      {error ? <div className="state-card error-state">{error}</div> : null}

      {planet ? (
        <div className="details-grid">
          <article className="detail-card">
            <span>Diameter</span>
            <strong>{planet.diameter}</strong>
          </article>
          <article className="detail-card">
            <span>Terrain</span>
            <strong>{planet.terrain}</strong>
          </article>
          <article className="detail-card">
            <span>Population</span>
            <strong>{planet.population}</strong>
          </article>
          <article className="detail-card">
            <span>Climate</span>
            <strong>{planet.climate}</strong>
          </article>
          <article className="detail-card">
            <span>Gravity</span>
            <strong>{planet.gravity}</strong>
          </article>
          <article className="detail-card">
            <span>Rotation period</span>
            <strong>{planet.rotation_period}</strong>
          </article>
          <article className="detail-card">
            <span>Orbital period</span>
            <strong>{planet.orbital_period}</strong>
          </article>
          <article className="detail-card">
            <span>Surface water</span>
            <strong>{planet.surface_water}</strong>
          </article>
        </div>
      ) : null}
    </section>
  );
}
