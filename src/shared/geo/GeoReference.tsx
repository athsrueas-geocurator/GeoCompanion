import { useState } from 'react';
import { referenceSpaces, referenceChoices } from './references.mjs';
import { validId } from './collections.mjs';
type ReferenceProps = {
  id: string;
  name: string;
  spaces?: string[];
  context?: string;
};

export default function GeoReference(props: ReferenceProps) {
  // Membership changes start a new resolver, including any pending request.
  const key = JSON.stringify([
    props.id,
    props.context,
    [...new Set(props.spaces || [])].sort(),
  ]);
  return <Reference key={key} {...props} />;
}

function Reference({ id, name, spaces = [], context }: ReferenceProps) {
  const candidates = referenceSpaces(spaces, context),
    [choices, setChoices] = useState<
      { id: string; name: string; url: string }[] | null
    >(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  if (!validId(id)) return <span>{name}</span>;
  if (candidates.length === 1)
    return (
      <a
        href={`https://www.geobrowser.io/space/${candidates[0]}/${id}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {name} ↗
      </a>
    );
  async function open() {
    setBusy(true);
    setError('');
    try {
      setChoices(await referenceChoices(id, spaces, context));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reference unavailable.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <span>
      <button
        className="geo-reference"
        disabled={busy}
        onClick={() => void open()}
      >
        {name} ↗
      </button>
      {busy && <span role="status"> Loading…</span>}
      {error && <span role="alert"> {error}</span>}
      {choices?.length === 0 && <span> This reference is unavailable.</span>}
      {choices && choices.length > 0 && (
        <ul>
          {choices.map((c) => (
            <li key={c.id}>
              <a href={c.url} target="_blank" rel="noopener noreferrer">
                {c.name} ↗
              </a>
            </li>
          ))}
        </ul>
      )}
    </span>
  );
}
