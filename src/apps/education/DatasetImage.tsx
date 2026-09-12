import { useState } from 'react';
import { BLOCK } from './block-capabilities.mjs';
import { iconUrl } from '../../shared/branding/space-icons.mjs';
import { EDUCATION_SPACE } from '../../config/geo.mjs';

type Props = {
  record: {
    id: string;
    name: string;
    description: string;
    fields: { id: string; value: unknown }[];
  };
};
export default function DatasetImage({ record }: Props) {
  const value = record.fields.find((f) => f.id === BLOCK.imageUrl)?.value;
  const src = iconUrl(value);
  // A changed image URL resets download consent and any prior error.
  return <ImageContent key={`${record.id}:${src}`} record={record} src={src} />;
}
function ImageContent({ record, src }: Props & { src: string | null }) {
  const [show, setShow] = useState(false),
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
              setShow(false);
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
