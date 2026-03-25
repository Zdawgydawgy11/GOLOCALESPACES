'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import Image from 'next/image';

// Fix default icon issue in Next.js
function fixLeafletIcons() {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

function createPriceIcon(price: number, selected: boolean) {
  return L.divIcon({
    html: `<div style="
      background: ${selected ? '#e11d48' : '#111827'};
      color: white;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: 2px solid white;
      cursor: pointer;
      transition: transform 0.1s;
      transform: ${selected ? 'scale(1.1)' : 'scale(1)'};
    ">$${price}/day</div>`,
    className: '',
    iconAnchor: [40, 20],
    popupAnchor: [0, -20],
  });
}

interface MapListing {
  id: string;
  title: string;
  lat: number;
  lng: number;
  price_per_day: number;
  images?: { image_url: string }[];
  city?: string;
  state?: string;
}

interface MapViewProps {
  listings: MapListing[];
  selectedId?: string | null;
  onMarkerClick?: (id: string) => void;
}

function MapController({ listings }: { listings: MapListing[] }) {
  const map = useMap();
  useEffect(() => {
    if (listings.length > 0) {
      const valid = listings.filter((l) => l.lat && l.lng);
      if (valid.length === 1) {
        map.setView([valid[0].lat, valid[0].lng], 12);
      } else if (valid.length > 1) {
        const bounds = L.latLngBounds(valid.map((l) => [l.lat, l.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  }, [listings, map]);
  return null;
}

export default function MapView({ listings, selectedId, onMarkerClick }: MapViewProps) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const validListings = listings.filter((l) => l.lat && l.lng);
  const center: [number, number] =
    validListings.length > 0
      ? [validListings[0].lat, validListings[0].lng]
      : [39.5, -98.35];

  return (
    <MapContainer
      center={center}
      zoom={validListings.length === 1 ? 12 : 4}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController listings={validListings} />
      {validListings.map((listing) => (
        <Marker
          key={listing.id}
          position={[listing.lat, listing.lng]}
          icon={createPriceIcon(listing.price_per_day, selectedId === listing.id)}
          eventHandlers={{
            click: () => onMarkerClick?.(listing.id),
          }}
        >
          <Popup maxWidth={220}>
            <Link href={`/spaces/${listing.id}`} className="block hover:opacity-90 transition-opacity">
              {listing.images?.[0]?.image_url && (
                <img
                  src={listing.images[0].image_url}
                  alt={listing.title}
                  className="w-full h-28 object-cover rounded-lg mb-2"
                />
              )}
              <p className="font-semibold text-gray-900 text-sm leading-tight">{listing.title}</p>
              {(listing.city || listing.state) && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {listing.city}{listing.city && listing.state ? ', ' : ''}{listing.state}
                </p>
              )}
              <p className="text-sm font-bold text-rose-600 mt-1">${listing.price_per_day}/day</p>
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
