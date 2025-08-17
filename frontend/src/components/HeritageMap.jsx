import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue in Leaflet with Webpack
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const heritageSites = [
  {
    name: 'Takht-i-Bahi & Sehr-i-Bahlol',
    coords: [34.3242, 71.9341],
    image: '/images/heritage/takht-i-bahi.jpeg',
    description: 'Buddhist monastic complex, Khyber Pakhtunkhwa',
  },
  {
    name: 'Taxila Buddhist Ruins of Gandhara',
    coords: [33.7370, 72.8225],
    image: '/images/heritage/taxila.jpeg',
    description: 'Ancient Buddhist city, Punjab',
  },
  {
    name: 'Rohtas Fort',
    coords: [32.9656, 73.5742],
    image: '/images/heritage/rohtas-fort.jpeg',
    description: '16th-century fortress, Punjab',
  },
  {
    name: 'Shalimar Garden',
    coords: [31.5889, 74.3732],
    image: '/images/heritage/shalimar-garden.jpeg',
    description: 'Mughal garden, Lahore',
  },
  {
    name: 'Thatta Necropolis (Makli)',
    coords: [24.7471, 67.9235],
    image: '/images/heritage/thatta-makli.jpeg',
    description: 'Vast necropolis, Sindh',
  },
  {
    name: 'Mohenjo-Daro',
    coords: [27.3294, 68.1386],
    image: '/images/heritage/mohenjo-daro.jpeg',
    description: 'Indus Valley city, Sindh',
  },
];

const HeritageMap = () => (
  <div style={{ width: '100%', height: '400px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', margin: '48px 0' }}>
    <MapContainer center={[30.3753, 69.3451]} zoom={5.2} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {heritageSites.map(site => (
        <Marker key={site.name} position={site.coords}>
          <Popup>
            <div style={{ maxWidth: 200 }}>
              <img src={site.image} alt={site.name} style={{ width: '100%', borderRadius: 8, marginBottom: 8 }} />
              <strong>{site.name}</strong>
              <div className="text-xs text-gray-600">{site.description}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  </div>
);

export default HeritageMap;
