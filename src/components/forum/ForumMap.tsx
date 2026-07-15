import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L, { LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapPointStatus = "ok" | "warn" | "attention" | "empty";

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  label: string;
  sublabel?: string;
  status: MapPointStatus;
  readingsCount: number;
}

interface Props {
  points: MapPoint[];
}

const COLORS: Record<MapPointStatus, string> = {
  ok: "#10b981",
  warn: "#f59e0b",
  attention: "#ef4444",
  empty: "#94a3b8",
};

const buildIcon = (status: MapPointStatus) =>
  L.divIcon({
    className: "custom-marker-icon",
    html: `
    <svg width="30" height="40" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M16,3 C16,3 6,14 6,22 C6,29.18 10.82,35 16,35 C21.18,35 26,29.18 26,22 C26,14 16,3 16,3 Z"
        fill="${COLORS[status]}" stroke="#ffffff" stroke-width="2.5"/>
      <ellipse cx="13" cy="14" rx="4" ry="6" fill="rgba(255,255,255,0.4)"/>
    </svg>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40],
  });

const FitBounds = ({ points }: { points: MapPoint[] }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 12, { animate: true });
      return;
    }
    const bounds: LatLngBoundsExpression = points.map((p) => [p.lat, p.lng]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  }, [points, map]);
  return null;
};

const DEFAULT_CENTER: [number, number] = [-16.4, -39.3];

const ForumMap = ({ points }: Props) => {
  return (
    <div className="h-80 w-full overflow-hidden rounded-lg border border-border">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={9}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri"
          maxZoom={19}
        />
        <FitBounds points={points} />
        {points.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={buildIcon(p.status)}>
            <Popup>
              <div style={{ fontSize: 13, textAlign: "center", padding: 4 }}>
                <strong>{p.label}</strong>
                {p.sublabel && (
                  <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>
                    {p.sublabel}
                  </div>
                )}
                <div style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>
                  {p.readingsCount} coleta{p.readingsCount === 1 ? "" : "s"} no período
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ForumMap;
