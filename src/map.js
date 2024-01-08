import React from 'react'
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import Select from 'react-select';


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
  //console.log(lat,lng)
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

let pillcss = {display: 'inline-block', backgroundColor: '#ccc', marginRight: '3px', borderRadius: '3px', padding: '3px'}

function populateCategories(organization) {
  //console.log("info window catws", organization)
  let cat = organization.fields['Category']
  if (!cat || !cat.length > 0) {
    return null
  }

  cat = cat.map(c => {
    return <div style={pillcss}>{c}</div>
  })
  return <p>{miniLabel('Categories')}: {cat}</p>

}

function MyComponent() {
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedCov, setSelectedCov] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [allCoverages, setAllCoverages] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [allOrganizations, setAllOrganizations] = useState([])
  useEffect(() => {
    //console.log("use Effect fetch data")
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
        const companies = data.records;
        // Update the state with the fetched data
        // setOrganizations(data.records);
        setAllOrganizations(companies);
        let allCats = {}
        let allCovs = {}
        for (let i = 0; i < companies.length; i++) {
          const details = companies[i].fields
          if (details.Category && details.Category.length > 0) {
            details.Category.map(cat => {allCats[cat] = 1; return null;})
          }
          let companyCoverages =details['Local Authority Coverage'];
          if (companyCoverages && companyCoverages.length > 0) {
            companyCoverages.map(cov => {allCovs[cov] = 1; return null;})
          }
        }
        allCats = Object.keys(allCats).map(t => {return { value: t, label: t }})
        allCovs = Object.keys(allCovs).map(t => {return { value: t, label: t }})
        console.log('allCats***',allCats, 'allCovs*****',allCovs)
        setAllCategories(allCats)
        setAllCoverages(allCovs)

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

  // const onLoad = React.useCallback(function callback(map) {
  //   // This is just an example of getting and using the map instance!!! don't just blindly copy!
  //   const bounds = new window.google.maps.LatLngBounds(center);
  //   map.fitBounds(bounds);

  //   setMap(map)
  // }, [])

  // const onUnmount = React.useCallback(function callback(map) {
  //   setMap(null)
  // }, [])

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

  const drawMarkers = (organizations) => {
    let markers = [];
    //console.log("organizations found", organizations.length)
    for (let i = 0; i < organizations.length; i++) {
      const organization = organizations[i]
      const position = getPositionObject(organization)
      //console.log(i, position)
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
  
  useEffect((newValue) => {
    console.log("new selected value", selectedCat, selectedCov)
  }, [selectedCat, selectedCov ])
  
  const onApplyHandler = () => {
    let filterOrgs = JSON.parse(JSON.stringify(allOrganizations));
    
    // if (selectedCat) {
    //   filterOrgs = filterOrgs.filter(o => {
    //     if (!o.fields.Category || o.fields.Category.length === 0) { return false }
    //     return o.fields.Category.includes[selectedCat.value]
    //   })
    // }
    if (selectedCat) {
      console.log("selected Cov:", selectedCat.value,)
      console.log("filterOrgs.length,", filterOrgs.length)
      filterOrgs = filterOrgs.filter(o => {
        // console.log("")
        let cats = o.fields['Category']
        console.log("cats on org:",cats)
        if (!cats) { return false }
        return cats.find(t => selectedCat.value === t)
      })
      console.log("filterOrgs.length after filter", filterOrgs.length)
    }
    if (selectedCov) {
      console.log("selected Cov:", selectedCov.value,)
      console.log("filterOrgs.length,", filterOrgs.length)
      filterOrgs = filterOrgs.filter(o => {
        // console.log("")
        let covs = o.fields['Local Authority Coverage']
        console.log("convs on org:",covs)
        if (!covs) { return false }
        return covs.find(v => selectedCov.value === v)
      })
      console.log("filterOrgs.length after filter", filterOrgs.length)
    }
    setOrganizations(filterOrgs)
  }
 const buttonStyle = {padding: '10px',
 float: 'right',
 borderRadius: '1px',
 fontColor: 'white',
 backgroundColor: '#003369',
 color: 'white',
 fontWeight: 'bold'
} 
  return isLoaded ? (<div style={containerStyle}>
    <div >
      <div style={{display:'inline-block', width: '420px'}}>
    <Select
      styles={{
        menu: (baseStyles, state) => ({
          ...baseStyles,
          marginTop: '0px'
        }),
        
        control: (baseStyles, state) => ({
          ...baseStyles,
          width: '420px',
          marginRight: '10px',
        }),
      }}
    
        defaultValue={selectedCat}
        isClearable={true}
        onChange={setSelectedCat}
        options={allCategories}
      />
      </div>
      <div style={{display:'inline-block', width: '420px'}}>
    <Select
          styles={{
            menu: (baseStyles, state) => ({
              ...baseStyles,
              marginTop: '0px'
            }),
            control: (baseStyles, state) => ({
              ...baseStyles,
              width: '420px',
              marginRight: '10px'
            }),
          }}
    
        defaultValue={selectedCov}
        isClearable={true}
        onChange={setSelectedCov}
        options={allCoverages}
      />
</div>
<button onClick={onApplyHandler} style={buttonStyle}>Apply</button>
    </div>
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

      </GoogleMap></div>
  ) : <>Loading maps...</>
}

export default MyComponent
