"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Tooltip } from "react-leaflet";
import styled from 'styled-components';
import NetworkGraph from "../NetworkGraph/NetworkGraph";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import proj4 from "proj4";

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


const MainMap = ({ selectedCountry, selectedSettlement, selectedMenu }) => {
    const [data, setData] = useState([]);
    const [center, setCenter] = useState([-5.7535389, 157.0943453]);
    const [zoom, setZoom] = useState(4); // default zoom level
    const mapRef = useRef(null); // Reference to the map
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);


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

    const fetchDataFromAPI = async (url, queryParams, setData, setError) => {
      try {
        const fullUrl = queryParams ? `${url}?${queryParams.toString()}` : url;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // Timeout 10s
    
        const res = await fetch(fullUrl, { signal: controller.signal });
    
        clearTimeout(timeout); // Hapus timeout jika respons diterima
    
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
    
        const data = await res.json();
        setData(data);
      } catch (error) {
        console.error("API fetch error:", error);
        setError(error);
      }
    };

    // Menentukan endpoint berdasarkan selectedMenu.menu
    const buildQueryParams = (selectedMenu) => {
      const queryParams = new URLSearchParams();
    
      if (selectedMenu?.id_country) {
        queryParams.append("id_country", selectedMenu.id_country);
      }
    
      if (selectedMenu?.menu === "Map") {
        queryParams.append("includeGeom", "true"); // Tambahkan geom hanya untuk peta
      }
    
      return queryParams;
    };
    
   
    const getEndpoint = (selectedMenu) => {
      switch (selectedMenu?.menu) {
        case "Map":
          return "./api/map";
        case "Network":
          return "./api/network";
        default:
          return "./api/default";
      }
    };

    useEffect(() => {
      setLoading(true);
      const fetchData = async () => {
        if (!selectedMenu) return;
        try {
          const url = getEndpoint(selectedMenu);
          const queryParams = buildQueryParams(selectedMenu);
  
          const res = await fetch(`${url}?${queryParams.toString()}`);
          if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  
          const responseData = await res.json();
          setData(responseData);
  
          // Jika menu adalah "Network", ubah data untuk vis.js
          if (selectedMenu.menu === "Network") {
            const formattedNodes = responseData.map((item) => ({
              id: item.organisation_id,
              label: item.organisation,
              title: `${item.state}  - ${item.organisation} - ${item.address} - ${item.comments}`,
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
          }
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, [selectedMenu]);

    useEffect(() => {
      setLoading(true);
      const controller = new AbortController(); // Untuk membatalkan fetch jika diperlukan
    
      const fetchData = async () => {
        if (!selectedMenu) {
          console.log("No menu selected, skipping data fetch.");
          setLoading(false);
          return;
        }
    
        try {
          const url = getEndpoint(selectedMenu);
          const queryParams = buildQueryParams(selectedMenu);
    
          await fetchDataFromAPI(url, queryParams, setData, setError);
        } catch (error) {
          setError(error);
        } finally {
          setLoading(false);
        }
      };
    
      fetchData();
      return () => controller.abort(); // Cleanup jika komponen unmount
    }, [selectedMenu, setData, setError, setLoading]);
    
    
    useEffect(() => {
      setLoading(true); // Set loading state to true during data fetch
      const fetchData = async () => {
        if (!selectedMenu) {
          console.log("No campaign selected, skipping data fetch.");
          setLoading(false); // Stop loading if missing required data
          return;
        }
  
        try {
          // URL endpoints
          const urls = {
            data: getEndpoint(selectedMenu),
          };

          // General query parameters for all APIs
          const dataParams = buildQueryParams(selectedMenu);
          // Fetch general data
          await fetchDataFromAPI(urls.data, dataParams, setData, setError);
          
  
        } catch (error) {
          setError(error);
        } finally {
          setLoading(false); // Set loading state to false once data fetching is done
        }
      };
  
      fetchData();
    }, [setLoading, setError, setData, selectedCountry, selectedMenu]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const convertToGeoJSON = (item) => {
        try {
        const geoJsonData = JSON.parse(item.geom);
        if (geoJsonData.type === 'MultiPolygon') {
            geoJsonData.coordinates = geoJsonData.coordinates.map(polygon =>
            polygon.map(ring =>
                ring.map(coord => {
                const converted = proj4(selectedCountry.utmprojection, coord);
                return converted;
                })
            )
            );
        }
        return geoJsonData;
        } catch (error) {
        console.error('Error parsing GeoJSON:', error, item.geom);
        return null;
        }
    };

    const calculateCentroid = (coordinates) => {
        if (!coordinates || coordinates.length === 0) return [0, 0];
        const allPoints = coordinates.flat(3);
        const length = allPoints.length / 2;

        if (length === 0) return [0, 0];

        let xSum = 0;
        let ySum = 0;

        for (let i = 0; i < allPoints.length; i += 2) {
        const lng = allPoints[i];
        const lat = allPoints[i + 1];
        xSum += lng;
        ySum += lat;
        }

        return [ySum / length, xSum / length];
    };

 const geoJsonFeatures = useMemo(() => {
      return data
        .map((item) => {
          if (item.geom) {
            const geoJsonData = convertToGeoJSON(item);
            const centroid = calculateCentroid(geoJsonData.coordinates);
            return {
              geoJsonData,
              centroid,
              gid: item.organisation_id,
              state: item.state,
              tier: item.tier,
              organisati: item.organisation,
              organisa_1: item.organisation_type,
              address: item.address,
              comments: item.comments
            };
          }
          return null;
        })
        .filter(item => item !== null);
    }, [data, convertToGeoJSON]);
    

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
          {loading && (
        <Overlay>
        <Spinner />
      </Overlay>
          )}
          {selectedMenu?.menu !== "Map" && selectedMenu?.menu !== "Network" && (
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
              <MapContainer
                ref={mapRef}
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ flex: 1, borderRadius: '10px', overflow: 'hidden' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.esri.com">Esri</a> contributors'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={19}
                />

                {geoJsonFeatures.map(({
                  geoJsonData,
                  centroid,
                  gid,
                  state,
                  tier,
                  organisati,
                  organisa_1,
                  address,
                  comments,
                  status
                }) => (
                  <GeoJSON
                    key={`${gid}-${state}`}
                    data={geoJsonData}
                    style={{
                      weight: 1,
                      color: '#ffffff',
                      dashArray: '3',
                      fillOpacity: 0.7
                    }}
                    eventHandlers={{
                      mouseover: (e) => {
                        const layer = e.target;
                        layer.setStyle({
                          weight: 3,
                          color: '#666',
                          fillOpacity: 1
                        });
                      },
                      mouseout: (e) => {
                        const layer = e.target;
                        layer.setStyle({
                          weight: 1,
                          color: '#fff',
                          dashArray: '3',
                          fillOpacity: 0.7
                        });
                      }
                    }}
                  >
                    <Tooltip
                      permanent
                      direction="center"
                      offset={[0, 0]}
                      className="custom-tooltip"
                      position={centroid}
                    >
                      {state}
                    </Tooltip>

                      <Popup>
                        <div className="max-w-xs text-sm text-gray-800 font-sans">
                          <h3 className="text-blue-800 font-bold text-base border-b pb-1 mb-2">🏢 Building Info</h3>
                          <ul className="space-y-1">
                            <li><span className="font-bold">Organisasi:</span> {organisa_1 || '-'}</li>
                            <li><span className="font-bold">State:</span> {state || '-'}</li>
                            <li><span className="font-bold">Tier:</span> {tier || '-'}</li>
                            <li><span className="font-bold">Type:</span> {organisati || '-'}</li>
                            <li><span className="font-bold">Address:</span> {address || '-'}</li>
                            <li><span className="font-bold">Comments:</span> {comments || '-'}</li>
                          </ul>
                        </div>
                      </Popup>

                  </GeoJSON>
                ))}
              </MapContainer>
          )}

          {selectedMenu?.menu === "Network" && (
                <div style={{ height: "100vh", background: "#333", padding: "10px" }}>
                  {/* <h2 style={{ color: "white", textAlign: "center" }}>
                    Network Visualization
                  </h2> */}
                  <NetworkGraph nodes={nodes} edges={edges} />
                </div>
              )}
            </div>
            );
          };

export default MainMap;