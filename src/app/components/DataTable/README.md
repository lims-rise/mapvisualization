# DataTable Component

## Usage with Map Navigation

```jsx
import DataTable from './components/DataTable/DataTable';
import { useRouter } from 'next/navigation';

function MyPage() {
  const router = useRouter();
  
  const handleNavigateToMap = (locationData) => {
    console.log('Navigate to map with data:', locationData);
    
    // Option 1: Navigate to map page with coordinates
    if (locationData.lat && locationData.lng) {
      router.push(`/map?lat=${locationData.lat}&lng=${locationData.lng}&org=${encodeURIComponent(locationData.organisation)}`);
    } else {
      // Option 2: Navigate to map page and let map component handle missing coordinates
      router.push(`/map?org=${encodeURIComponent(locationData.organisation)}&id=${locationData.id}`);
    }
    
    // Option 3: If using same page with map component
    // setMapCenter({ lat: locationData.lat || defaultLat, lng: locationData.lng || defaultLng });
    // setSelectedLocation(locationData);
    // setActiveTab('map'); // switch to map tab
  };

  return (
    <DataTable 
      data={yourData} 
      loading={loading}
      onNavigateToMap={handleNavigateToMap}
    />
  );
}
```

## Data Structure

Your data can work with or without coordinates:

```javascript
const sampleData = [
  {
    organisation_id: 1,
    organisation: "Sample Org",
    state: "active",
    tier: 1,
    organisation_type: "Type A",
    address: "123 Main St",
    comments: "Sample comment",
    latitude: -6.2088,    // Optional - if available
    longitude: 106.8456,  // Optional - if available
  }
];
```

## Features

- ✅ Click the map icon in each row to navigate to location
- ✅ Works with or without coordinates
- ✅ Passes complete row data to parent
- ✅ Customizable navigation callback
- ✅ Beautiful map icon with hover effects
- ✅ No more annoying alerts!
