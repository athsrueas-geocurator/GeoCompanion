import { useState } from 'react';
import { BLOCK } from './block-capabilities.mjs';
import { iconUrl } from '../../shared/branding/space-icons.mjs';
import { EDUCATION_SPACE } from '../../config/geo.mjs';
import { usePreferences } from '../../shared/preferences/Preferences';

type Props = {
  record: {
    id: string;
    name: string;
    description: string;
    fields: { id: string; value: unknown }[];
  };
};
export default function DatasetImage({ record }: Props) {
  const { value: preferences } = usePreferences();
  const automatic = preferences.imageLoading !== 'ask';
  const value = record.fields.find((f) => f.id === BLOCK.imageUrl)?.value;
  const src = iconUrl(value);
  // Reset per-image permission when its URL or the saved policy changes.
  return (
    <ImageContent
      key={`${record.id}:${src}:${automatic}`}
      record={record}
      src={src}
      automatic={automatic}
    />
  );
}
function ImageContent({
  record,
  src,
  automatic,
}: Props & { src: string | null; automatic: boolean }) {
  const [show, setShow] = useState(automatic),
    [failed, setFailed] = useState(false);
  const name = record.name === 'Untitled entry' ? 'Image' : record.name;
  return (
    <figure className="dataset-image">
      {src && !show && (
        <button onClick={() => setShow(true)}>Show image: {name}</button>
      )}
      {src && show && !failed && (
        <img
          src={src}
          alt={name}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <p role="alert">
          Image could not load.{' '}
          <button
            onClick={() => {
              setFailed(false);
              setShow(automatic);
            }}
          >
            Try again
          </button>
        </p>
      )}
      <figcaption>
        {record.description && <p>{record.description}</p>}
        <a
          href={`https://www.geobrowser.io/space/${EDUCATION_SPACE}/${record.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {name} on Geo ↗
        </a>
      </figcaption>
    </figure>
  );
}
