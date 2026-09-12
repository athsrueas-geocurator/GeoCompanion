import { useEffect, useState } from 'react';
import { Mark } from './Brand';
import { loadIcon } from './space-icons.mjs';
export default function SpaceIcon({ spaceId }: { spaceId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    setUrl(null);
    loadIcon(spaceId)
      .then((value) => {
        if (live) setUrl(value);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [spaceId]);
  return (
    <span className="space-icon" aria-hidden="true">
      {url ? (
        <img
          src={url}
          alt=""
          width="52"
          height="52"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setUrl(null)}
        />
      ) : (
        <Mark />
      )}
    </span>
  );
}
