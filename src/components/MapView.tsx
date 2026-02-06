import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Star, MapPin } from "lucide-react";

// Fix for default marker icons in React-Leaflet
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

// Component to fit bounds when reviews change
const FitBounds = ({ reviews }: { reviews: ReviewLocation[] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (reviews.length > 0) {
      const bounds = L.latLngBounds(
        reviews.map((r) => [r.latitude, r.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [reviews, map]);
  
  return null;
};

const MapView = ({ reviews, onReviewClick, className }: MapViewProps) => {
  const validReviews = reviews.filter((r) => r.latitude && r.longitude);
  
  // Default center (Italy)
  const defaultCenter: [number, number] = [41.9028, 12.4964];
  const center = validReviews.length > 0 
    ? [validReviews[0].latitude, validReviews[0].longitude] as [number, number]
    : defaultCenter;

  if (validReviews.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-body">
            Nessun locale con posizione sulla mappa
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Aggiungi le coordinate quando crei una recensione
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds reviews={validReviews} />
        
        {validReviews.map((review) => (
          <Marker
            key={review.id}
            position={[review.latitude, review.longitude]}
            icon={createCustomIcon(review.type)}
            eventHandlers={{
              click: () => onReviewClick?.(review.id),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                {review.image && (
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-full h-24 object-cover rounded-t -mt-3 -mx-3 mb-2"
                    style={{ width: "calc(100% + 24px)" }}
                  />
                )}
                <h3 className="font-semibold text-sm">{review.name}</h3>
                <p className="text-xs text-gray-500 mb-1">{review.location}</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < review.rating
                          ? "fill-amber-500 text-amber-500"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
