import { Link } from 'react-router-dom';
import { getPlanetIdFromUrl, type PlanetSummary } from '../data/swapi';

type PlanetTableProps = {
  planets: PlanetSummary[];
};

export function PlanetTable({ planets }: PlanetTableProps) {
  return (
    <div className="table-card">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Diameter</th>
              <th>Terrain</th>
              <th>Population</th>
            </tr>
          </thead>
          <tbody>
            {planets.map((planet) => {
              // Planet links are built from SWAPI-style URLs returned by the API.
              const planetId = getPlanetIdFromUrl(planet.url);

              return (
                <tr key={planet.url}>
                  <td>
                    <Link className="planet-link" to={`/planets/${planetId}`}>
                      {planet.name}
                    </Link>
                  </td>
                  <td>{planet.diameter}</td>
                  <td>{planet.terrain}</td>
                  <td>{planet.population}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
