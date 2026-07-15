import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  lat: number;
  lng: number;
  label: string;
}

const dropletIcon = L.divIcon({
  className: "custom-marker-icon",
  html: `
    <svg width="30" height="40" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M16,3 C16,3 6,14 6,22 C6,29.18 10.82,35 16,35 C21.18,35 26,29.18 26,22 C26,14 16,3 16,3 Z"
        fill="#0284c7" stroke="#ffffff" stroke-width="2.5"/>
      <ellipse cx="13" cy="14" rx="4" ry="6" fill="rgba(255,255,255,0.4)"/>
    </svg>`,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -40],
});

const ForumMiniMap = ({ lat, lng, label }: Props) => {
  return (
    <div className="h-64 w-full overflow-hidden rounded-lg border border-border">
      <MapContainer
        key={`${lat}-${lng}`}
        center={[lat, lng]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri"
          maxZoom={19}
        />
        <Marker position={[lat, lng]} icon={dropletIcon}>
          <Popup>
            <div style={{ fontSize: 13, textAlign: "center", padding: 4 }}>
              <strong>{label}</strong>
              <div style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>
                {lat.toFixed(4)}, {lng.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default ForumMiniMap;
