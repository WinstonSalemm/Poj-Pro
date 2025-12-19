"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { LatLngExpression } from "leaflet";
import Link from "next/link";

// Fix for TypeScript errors with react-leaflet
declare module 'react-leaflet' {
  export interface MapContainerProps {
    center: LatLngExpression;
    zoom: number;
    scrollWheelZoom?: boolean;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }

  export interface TileLayerProps {
    url: string;
    attribution?: string;
    subdomains?: string[];
  }

  export interface MarkerProps {
    position: LatLngExpression;
    icon?: L.Icon;
    children?: React.ReactNode;
  }
}

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

export default function MapSection() {
  const position: [number, number] = [41.283649516947264, 69.23021076924117];

  return (
    <div className="w-full max-w-[1200px] h-[400px] rounded-xl overflow-hidden shadow-xl border-2 border-[#660000] mx-auto my-8">
      <MapContainer
        center={position}
        zoom={16}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains={["a", "b", "c"]}
        />
        <Marker position={position} icon={customIcon}>
          <Link href="https://www.google.com/maps/place/POj+PRO+(%D0%BC%D0%B0%D0%B3%D0%B0%D0%B7%D0%B8%D0%BD+BOLID)/@41.2837093,69.2304518,19z/data=!4m6!3m5!1s0x38ae8b654ce3be15:0x764ece0d6201569b!8m2!3d41.283467!4d69.2303922!16s%2Fg%2F11xn1gh5vq?entry=ttu&g_ep=EgoyMDI1MDgxMy4wIKXMDSoASAFQAw%3D%3D">
            <Popup>
              <Link href="https://www.google.com/maps/place/POj+PRO+(%D0%BC%D0%B0%D0%B3%D0%B0%D0%B7%D0%B8%D0%BD+BOLID)/@41.2837093,69.2304518,19z/data=!4m6!3m5!1s0x38ae8b654ce3be15:0x764ece0d6201569b!8m2!3d41.283467!4d69.2303922!16s%2Fg%2F11xn1gh5vq?entry=ttu&g_ep=EgoyMDI1MDgxMy4wIKXMDSoASAFQAw%3D%3D" className="underline text-blue-600">
                <div className="text-[#660000] font-semibold">POJ PRO — наш офис</div>
              </Link>
            </Popup>
          </Link>
        </Marker>
      </MapContainer>
    </div>
  );
}
