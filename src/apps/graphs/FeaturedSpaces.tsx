import { useEffect, useState } from 'react';
import { loadFeaturedSpaces } from '../../shared/geo/featured-spaces.mjs';
import SpaceIcon from '../../shared/branding/SpaceIcon';
export default function FeaturedSpaces({
  scope,
  onSelect,
}: {
  scope: string;
  onSelect: (id: string) => void;
}) {
  const [spaces, setSpaces] = useState<{ id: string; name: string }[]>([]),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(true),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setBusy(true);
    setError('');
    loadFeaturedSpaces()
      .then((rows) => {
        if (active) setSpaces(rows);
      })
      .catch(() => {
        if (active)
          setError(
            'Featured spaces are unavailable. Try again or choose another space.',
          );
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [revision]);
  return (
    <section className="featured-spaces" aria-label="Featured spaces">
      <h2>Featured spaces</h2>
      {busy && <p role="status">Loading spaces…</p>}
      {error && (
        <p role="alert">
          {error}{' '}
          <button onClick={() => setRevision((r) => r + 1)}>
            Retry featured spaces
          </button>
        </p>
      )}
      <div className="featured-space-pins">
        {spaces.map((space) => (
          <button
            key={space.id}
            aria-pressed={scope === space.id}
            onClick={() => onSelect(space.id)}
          >
            <SpaceIcon spaceId={space.id} />
            <span>{space.name}</span>
          </button>
        ))}
      </div>
      {!busy && !error && !spaces.length && (
        <p>No featured spaces are available.</p>
      )}
    </section>
  );
}
