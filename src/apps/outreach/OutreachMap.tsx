import { useMemo } from 'react';
import MapCanvas, { type MapPoint } from '../../shared/maps/MapCanvas';
import type { Service } from './Directory';
export default function OutreachMap({
  services = [],
}: {
  services?: Service[];
}) {
  const layers = useMemo(() => {
    const stops = new Map<string, MapPoint>();
    for (const s of services)
      for (const p of s.locations) {
        const existing = stops.get(p.id);
        stops.set(p.id, {
          id: p.id,
          name: p.name,
          point: p.point,
          detail: existing ? `${existing.detail}; ${s.name}` : s.name,
        });
      }
    return [
      {
        id: 'outreach-public-stops',
        label: 'Public service locations',
        features: [...stops.values()],
      },
    ];
  }, [services]);
  return (
    <MapCanvas
      layers={layers}
      center={[39.7684, -86.1581]}
      zoom={11}
      maxZoom={14}
    />
  );
}
