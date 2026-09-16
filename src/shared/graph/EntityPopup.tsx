import { useEffect, useState } from 'react';
import { loadDetails } from './entity-details.mjs';
import type { GraphNode } from './types';
export default function EntityPopup({
  node,
  onClose,
}: {
  node: GraphNode;
  onClose: () => void;
}) {
  const [data, setData] = useState<any>(null),
    [error, setError] = useState(''),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let live = true;
    setData(null);
    setError('');
    const timer = setTimeout(() => {
      loadDetails(node.id, node.space)
        .then((d) => {
          if (live) setData(d);
        })
        .catch(() => {
          if (live) setError('Details could not be loaded.');
        });
    }, 300);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [node.id, node.space, retry]);
  return (
    <aside className="entity-popup" aria-label="Entity details">
      <div className="entity-popup-heading">
        <h3>{node.label}</h3>
        <button aria-label="Close entity details" onClick={onClose}>
          ×
        </button>
      </div>
      {!data && !error && <p role="status">Loading details…</p>}
      {error && (
        <p role="status">
          {error} <button onClick={() => setRetry((r) => r + 1)}>Retry</button>
        </p>
      )}
      {data && (
        <>
          <table>
            <caption className="sr-only">
              Published entity properties and relationships
            </caption>
            <tbody>
              {[...data.fields, ...data.relations].map((row, i) => (
                <tr key={`${row.id}:${i}`}>
                  <th scope="row">{row.label}</th>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.fields.length && !data.relations.length && (
            <p>No properties published in this space.</p>
          )}
          {data.partial && (
            <p className="muted">
              More properties or relationships are available on Geo.
            </p>
          )}
        </>
      )}
      <a
        href={
          node.geoUrl ||
          `https://www.geobrowser.io/space/${node.space}/${node.id}`
        }
        target="_blank"
        rel="noopener noreferrer"
      >
        Open on Geo ↗
      </a>
    </aside>
  );
}
