import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icon
const createCustomIcon = (type: string) => {
  const colors = {
    ristorante: "#f59e0b",
    bar: "#3b82f6",
    caffetteria: "#8b5cf6",
  };
  const color = colors[type as keyof typeof colors] || "#f59e0b";

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        <div style="transform: rotate(45deg); color: white; font-size: 14px;">●</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

interface ReviewLocation {
  id: string;
  name: string;
  type: string;
  rating: number;
  location: string;
  latitude: number;
  longitude: number;
  image?: string;
}

interface MapViewProps {
  reviews: ReviewLocation[];
  onReviewClick?: (id: string) => void;
  className?: string;
}

const buildPopupHtml = (review: ReviewLocation) => {
  const stars = Array.from({ length: 5 })
    .map((_, i) => {
      const filled = i < review.rating;
      const color = filled ? "#f59e0b" : "#e5e7eb";
      return `<span style="font-size:12px; color:${color}">★</span>`;
    })
    .join("");

  const safeName = escapeHtml(review.name);
  const safeLocation = escapeHtml(review.location);

  const image = review.image
    ? `<img src="${escapeAttr(review.image)}" alt="${escapeAttr(review.name)}" style="width:100%;height:96px;object-fit:cover;border-top-left-radius:8px;border-top-right-radius:8px;margin:-12px -12px 8px -12px" />`
    : "";

  return `
    <div style="min-width:200px">
      ${image}
      <div style="font-weight:600;font-size:14px;line-height:1.2">${safeName}</div>
      <div style="font-size:12px;color:#6b7280;margin:2px 0 6px">${safeLocation}</div>
      <div style="display:flex;gap:2px">${stars}</div>
    </div>
  `;
};

function escapeHtml(input: string) {
  return input.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return c;
    }
  });
}

function escapeAttr(input: string) {
  // for attributes we can reuse escapeHtml
  return escapeHtml(input);
}

const MapView = ({ reviews, onReviewClick, className }: MapViewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const validReviews = useMemo(() => reviews.filter((r) => !!r.latitude && !!r.longitude), [reviews]);

  // Default center (Italy)
  const defaultCenter: L.LatLngExpression = [41.9028, 12.4964];

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView(defaultCenter, 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    markersLayerRef.current = markersLayer;

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    if (validReviews.length === 0) {
      map.setView(defaultCenter, 6);
      return;
    }

    const bounds = L.latLngBounds([]);

    validReviews.forEach((review) => {
      const marker = L.marker([review.latitude, review.longitude], {
        icon: createCustomIcon(review.type),
      });

      marker.bindPopup(buildPopupHtml(review), { closeButton: true });

      if (onReviewClick) {
        marker.on("click", () => onReviewClick(review.id));
      }

      marker.addTo(markersLayer);
      bounds.extend([review.latitude, review.longitude]);
    });

    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [validReviews, onReviewClick]);

  if (validReviews.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className ?? ""}`.trim()}>
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-body">Nessun locale con posizione sulla mappa</p>
          <p className="text-sm text-muted-foreground mt-1">Aggiungi le coordinate quando crei una recensione</p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className={`rounded-lg overflow-hidden ${className ?? ""}`.trim()} style={{ height: "100%" }} />;
};

export default MapView;
