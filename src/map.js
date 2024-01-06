import React from 'react'
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useEffect, useState } from 'react';

const containerStyle = {
  width: '1000px',
  height: '700px',
  margin: 'auto'
};

const center = { lng: -4.2583, lat: 55.8617 }
const mapOptions = {
  disableDefaultUI: true, // Disables default controls
  zoomControl: true, // Enable zoom control (you can set it to false if you don't want it)
  clickableIcons: false
};


const miniLabel = (text) => {
  return <span style={{fontWeight:'bold'}}>{text}</span>
}

function getPositionObject(organization) {

  // Local Authority Coverage

  const lat = (organization.fields['Latitude']);
  const lng = (organization.fields['Longitude']);
  console.log(lat,lng)
  if (!lat || !lng) return { lat: 56.0704, lng: -4.0324 }
    // return null
    

  return { lat: parseFloat(organization.fields['Latitude']), lng: parseFloat(organization.fields['Longitude']) }
}
function popCoverage(organization) {
    // Local Authority Coverage

    let cov = (organization.fields['Local Authority Coverage']);
  
    if (!cov || !cov.length > 0) {
      return null
    }
    // const str = cov.join(',')
    // if (str[str.length-1] === ',') str[str.length-1] = ' '
    // return <div><p>{miniLabel('Local Authority Coverage')}:</p><p>{str}</p></div>

    cov = cov.map(c => {
      return <div style={pillcss}>{c}</div>
    })
    return <p>{miniLabel('Coverage')}: {cov}</p>  

}
// {selectedMarker.fields['Local Authority Coverage'] ? <p>Description: {selectedMarker.fields['Local Authority Coverage']}</p> : null}
let pillcss = {display: 'inline-block', backgroundColor: '#ccc', marginRight: '3px', borderRadius: '3px', padding: '3px'}
function populateCategories(organization) {
  console.log("info window catws", organization)
  let cat = organization.fields['Category']
  if (!cat || !cat.length > 0) {
    return null
  }
  // const catString = cat.join(',')
  // if (catString[catString.length-1] === ',') catString[catString.length-1] = ' '
  // return <p>{miniLabel('Categories')}: {catString}</p>

  cat = cat.map(c => {
    return <div style={pillcss}>{c}</div>
  })
  return <p>{miniLabel('Categories')}: {cat}</p>

}

function MyComponent() {

  const [organizations, setOrganizations] = useState(false);

  useEffect(() => {
    console.log("use Effect fetch data")
    const fetchData = async () => {
      try {
        // Replace 'YOUR_API_KEY' and 'YOUR_BASE_ID' with your actual API key and base ID
        const apiKey = 'pathFYebbbBFwFFLW.e95e14e710b2ba1a771af0377133742b41250bfc19b995e4bd6ef5ef9b3dcde2';
        const baseId = 'appIZtb4LeuIWQkC0';
        const tableName = 'tbl6qIUUbFTsVjrws';

        // Construct the Airtable API URL
        const apiUrl = `https://api.airtable.com/v0/${baseId}/${tableName}`;

        // Fetch data from Airtable
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        });

        // Parse the response
        const data = await response.json();

        // Update the state with the fetched data
        // setOrganizations(data.records);
        setOrganizations(data.records);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Call the fetchData function when the component mounts
    fetchData();
  }, []); // Empty dependency array ensures the effect runs only once on mount

  
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyCROZ2pF5s_lLrSii16JK_j8uByi7oiLPI"
    // googleMapsApiKey: "AIzaSyBUFWLZWXk3nkoheDNkc8pFQtKt1NEjUQw"

  })
  // const apiKey='AIzaSyBnpmjpM-';

  const [map, setMap] = useState(null)

  const onLoad = React.useCallback(function callback(map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);

    setMap(map)
  }, [])

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null)
  }, [])

  const mapStyles = {
    height: '400px',
    width: '100%',
  };

  // State to manage the currently selected marker and its info window
  const [selectedMarker, setSelectedMarker] = React.useState(null);

  // Function to handle marker click
  const handleMarkerClick = (organization) => {
    console.log("selected org", organization)
    setSelectedMarker(organization);
  };

  // Function to close the info window
  const closeInfoWindow = () => {
    setSelectedMarker(null);
  };
  const customMarkerOptions = {
    // You can customize the color and other properties of the marker icon
    path: 'M256 0C132.289 0 32 100.288 32 224c0 172.8 224 480 224 480s224-307.2 224-480C480 100.288 379.712 0 256 0zM256 320c-35.296 0-64-28.704-64-64s28.704-64 64-64s64 28.704 64 64S291.296 320 256 320z',
    fillColor: 'blue',
    fillOpacity: 0.8,
    scale: 0.05,
    strokeColor: 'white',
    strokeWeight: 1,
    // anchor: new window.google.maps.Point(128, 256),
  };
  const drawMarkers = (organizations) => {
    let markers = [];
    console.log("organizations found", organizations.length)
    for (let i = 0; i < organizations.length; i++) {
      const organization = organizations[i]
      const position = getPositionObject(organization)
      console.log(i, position)
      if (position !== null) {
      markers.push(<MarkerF
      // onclick
        key={organization.id}
        // lat: -3.745,
        // lng: -38.523
        position={position}
        onClick={() => handleMarkerClick(organization)}
        // icon={customMarkerOptions}
      />)
      }
    }
    return markers
  }

  return organizations && isLoaded ? (

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        options={mapOptions}
        // onLoad={onLoad}
        // onUnmount={onUnmount}
        zoom={12}

      >

        {drawMarkers(organizations)}
        
        
        {selectedMarker && (
          <InfoWindowF
          options={{ pixelOffset: new window.google.maps.Size(0, -40) }}
          position={getPositionObject(selectedMarker)}
            onCloseClick={closeInfoWindow}
          >
            <div style={{maxWidth: '250px'}}>
              {selectedMarker.fields['Name'] ? <h2>{selectedMarker.fields['Name']}</h2> : null}
              
              <div style={{'fontSize': '11px'}}>
              
              {selectedMarker.fields['Phone'] ? <p>{miniLabel('Phone')}: {selectedMarker.fields['Phone']}</p> : null}
              
              {selectedMarker.fields['Email'] ? <p>{miniLabel('Email')}: {selectedMarker.fields['Email']}</p> : null}
              
              { populateCategories(selectedMarker) }
              
              { popCoverage(selectedMarker) }
              {selectedMarker.fields['Description'] ? <p>{miniLabel('Description')}: {selectedMarker.fields['Description']}</p> : null}

              </div>
              {/*  */}
            </div>
          </InfoWindowF>
        )} 

      </GoogleMap>
  ) : <>Loading maps...</>
}

export default MyComponent
