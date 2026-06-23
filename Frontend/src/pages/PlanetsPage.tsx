import { useEffect, useState, useTransition, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PlanetTable } from '../components/PlanetTable';
import { fetchPlanets, type PlanetSummary } from '../data/swapi';

export function PlanetsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Keep the URL as the source of truth so search state survives refresh/share.
  const initialSearch = searchParams.get('search') ?? '';
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [planets, setPlanets] = useState<PlanetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Cancel stale requests when the search term changes quickly.
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchPlanets(initialSearch, controller.signal)
      .then((planetList) => {
        setPlanets(planetList);
      })
      .catch((fetchError: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : 'Unexpected error.');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [initialSearch]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedSearch = searchInput.trim();

    startTransition(() => {
      setSearchParams(normalizedSearch ? { search: normalizedSearch } : {});
    });
  }

  function handleReload() {
    window.location.reload();
  }

  const hasResults = planets.length > 0;

  return (
    <section className="page-grid">
      <div className="hero-card">
        <div>
          <p className="eyebrow">Planet directory</p>
          <h2>Search the galaxy by planet name</h2>
          <p className="hero-copy">
            Browse Star Wars planets, open detail pages, and reload the page whenever you want a clean state.
          </p>
        </div>
        <div className="hero-actions">
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <label className="sr-only" htmlFor="planet-search">
              Search by planet name
            </label>
            <input
              id="planet-search"
              type="search"
              placeholder="Search planets..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <button type="submit">Search</button>
          </form>
          <div className="button-row">
            <button type="button" className="secondary-button" onClick={handleReload}>
              Reload page
            </button>
            <Link className="secondary-button link-button" to="/planets">
              Clear search
            </Link>
          </div>
        </div>
      </div>

      <div className="status-row">
        {isPending ? <span>Updating search...</span> : <span>Showing planets from SWAPI</span>}
      </div>

      {loading ? <div className="state-card">Loading planets...</div> : null}
      {error ? <div className="state-card error-state">{error}</div> : null}
      {!loading && !error && !hasResults ? (
        <div className="state-card">No planets matched your search.</div>
      ) : null}
      {!loading && !error && hasResults ? <PlanetTable planets={planets} /> : null}
    </section>
  );
}
