"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback, memo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, Polyline } from "react-leaflet";
import styled from 'styled-components';
import NetworkGraph from "../NetworkGraph/NetworkGraph";
import DataTable from "../DataTable/DataTable";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Create custom marker icons
const createMarkerIcon = (isSelected = false) => {
  const iconUrl = isSelected 
    ? 'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle cx="16" cy="16" r="12" fill="#ff4757" stroke="#fff" stroke-width="3" filter="url(#glow)"/>
          <circle cx="16" cy="16" r="6" fill="#fff"/>
          <circle cx="16" cy="16" r="3" fill="#ff4757"/>
        </svg>
      `)
    : 'data:image/svg+xml;base64,' + btoa(`
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#0FB3BA" stroke="#fff" stroke-width="2"/>
          <circle cx="12" cy="12" r="4" fill="#fff"/>
        </svg>
      `);

  return new L.Icon({
    iconUrl: iconUrl,
    iconSize: isSelected ? [32, 32] : [24, 24],
    iconAnchor: isSelected ? [16, 16] : [12, 12],
    popupAnchor: [0, isSelected ? -16 : -12],
  });
};

// Component untuk auto-open popup hanya untuk organisasi yang dipilih
const AutoOpenPopup = ({ selectedOrganisation, onPopupOpened }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedOrganisation) {
      // Tunggu sebentar lalu cari marker yang sesuai dengan organisasi yang dipilih
      const timer = setTimeout(() => {
        map.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            // Cek apakah ini marker yang sesuai dengan organisasi yang dipilih
            const markerPos = layer.getLatLng();
            
            // Parse koordinat organisasi yang dipilih
            const rawLat = selectedOrganisation.lat;
            const rawLng = selectedOrganisation.lng;
            const cleanLat = typeof rawLat === 'string' ? rawLat.replace(',', '.') : rawLat;
            const cleanLng = typeof rawLng === 'string' ? rawLng.replace(',', '.') : rawLng;
            const lat = typeof cleanLat === 'string' ? parseFloat(cleanLat) : Number(cleanLat);
            const lng = typeof cleanLng === 'string' ? parseFloat(cleanLng) : Number(cleanLng);
            
            // Bandingkan koordinat dengan toleransi kecil untuk floating point
            const tolerance = 0.000001;
            if (Math.abs(markerPos.lat - lat) < tolerance && Math.abs(markerPos.lng - lng) < tolerance) {
              layer.openPopup();
              onPopupOpened(); // Reset state setelah popup dibuka
              return false; // Stop setelah menemukan marker yang tepat
            }
          }
        });
      }, 10);

      return () => clearTimeout(timer);
    }
  }, [map, selectedOrganisation, onPopupOpened]);

  return null;
};

// Helper component untuk mendeteksi perubahan zoom
const MapZoomListener = ({ onZoomChange }) => {
  const map = useMap();
  
  useEffect(() => {
    const handleZoom = () => {
      onZoomChange(map.getZoom());
    };
    
    map.on('zoomend', handleZoom);
    // Set initial zoom
    onZoomChange(map.getZoom());
    
    return () => {
      map.off('zoomend', handleZoom);
    };
  }, [map, onZoomChange]);
  
  return null;
};

// Styling untuk overlay blur
const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.4); /* Latar belakang putih transparan */
  backdrop-filter: blur(5px); /* Efek blur */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Menempatkan overlay di atas semua elemen lain */
`;

const Spinner = styled.div`
  border: 4px solid #f3f3f3; /* Warna latar belakang spinner */
  border-top: 4px solid #0FB3BA; /* Warna spinner */
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 2s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  margin-top: 15px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
`;


const MainMap = ({ selectedCountry, selectedSettlement, selectedMenu, selectedStates = [], selectedTiers = [], selectedTypes = [] }) => {
    const [data, setData] = useState([]);
    const [center, setCenter] = useState([-5.7535389, 157.0943453]);
    const [zoom, setZoom] = useState(4); // default zoom level
    const mapRef = useRef(null); // Reference to the map
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState("Initializing...");
    const [dataReady, setDataReady] = useState(false);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [currentView, setCurrentView] = useState('table'); // 'table' atau 'map'
    const [selectedOrganisation, setSelectedOrganisation] = useState(null); // Track selected organisation from table
    const [shouldOpenPopup, setShouldOpenPopup] = useState(false); // State untuk kontrol popup
    
    // States untuk network connections
    const [showConnections, setShowConnections] = useState(false); // Toggle untuk menampilkan garis koneksi
    const [mapZoom, setMapZoom] = useState(4); // Track zoom level saat ini
    const CONNECTION_MIN_ZOOM = 4; // Zoom minimum untuk menampilkan garis koneksi
    
    // States untuk interactive highlighting
    const [clickedMarkerId, setClickedMarkerId] = useState(null); // Track marker yang sedang di-click
    const [hoveredConnectionId, setHoveredConnectionId] = useState(null); // Track connection yang sedang di-hover
    const [clickedConnectionId, setClickedConnectionId] = useState(null); // Track connection yang sedang di-click

    // Reset currentView when selectedMenu changes
    useEffect(() => {
      if (selectedMenu?.menu === "DataTable") {
        setCurrentView('table'); // Default to table view when DataTable menu is selected
        setSelectedOrganisation(null); // Reset selected organisation when menu changes
        setShouldOpenPopup(false); // Reset popup state
      }
    }, [selectedMenu]);

    // Trigger popup opening when switching to map view dengan organisasi yang dipilih
    useEffect(() => {
      if (currentView === 'map' && selectedMenu?.menu === "DataTable" && selectedOrganisation) {
        setShouldOpenPopup(true);
      }
    }, [currentView, selectedMenu, selectedOrganisation]);

    useEffect(() => {
        console.log('datanya peta', selectedCountry)
        if (selectedCountry) {
            setCenter([selectedCountry?.lat, selectedCountry?.long]); // Set center based on selected country
            setZoom(selectedCountry?.zoom); // Set zoom based on selected country
        }
    }, [selectedCountry]); // Re-run when selectedCountry changes

    useEffect(() => {
      if (selectedSettlement) {
        setCenter([selectedSettlement?.lat, selectedSettlement?.long]); // Set center based on selected country
        setZoom(selectedSettlement?.zoom); // Set zoom based on selected country
      }
    }, [selectedSettlement]); // Re-run when selectedCountry changes


      // Update the map view with smooth animation when center or zoom changes using flyTo
    useEffect(() => {
      if (mapRef.current) {
        // Use flyTo for a smoother transition
        mapRef.current.flyTo(center, zoom, {
          animate: true,
          duration: 1.5, // Duration in seconds
        });
      }
    }, [center, zoom]); // Only run when center or zoom change

    // Menentukan endpoint berdasarkan selectedMenu.menu
    const buildQueryParams = (selectedMenu) => {
      const queryParams = new URLSearchParams();
    
      if (selectedMenu?.id_country) {
        queryParams.append("id_country", selectedMenu.id_country);
      }
    
      // Semua menu sekarang menggunakan lat/lng langsung, tidak perlu geom lagi
      // if (selectedMenu?.menu === "Map") {
      //   queryParams.append("includeGeom", "true"); // Tambahkan geom hanya untuk peta
      // }
    
      return queryParams;
    };
    
   
    const getEndpoint = (selectedMenu) => {
      switch (selectedMenu?.menu) {
        case "Map":
          return "./api/map";
        case "Network":
          return "./api/network";
        case "DataTable":
          return "./api/map"; // DataTable menggunakan lat/lng langsung tanpa geom
        default:
          return "./api/default";
      }
    };

    // Satu useEffect untuk semua data fetching
    useEffect(() => {
      setLoading(true);
      setDataReady(false); // Reset dataReady ketika menu berubah
      const controller = new AbortController();

      const fetchData = async () => {
        if (!selectedMenu) {
          console.log("No menu selected, skipping data fetch.");
          setLoadingMessage("No menu selected...");
          setLoading(false);
          return;
        }

        try {
          setLoadingMessage(`Fetching ${selectedMenu.menu} data...`);
          const url = getEndpoint(selectedMenu);
          const queryParams = buildQueryParams(selectedMenu);

          const res = await fetch(`${url}?${queryParams.toString()}`, { 
            signal: controller.signal 
          });
          
          if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

          setLoadingMessage("Processing data...");
          const responseData = await res.json();
          setData(responseData);

          // Jika menu adalah "Network", ubah data untuk vis.js
          if (selectedMenu.menu === "Network") {
            setLoadingMessage("Building network visualization...");
            const formattedNodes = responseData.map((item) => ({
              id: item.organisation_id,
              label: item.organisation,
              title: `${item.state} - ${item.organisation} - ${item.address} - ${item.comments && item.comments.trim() ? item.comments : '-'}`,
              iconUrl: `/icons/${item.icon || "building.png"}`,
            }));

            const formattedEdges = responseData.flatMap((item) =>
              item.connections.map((conn) => ({
                from: item.organisation_id,
                to: conn,
              }))
            );

            setNodes(formattedNodes);
            setEdges(formattedEdges);
            // Untuk Network, jangan langsung set dataReady, biarkan di useEffect terpisah
          } else {
            // Untuk Map, akan di-set di useMemo geoJsonFeatures
            setDataReady(false);
          }
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error("API fetch error:", error);
            setError(error);
            setLoadingMessage("Error loading data...");
          }
        } finally {
          // Loading akan di-handle oleh useEffect terpisah berdasarkan dataReady
        }
      };

      fetchData();
      return () => controller.abort();
    }, [selectedMenu]); // Hanya dependency selectedMenu

    // eslint-disable-next-line react-hooks/exhaustive-deps
    // GeoJSON functions - currently unused as we use direct lat/lng
    // const convertToGeoJSON = useCallback((item) => {
    //     try {
    //     const geoJsonData = JSON.parse(item.geom);
    //     if (geoJsonData.type === 'MultiPolygon') {
    //         geoJsonData.coordinates = geoJsonData.coordinates.map(polygon =>
    //         polygon.map(ring =>
    //             ring.map(coord => {
    //             const converted = proj4(selectedCountry.utmprojection, coord);
    //             return converted;
    //             })
    //         )
    //         );
    //     }
    //     return geoJsonData;
    //     } catch (error) {
    //     console.error('Error parsing GeoJSON:', error, item.geom);
    //     return null;
    //     }
    // }, [selectedCountry?.utmprojection]);

    // const calculateCentroid = (coordinates) => {
    //     if (!coordinates || coordinates.length === 0) return [0, 0];
    //     const allPoints = coordinates.flat(3);
    //     const length = allPoints.length / 2;

    //     if (length === 0) return [0, 0];

    //     let xSum = 0;
    //     let ySum = 0;

    //     for (let i = 0; i < allPoints.length; i += 2) {
    //     const lng = allPoints[i];
    //     const lat = allPoints[i + 1];
    //     xSum += lng;
    //     ySum += lat;
    //     }

    //     return [ySum / length, xSum / length];
    // };

    // const geoJsonFeatures = useMemo(() => {
    //   if (selectedMenu?.menu !== "Map" || !data.length) {
    //     return [];
    //   }

    //   setLoadingMessage("Rendering map features...");
      
    //   const features = data
    //     .map((item) => {
    //       if (item.geom) {
    //         const geoJsonData = convertToGeoJSON(item);
    //         if (!geoJsonData) return null;
            
    //         const centroid = calculateCentroid(geoJsonData.coordinates);
    //         return {
    //           geoJsonData,
    //           centroid,
    //           gid: item.organisation_id,
    //           state: item.state,
    //           tier: item.tier,
    //           organisati: item.organisation,
    //           organisa_1: item.organisation_type,
    //           address: item.address,
    //           comments: item.comments
    //         };
    //       }
    //       return null;
    //     })
    //     .filter(item => item !== null);

    //   // Set dataReady true ketika GeoJSON features sudah siap untuk Map
    //   if (features.length > 0 && !dataReady && selectedMenu?.menu === "Map") {
    //     setDataReady(true);
    //   }
      
    //   return features;
    // }, [data, convertToGeoJSON, selectedMenu?.menu, dataReady]);

    // useEffect untuk handle loading state berdasarkan dataReady
    useEffect(() => {
      if (dataReady && loading) {
        setLoading(false);
      }
    }, [dataReady, loading]);

    // useEffect khusus untuk Network - set dataReady ketika nodes dan edges sudah siap
    useEffect(() => {
      if (selectedMenu?.menu === "Network" && nodes.length > 0 && edges.length >= 0 && !dataReady) {
        setLoadingMessage("Finalizing network visualization...");
        // Tambahkan sedikit delay untuk memastikan NetworkGraph benar-benar ready
        setTimeout(() => {
          setDataReady(true);
        }, 100);
      }
    }, [selectedMenu?.menu, nodes, edges, dataReady]);

    // useEffect khusus untuk Map - set dataReady ketika data sudah siap
    useEffect(() => {
      if (selectedMenu?.menu === "Map" && data.length > 0 && !dataReady) {
        setLoadingMessage("Preparing map markers...");
        // Map menggunakan lat/lng langsung, tidak perlu processing geom
        setTimeout(() => {
          setDataReady(true);
        }, 50);
      }
    }, [selectedMenu?.menu, data, dataReady]);

    // useEffect khusus untuk DataTable - set dataReady ketika data sudah siap
    useEffect(() => {
      if (selectedMenu?.menu === "DataTable" && data.length > 0 && !dataReady) {
        setLoadingMessage("Preparing data table...");
        // DataTable langsung ready karena tidak ada processing khusus
        setTimeout(() => {
          setDataReady(true);
        }, 50);
      }
    }, [selectedMenu?.menu, data, dataReady]);

    // Fungsi untuk navigate ke map dari DataTable
    const handleNavigateToMap = useCallback((locationData) => {
      console.log('Navigating to location:', locationData);
      
      // Cek apakah koordinat valid dengan proper decimal parsing
      const rawLat = locationData.lat;
      const rawLng = locationData.lng;
      
      // Handle comma decimal separator (convert to period)
      const cleanLat = typeof rawLat === 'string' ? rawLat.replace(',', '.') : rawLat;
      const cleanLng = typeof rawLng === 'string' ? rawLng.replace(',', '.') : rawLng;
      
      const lat = typeof cleanLat === 'string' ? parseFloat(cleanLat) : Number(cleanLat);
      const lng = typeof cleanLng === 'string' ? parseFloat(cleanLng) : Number(cleanLng);
      
      console.log('Navigation coordinate parsing:', {
        rawLat,
        rawLng,
        cleanLat,
        cleanLng,
        lat,
        lng,
        latType: typeof rawLat,
        lngType: typeof rawLng
      });
      
      if (!isNaN(lat) && !isNaN(lng)) {
        // Set center ke koordinat yang dipilih dengan zoom yang sesuai
        const targetZoom = (lat === 0 && lng === 0) ? 4 : 18; // Zoom lebih dekat untuk focus yang lebih baik
        
        setCenter([lat, lng]);
        setZoom(targetZoom);
        
        // Set selected organisation untuk membuka popup yang tepat
        setSelectedOrganisation(locationData);
        
        // Pindah ke view Map
        setCurrentView('map');
        
        // Log informasi untuk debugging
        console.log(`📍 Navigating to ${locationData.organisation}`);
        console.log(`📌 Coordinates: ${lat}, ${lng}`);
        console.log(`🏢 Address: ${locationData.address || 'No address'}`);
        console.log(`🏛️ State: ${locationData.state || 'No state'}`);
        console.log(`🔍 Selected Organisation ID: ${locationData.id}`);
        
        // Berikan feedback visual yang lebih baik
        if (lat === 0 && lng === 0) {
          console.log('⚠️ Using default coordinates (0,0) - location data may be incomplete');
        }
      } else {
        console.log('Invalid coordinates for navigation');
        // Tetap beralih ke map view meskipun koordinat tidak valid
        setCurrentView('map');
        setCenter([0, 0]); // Default ke koordinat 0,0
        setZoom(4);
        
        console.log(`❌ No valid coordinates for ${locationData.organisation}, showing default map view`);
      }
    }, []);
    
    const filteredMapData = useMemo(() => {
      if (selectedMenu?.menu !== 'Map') return data;
      return data.filter(item => {
        const stateOk = selectedStates.length === 0 || (item.state && selectedStates.includes(item.state));
        const tierOk = selectedTiers.length === 0 || (item.tier !== null && item.tier !== undefined && selectedTiers.includes(String(item.tier)));
        const typeOk = selectedTypes.length === 0 || (item.organisation_type && selectedTypes.includes(item.organisation_type));
        return stateOk && tierOk && typeOk;
      });
    }, [data, selectedMenu, selectedStates, selectedTiers, selectedTypes]);

    // Memoize filtered and processed marker data untuk menghindari recalculation
    const processedMarkerData = useMemo(() => {
      return filteredMapData.map((item, index) => {
        const rawLat = item.latitude || item.lat;
        const rawLng = item.longitude || item.lng;
        
        const cleanLat = typeof rawLat === 'string' ? rawLat.replace(',', '.') : rawLat;
        const cleanLng = typeof rawLng === 'string' ? rawLng.replace(',', '.') : rawLng;
        
        const lat = typeof cleanLat === 'string' ? parseFloat(cleanLat) : Number(cleanLat);
        const lng = typeof cleanLng === 'string' ? parseFloat(cleanLng) : Number(cleanLng);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          return {
            ...item,
            lat,
            lng,
            index,
            isValid: true
          };
        }
        return {
          ...item,
          isValid: false
        };
      }).filter(item => item.isValid);
    }, [filteredMapData]);

    // Helper function untuk menentukan apakah connection harus di-highlight (improved with marker connection support)
    const getConnectionStyle = (line) => {
      const isHoveredConnection = hoveredConnectionId === line.connectionId;
      const isClickedConnection = clickedConnectionId === line.connectionId;
      
      // Check if this connection is related to clicked marker - with debugging
      const isConnectedToClickedMarker = clickedMarkerId && (
        line.sourceInfo.id === clickedMarkerId || line.targetInfo.id === clickedMarkerId ||
        String(line.sourceInfo.id) === String(clickedMarkerId) || String(line.targetInfo.id) === String(clickedMarkerId)
      );
      
      // Debug logging for connection highlighting (enable temporarily for debugging)
      if (clickedMarkerId && (line.sourceInfo.id === clickedMarkerId || line.targetInfo.id === clickedMarkerId)) {
        console.log('Connection match found:', {
          clickedMarkerId,
          sourceId: line.sourceInfo.id,
          targetId: line.targetInfo.id,
          sourceName: line.sourceInfo.name,
          targetName: line.targetInfo.name,
          isConnected: isConnectedToClickedMarker
        });
      }
      
      // Priority: clicked connection > connected to clicked marker > hover > normal
      if (isClickedConnection) {
        return {
          ...line,
          opacity: Math.min(line.opacity * 1.5, 1), // Much brighter when clicked
          weight: line.weight + 3, // Much thicker when clicked
          color: '#FF6B6B', // Bright red when clicked
        };
      } else if (isConnectedToClickedMarker) {
        return {
          ...line,
          opacity: Math.min(line.opacity * 1.4, 1), // Bright when connected to clicked marker
          weight: line.weight + 2, // Thick when connected to clicked marker
          color: '#FFA500', // Orange when connected to clicked marker
        };
      } else if (isHoveredConnection) {
        return {
          ...line,
          opacity: Math.min(line.opacity * 1.3, 1), // Slightly brighter on hover
          weight: line.weight + 1, // Slightly thicker on hover
        };
      }
      
      // All other connections stay normal
      return line;
    };

    const connectionLines = useMemo(() => {
      if (!showConnections || selectedMenu?.menu !== 'Map' || !filteredMapData.length) {
        return [];
      }

      // Build lookup map: organisation_id -> {lat, lng, state, tier}
      const locationMap = {};
      filteredMapData.forEach(item => {
        const rawLat = item.latitude || item.lat;
        const rawLng = item.longitude || item.lng;
        
        const cleanLat = typeof rawLat === 'string' ? rawLat.replace(',', '.') : rawLat;
        const cleanLng = typeof rawLng === 'string' ? rawLng.replace(',', '.') : rawLng;
        
        const lat = typeof cleanLat === 'string' ? parseFloat(cleanLat) : Number(cleanLat);
        const lng = typeof cleanLng === 'string' ? parseFloat(cleanLng) : Number(cleanLng);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          locationMap[item.organisation_id] = { 
            lat, 
            lng, 
            state: item.state, 
            tier: item.tier,
            organisation: item.organisation 
          };
        }
      });

      // Generate connection lines, hindari duplikasi
      const lines = [];
      const processedConnections = new Set();

      filteredMapData.forEach(item => {
        const source = locationMap[item.organisation_id];
        if (!source || !item.connections || !Array.isArray(item.connections)) return;

        item.connections.forEach(targetId => {
          const target = locationMap[targetId];
          if (!target || targetId === item.organisation_id) return; // Skip self-connection

          // Hindari duplikasi dengan membuat key unik
          const connectionKey = [item.organisation_id, targetId].sort().join('-');
          if (processedConnections.has(connectionKey)) return;
          processedConnections.add(connectionKey);

          // Tentukan style berdasarkan tier dan state - warna smooth dan lembut
          let lineColor = '#5DADE2'; // Soft blue default
          let lineWeight = 4; 
          let lineOpacity = 0.75; // Lebih lembut
          let dashArray = undefined;

          // Color berdasarkan state connection - warna smooth tapi terang
          if (source.state === target.state) {
            lineColor = '#58D68D'; // Soft emerald green untuk same state
            lineOpacity = 0.8; 
          } else {
            lineColor = '#F1948A'; // Soft coral pink untuk different state
            lineOpacity = 0.75; 
          }

          // Weight berdasarkan tier difference - tetap tebal untuk visibility
          if (source.tier && target.tier) {
            const tierDiff = Math.abs(Number(source.tier) - Number(target.tier));
            if (tierDiff === 0) {
              lineWeight = 5; // Same tier = thick line (sedikit kurangi untuk smooth look)
            } else if (tierDiff === 1) {
              lineWeight = 4; // Close tier = medium line 
            } else {
              lineWeight = 3; // Different tier = thin line
              dashArray = '6,3'; // Lebih halus dashes
            }
          }

          lines.push({
            positions: [[source.lat, source.lng], [target.lat, target.lng]],
            color: lineColor,
            weight: lineWeight,
            opacity: lineOpacity,
            dashArray: dashArray,
            sourceInfo: { id: item.organisation_id, name: source.organisation, state: source.state, tier: source.tier },
            targetInfo: { id: targetId, name: target.organisation, state: target.state, tier: target.tier },
            connectionId: connectionKey // Unique identifier untuk connection
          });
          
          // Debug logging untuk melihat data connection yang dibuat
          if (lines.length <= 3) { // Hanya log 3 connection pertama untuk debugging
            console.log('Connection created:', {
              sourceId: item.organisation_id,
              sourceName: source.organisation,
              targetId: targetId,
              targetName: target.organisation,
              connectionKey,
              sourceIdType: typeof item.organisation_id,
              targetIdType: typeof targetId
            });
          }
        });
      });

      // console.log(`Generated ${lines.length} connection lines for ${filteredMapData.length} organizations`); // Disabled for performance
      return lines;
    }, [showConnections, selectedMenu?.menu, filteredMapData]);

    // Helper function untuk menentukan apakah marker harus di-highlight (only when clicked)
    const getMarkerStyle = useCallback((organisationId) => {
      // Only highlight if this specific marker is clicked
      return clickedMarkerId === organisationId;
    }, [clickedMarkerId]);

    // Debounced click handler untuk menghindari multiple rapid clicks
    const handleMarkerClick = useCallback((organisationId) => {
      // Debug logging for marker click
      console.log('Marker clicked:', {
        organisationId,
        type: typeof organisationId,
        clickedMarkerId,
        willToggle: clickedMarkerId === organisationId ? 'deselect' : 'select'
      });
      
      // Toggle clicked state - if already clicked, unclick; otherwise set as clicked
      setClickedMarkerId(prev => prev === organisationId ? null : organisationId);
      // Don't reset connection selection when clicking marker - let both coexist
      // setClickedConnectionId(null);
    }, [clickedMarkerId]);

    // Handler untuk click pada connection line
    const handleConnectionClick = useCallback((connectionId) => {
      // Toggle clicked state untuk connection
      setClickedConnectionId(prev => prev === connectionId ? null : connectionId);
      // Reset marker selection when clicking connection
      setClickedMarkerId(null);
    }, []);

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
          {loading && (
        <Overlay>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Spinner />
            <LoadingText>
              {loadingMessage}
            </LoadingText>
          </div>
        </Overlay>
          )}
          {selectedMenu?.menu !== "Map" && selectedMenu?.menu !== "Network" && selectedMenu?.menu !== "DataTable" && (
            <MapContainer
              // center={[-5.1476, 119.4325]} // Koordinat Makassar
              ref={mapRef} // Attach the map reference
              center={center} // Initial center will be set by setView() if updated
              zoom={zoom} // Initial zoom will be set by setView() if updated
              scrollWheelZoom={true}
              style={{ height: '100vh' }}
              // onViewportChanged={handleViewportChange} // Menangani perubahan pada viewport
            >
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com">Esri</a> contributors'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
            </MapContainer>
          )}

          {selectedMenu?.menu === "Map" && (
            <div style={{ position: 'relative', height: '100vh' }}>
              {/* Control Panel untuk Network Connections */}
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                zIndex: 1000,
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '12px 16px',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(15, 179, 186, 0.2)',
                minWidth: '200px',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: '#0FB3BA',
                    cursor: 'pointer' 
                  }}>
                    <input
                      type="checkbox"
                      checked={showConnections}
                      onChange={(e) => setShowConnections(e.target.checked)}
                      style={{ 
                        accentColor: '#0FB3BA',
                        transform: 'scale(1.1)'
                      }}
                    />
                    🔗 Show Network Connections
                  </label>
                </div>
                
                {showConnections && (
                  <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.4' }}>
                    {mapZoom < CONNECTION_MIN_ZOOM ? (
                      <div style={{ 
                        color: '#ff9800', 
                        fontWeight: '500',
                        padding: '4px 8px',
                        backgroundColor: '#fff3e0',
                        borderRadius: '6px',
                        border: '1px solid #ffcc02'
                      }}>
                        ⚠️ Zoom in to level {CONNECTION_MIN_ZOOM}+ to view connections
                      </div>
                    ) : (
                      <div style={{ 
                        color: '#0FB3BA', 
                        fontWeight: '500',
                        padding: '4px 8px',
                        backgroundColor: '#f0f9ff',
                        borderRadius: '6px',
                        border: '1px solid #0FB3BA'
                      }}>
                        ✅ Showing {connectionLines.length} connection{connectionLines.length !== 1 ? 's' : ''}
                      </div>
                    )}
                    
                    <div style={{ marginTop: '6px', fontSize: '10px' }}>
                      <div style={{ color: '#58D68D', fontWeight: 'bold' }}>🟢 Same State (Soft Green)</div>
                      <div style={{ color: '#F1948A', fontWeight: 'bold' }}>🔴 Different State (Soft Coral)</div>
                      <div style={{ color: '#666' }}>━━━ Same Tier • ┅┅┅ Different Tier</div>
                      {clickedConnectionId && (
                        <div style={{ 
                          marginTop: '6px', 
                          padding: '4px 6px', 
                          backgroundColor: '#fff3e0', 
                          borderRadius: '4px',
                          border: '1px solid #ffcc02'
                        }}>
                          <div style={{ color: '#FF6B6B', fontWeight: 'bold', fontSize: '9px' }}>
                            🔗 Connection Selected
                          </div>
                          <div style={{ color: '#856404', fontSize: '8px' }}>
                            Click again to deselect
                          </div>
                        </div>
                      )}
                      {clickedMarkerId && (
                        <div style={{ 
                          marginTop: '6px', 
                          padding: '4px 6px', 
                          backgroundColor: '#fff3e0', 
                          borderRadius: '4px',
                          border: '1px solid #FFA500'
                        }}>
                          <div style={{ color: '#FFA500', fontWeight: 'bold', fontSize: '9px' }}>
                            📍 Marker Selected - Connected Lines Highlighted
                          </div>
                          <div style={{ color: '#856404', fontSize: '8px' }}>
                            Orange lines show connections
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <MapContainer
                ref={mapRef}
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ height: '100vh', borderRadius: '10px', overflow: 'hidden' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.esri.com">Esri</a> contributors'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={19}
                />

                {/* Zoom listener untuk update mapZoom state */}
                <MapZoomListener onZoomChange={setMapZoom} />

                {/* Connection Lines - render sebelum markers agar markers berada di atas */}
                {showConnections && mapZoom >= CONNECTION_MIN_ZOOM && connectionLines.map((line, index) => {
                  const styledLine = getConnectionStyle(line);
                  return (
                    <Polyline
                      key={`connection-${line.sourceInfo.id}-${line.targetInfo.id}-${index}`}
                      positions={styledLine.positions}
                      pathOptions={{
                        color: styledLine.color,
                        weight: styledLine.weight,
                        opacity: styledLine.opacity,
                        dashArray: styledLine.dashArray,
                        lineCap: 'round',
                        lineJoin: 'round'
                      }}
                      eventHandlers={{
                        mouseover: () => setHoveredConnectionId(line.connectionId),
                        mouseout: () => setHoveredConnectionId(null),
                        click: () => handleConnectionClick(line.connectionId)
                      }}
                    >
                      <Tooltip direction="center" permanent={false} sticky={true}>
                        <div style={{ fontSize: '11px', lineHeight: '1.3' }}>
                          <strong>🔗 Connection {clickedConnectionId === line.connectionId ? '(Selected)' : ''}</strong><br />
                          <span style={{ color: '#0FB3BA' }}>
                            {line.sourceInfo.name} (T{line.sourceInfo.tier})
                          </span><br />
                          <span style={{ color: '#666' }}>↕️</span><br />
                          <span style={{ color: '#0FB3BA' }}>
                            {line.targetInfo.name} (T{line.targetInfo.tier})
                          </span><br />
                          <small style={{ color: '#666' }}>
                            {line.sourceInfo.state === line.targetInfo.state ? 'Same State' : 'Cross-State'}
                          </small>
                          {clickedConnectionId === line.connectionId && (
                            <><br /><small style={{ color: '#FF6B6B', fontWeight: 'bold' }}>
                              🔴 Click to deselect
                            </small></>
                          )}
                          {clickedMarkerId && (line.sourceInfo.id === clickedMarkerId || line.targetInfo.id === clickedMarkerId) && (
                            <><br /><small style={{ color: '#FFA500', fontWeight: 'bold' }}>
                              🟠 Connected to selected marker
                            </small></>
                          )}
                        </div>
                      </Tooltip>
                    </Polyline>
                  );
                })}

                {/* Debug info - commented out for performance */}
                {/* {console.log(`Map Menu - Total data items: ${data.length} | Filtered: ${filteredMapData.length} | Connections: ${connectionLines.length}`)} */}
                {/* { (selectedStates.length || selectedTiers.length || selectedTypes.length) > 0 && console.log('Active Map Filters:', {selectedStates, selectedTiers, selectedTypes}) } */}
                
                {/* Render markers using pre-processed data for better performance */}
                {processedMarkerData.map((item) => {
                  const isHighlighted = getMarkerStyle(item.organisation_id);
                  
                  return (
                    <Marker
                      key={`map-marker-${item.organisation_id || item.index}`}
                      position={[item.lat, item.lng]}
                      icon={createMarkerIcon(isHighlighted)}
                      zIndexOffset={isHighlighted ? 1000 : 0}
                      eventHandlers={{
                        click: () => handleMarkerClick(item.organisation_id)
                      }}
                    >
                      <Popup
                        closeButton={true}
                        autoClose={false}
                        keepInView={true}
                        autoPan={true}
                      >
                        <div style={{ minWidth: '250px' }}>
                          <h3 style={{ 
                            margin: '0 0 15px 0', 
                            color: '#0FB3BA', 
                            fontSize: '18px', 
                            fontWeight: '700', 
                            borderBottom: '2px solid #0FB3BA', 
                            paddingBottom: '5px' 
                          }}>
                            🏢 {item.organisation || 'Unknown Organisation'}
                          </h3>
                          <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                            <p><strong>ID:</strong> {item.organisation_id || item.index}</p>
                            <p><strong>Tier:</strong> {item.tier || 'N/A'}</p>
                            <p><strong>Type:</strong> {item.organisation_type || 'N/A'}</p>
                            <p><strong>State:</strong> {item.state || 'N/A'}</p>
                            <p><strong>Address:</strong> {item.address || 'No address available'}</p>
                            {item.comments && item.comments.trim() && (
                              <p><strong>Comments:</strong> {item.comments}</p>
                            )}
                            <div style={{ 
                              marginTop: '12px', 
                              padding: '8px', 
                              backgroundColor: (item.lat === 0 && item.lng === 0 ? '#fff3cd' : '#f0f9ff'), 
                              borderRadius: '6px', 
                              border: `1px solid ${(item.lat === 0 && item.lng === 0 ? '#ffc107' : '#0FB3BA')}` 
                            }}>
                              <p style={{ margin: '0', fontSize: '12px', color: (item.lat === 0 && item.lng === 0 ? '#856404' : '#0369a1') }}>
                                <strong>📍 GPS Coordinates:</strong><br />
                                Lat: {item.lat.toFixed(6)}, Lng: {item.lng.toFixed(6)}
                                {item.lat === 0 && item.lng === 0 && (
                                  <><br /><span style={{ fontStyle: 'italic' }}>⚠️ Default coordinates - location may need verification</span></>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          )}

          {selectedMenu?.menu === "Network" && (
                <div style={{ height: "100vh", background: "#333", padding: "10px" }}>
                  {/* <h2 style={{ color: "white", textAlign: "center" }}>
                    Network Visualization
                  </h2> */}
                  <NetworkGraph nodes={nodes} edges={edges} />
                </div>
              )}

          {selectedMenu?.menu === "DataTable" && (
            <div className="h-screen relative">
              {/* Modern Toggle Buttons with Tailwind */}
              <div className="absolute top-5 right-5 z-[1000] flex gap-2">
                <button
                  onClick={() => setCurrentView('table')}
                  className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 shadow-lg border-2 ${
                    currentView === 'table' 
                      ? 'bg-cyan-400 text-white border-cyan-400 scale-105 shadow-cyan-400/30' 
                      : 'bg-white text-cyan-400 border-cyan-400 hover:bg-cyan-50 hover:scale-105'
                  }`}
                >
                  📊 Table View
                </button>
                <button
                  onClick={() => setCurrentView('map')}
                  className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 shadow-lg border-2 ${
                    currentView === 'map' 
                      ? 'bg-cyan-400 text-white border-cyan-400 scale-105 shadow-cyan-400/30' 
                      : 'bg-white text-cyan-400 border-cyan-400 hover:bg-cyan-50 hover:scale-105'
                  }`}
                >
                  �️ Map Preview
                </button>
              </div>

              {/* Content based on currentView */}
              {currentView === 'table' ? (
                <DataTable 
                  data={data} 
                  loading={loading} 
                  onNavigateToMap={handleNavigateToMap}
                  onDataChange={setData}
                  // selectedOrganisation={selectedOrganisation} // Pass selected organisation untuk highlighting
                />
              ) : (
                <>
                  {/* Fixed Map Preview Mode - Non-interactive */}
                  <div className="absolute top-5 left-5 z-[999] bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-cyan-200">
                    <p className="text-xs font-medium text-cyan-700">
                      📍 Preview Mode - Fixed Position
                    </p>
                    <p className="text-xs text-gray-600">
                      Use &quot;Map&quot; menu for interactive navigation
                    </p>
                  </div>
                  
                  <MapContainer
                    center={center}
                    zoom={zoom}
                    minZoom={zoom - 1} // Limit zoom out to current zoom - 1
                    maxZoom={zoom + 3} // Allow modest zoom in
                    scrollWheelZoom={false} // Disable scroll wheel zoom
                    doubleClickZoom={false} // Disable double click zoom
                    zoomControl={false} // Hide zoom controls
                    dragging={true} // Allow panning but limited
                    touchZoom={false} // Disable touch zoom
                    boxZoom={false} // Disable box zoom
                    keyboard={false} // Disable keyboard controls
                    className="h-screen w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.esri.com">Esri</a> contributors'
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      maxZoom={19}
                    />

                    {/* Auto-open popup hanya untuk organisasi yang dipilih */}
                    <AutoOpenPopup 
                      selectedOrganisation={shouldOpenPopup ? selectedOrganisation : null} 
                      onPopupOpened={() => setShouldOpenPopup(false)} 
                    />

                    {/* Debug info - commented out for performance */}
                    {/* {console.log(`DataTable Map Preview - Total data items: ${data.length}`)} */}

                    {/* Render markers for data points using direct lat/lng */}
                    {filteredMapData.map((item, index) => {
                      // Prioritas: gunakan lat/lng langsung (lebih akurat dari GPS)
                      // Ensure proper decimal parsing by handling string values correctly
                      const rawLat = item.latitude || item.lat;
                      const rawLng = item.longitude || item.lng;
                      
                      // Handle comma decimal separator (convert to period)
                      const cleanLat = typeof rawLat === 'string' ? rawLat.replace(',', '.') : rawLat;
                      const cleanLng = typeof rawLng === 'string' ? rawLng.replace(',', '.') : rawLng;
                      
                      const lat = typeof cleanLat === 'string' ? parseFloat(cleanLat) : Number(cleanLat);
                      const lng = typeof cleanLng === 'string' ? parseFloat(cleanLng) : Number(cleanLng);
                      
                      // Enhanced debug logging untuk melihat data yang di-filter (disabled for performance)
                      // console.log(`DataTable Map Preview - Checking item ${index}:`, { id: item.organisation_id, org: item.organisation });
                      
                      // Relaxed condition: tampilkan jika koordinat valid, termasuk yang 0,0
                      if (!isNaN(lat) && !isNaN(lng)) {
                        
                        return (
                          <Marker
                            key={`preview-marker-${item.organisation_id || index}`}
                            position={[lat, lng]}
                            icon={createMarkerIcon(false)}
                            zIndexOffset={0}
                          >
                          <Popup
                            closeButton={true}
                            autoClose={false}
                            keepInView={true}
                            autoPan={false} // Disable auto pan in preview mode
                          >
                            <div className="min-w-[250px]">
                              <h3 className="m-0 mb-4 text-cyan-400 text-lg font-bold border-b-2 border-cyan-400 pb-1">
                                🏢 {item.organisation || 'Unknown Organisation'}
                              </h3>
                              <div className="text-xs leading-relaxed">
                                <p><strong>ID:</strong> {item.organisation_id || index}</p>
                                <p><strong>Tier:</strong> {item.tier || 'N/A'}</p>
                                <p><strong>Type:</strong> {item.organisation_type || 'N/A'}</p>
                                <p><strong>State:</strong> {item.state || 'N/A'}</p>
                                <p><strong>Address:</strong> {item.address || 'No address available'}</p>
                                {item.comments && item.comments.trim() && (
                                  <p><strong>Comments:</strong> {item.comments}</p>
                                )}
                                <div className={`mt-3 p-2 rounded border ${
                                  lat === 0 && lng === 0 
                                    ? 'bg-yellow-50 border-yellow-400' 
                                    : 'mt-3 p-2 bg-cyan-50 border border-cyan-200 rounded'
                                }`}>
                                  <p className={`m-0 text-xs ${
                                    lat === 0 && lng === 0 
                                      ? 'text-yellow-700' 
                                      : 'text-blue-700'
                                  }`}>
                                    <strong>📍 GPS Coordinates:</strong><br />
                                    Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
                                    {lat === 0 && lng === 0 && (
                                      <><br /><span className="italic">⚠️ Default coordinates - location may need verification</span></>
                                    )}
                                  </p>
                                </div>
                                {/* <div className="mt-3 p-2 bg-cyan-50 border border-cyan-200 rounded">
                                  <p className="m-0 text-xs text-cyan-600">
                                    💡 <strong>Tip:</strong> Use &quot;Map&quot; menu for full interactive experience
                                  </p>
                                </div> */}
                              </div>
                            </div>
                          </Popup>
                          <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                            <span className={`text-xs font-semibold px-2 py-1 rounded text-white ${
                              lat === 0 && lng === 0 ? 'bg-yellow-500' : 'bg-cyan-400'
                            }`}>
                              {item.organisation || 'Unknown'}
                              {lat === 0 && lng === 0 && ' ⚠️'}
                            </span>
                          </Tooltip>
                          </Marker>
                        );
                      }
                      return null;
                    })}
                  </MapContainer>
                </>
              )}
            </div>
          )}
            </div>
            );
          };

export default MainMap;