import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
  height: '500px',
  width: '100%',
};

const center = {
  lat: 0,
  lng: 0,
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedMarker, setSelectedMarker] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'YOUR_AIRTABLE_API_ENDPOINT', // Replace with your Airtable API endpoint
          {
            headers: {
              Authorization: 'Bearer YOUR_AIRTABLE_API_KEY', // Replace with your Airtable API key
            },
          }
        );

        const data = response.data.records;
        setOrganizations(data);

        // Extract distinct values for Categories and Regions
        const uniqueCategories = [...new Set(data.map((org) => org.fields.Categories))];
        const uniqueRegions = [...new Set(data.map((org) => org.fields.Region))];

        setCategories(uniqueCategories);
        setRegions(uniqueRegions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const filteredOrganizations = organizations.filter(
    (org) =>
      (!selectedCategory || org.fields.Categories === selectedCategory) &&
      (!selectedRegion || org.fields.Region === selectedRegion)
  );

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <div>
            <label>Filter by Category:</label>
            <select onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">All</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Filter by Region:</label>
            <select onChange={(e) => setSelectedRegion(e.target.value)}>
              <option value="">All</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
          <button onClick={() => window.location.reload()}>Refresh</button>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={2}
            center={center}
          >
            {filteredOrganizations.map((org) => (
              <Marker
                key={org.id}
                position={{
                  lat: org.fields.Latitude,
                  lng: org.fields.Longitude,
                }}
                onClick={() => setSelectedMarker(org)}
              />
            ))}
            {selectedMarker && (
              <InfoWindow
                position={{
                  lat: selectedMarker.fields.Latitude,
                  lng: selectedMarker.fields.Longitude,
                }}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div>
                  <strong>{selectedMarker.fields.Name}</strong>
                  <p>Website: {selectedMarker.fields.Website}</p>
                  <p>Phone: {selectedMarker.fields.Phone}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      )}
    </div>
  );
};

export default App;
