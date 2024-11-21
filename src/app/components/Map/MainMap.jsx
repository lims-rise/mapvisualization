"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import proj4 from "proj4";

const MainMap = ({ selectedCampaign }) => {
  const [data, setData] = useState([]);
  const [boundaryData, setBoundaryData] = useState([]);
  const [roadAccessData, setRoadAccessData] = useState([]);
  const [error, setError] = useState(null);
  const utmProjection = "EPSG:4326";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Membangun URL dengan parameter filter campaign
        let url = "./api/data";
        
        // Menambahkan filter campaign ke URL
        if (selectedCampaign) {
          url += `?campaign=${selectedCampaign}`;
        }

        // Mengambil data dari API untuk geojson data (peta bangunan)
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setData(data);

        // Ambil data boundary (MultiLineString) dari API tambahan
        const boundaryRes = await fetch("./api/boundary");
        if (!boundaryRes.ok) {
          throw new Error(`HTTP error! status: ${boundaryRes.status}`);
        }
        const boundaryData = await boundaryRes.json();
        setBoundaryData(boundaryData);

        // Ambil data road_access (MultiLineString) dari API tambahan
        const roadAccess = await fetch("./api/access");
        if (!roadAccess.ok) {
          throw new Error(`HTTP error! status: ${roadAccess.status}`);
        }
        const roadAccessData = await roadAccess.json();
        setRoadAccessData(roadAccessData);

      } catch (error) {
        setError(error);
      }
    };

    fetchData(); // Ambil data setiap kali selectedCampaign berubah
  }, [selectedCampaign]);

  const convertToGeoJSON = (item) => {
    try {
      const geoJsonData = JSON.parse(item.geom);
      if (geoJsonData.type === 'MultiPolygon') {
        geoJsonData.coordinates = geoJsonData.coordinates.map(polygon =>
          polygon.map(ring =>
            ring.map(coord => {
              const converted = proj4(utmProjection, 'EPSG:4326', coord);
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

    // Fungsi untuk memetakan garis-garis batas (MultiLineString)
    const convertToBoundaryGeoJSON = (boundary) => {
        try {
          const geoJsonData = JSON.parse(boundary.geom);
          if (geoJsonData.type === 'MultiLineString') {
            geoJsonData.coordinates = geoJsonData.coordinates.map(line =>
              line.map(coord => {
                const converted = proj4(utmProjection, 'EPSG:4326', coord);
                return converted;
              })
            );
          }
          return geoJsonData;
        } catch (error) {
          console.error('Error parsing Boundary GeoJSON:', error, boundary.geom);
          return null;
        }
    };

    const convertToAccessGeoJSON = (access) => {
        try {
            const geoJsonData = JSON.parse(access.geom);
            if (geoJsonData.type === 'MultiLineString') {
                geoJsonData.coordinates = geoJsonData.coordinates.map(line =>
                    line.map(coord => {
                        const converted = proj4(utmProjection, 'EPSG:4326', coord);
                        return converted;
                    })
                ); 
            }
            return geoJsonData;
        } catch (error) {
            console.error('Error parsing Access GeoJSON:', error, access.geom);
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

  const getColorByStatus = (status) => {
    switch (status) {
      case 'Active':
        return '#92D050';
      case 'UnderConstruction':
        return '#BFBFBF';
      case 'Demolished':
        return '#FF5050';
      default:
        return '#FFD966';
    }
  };

  const geoJsonFeatures = useMemo(() => {
    return data.map((item) => {
      if (item.geom) {
        const geoJsonData = convertToGeoJSON(item);
        const centroid = calculateCentroid(geoJsonData.coordinates);
        return {
          geoJsonData,
          centroid,
          gid: item.gid,
          id_map: item.id_map,
          id_building: item.id_building,
          hoid: item.hoid,
          houseno: item.houseno,
          settlement: item.settlement,
          status: item.status,
          structure: item.structure,
          country: item.country,
          campaign: item.campaign,
          connected: item.connected,
          note: item.note
        };
      }
      return null;
    }).filter(item => item !== null);
  }, [data]);

  const boundaryGeoJson = useMemo(() => {
    return boundaryData.map((boundary) => {
      if (boundary.geom) {
        const geoJsonData = convertToBoundaryGeoJSON(boundary);
        return {
          geoJsonData,
          gid: boundary.gid,
          name: boundary.name,
        };
      }
      return null;
    }).filter(boundary => boundary !== null);
  }, [boundaryData]);

  const accessGeoJson = useMemo(() => {
    return roadAccessData.map((access) => {
      if (access.geom) {
        const geoJsonData = convertToAccessGeoJSON(access);
        return {
          geoJsonData,
          gid: access.gid,
          fid_: access.fid_,
        };
      }
      return null;
    }).filter(access => access !== null);
  }, [roadAccessData]);

  return (
    <div>
      <MapContainer
        center={[-5.1476, 119.4325]} // Koordinat Makassar
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100vh' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com">Esri</a> contributors'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />
        {geoJsonFeatures.map(({ geoJsonData, centroid, gid, id_map, id_building, hoid, houseno, settlement, status, structure, country, campaign, connected, note }) => (
          <React.Fragment key={gid}>
            {/* GeoJSON Layer */}
            <GeoJSON
              data={geoJsonData}
              style={() => ({
                fillColor: getColorByStatus(status),  // Menentukan warna berdasarkan status
                weight: 1,
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 1
              })}
              onEachFeature={(feature, layer) => {
                layer.on({
                  mouseover: () => {
                    layer.bindPopup(`  
                      <h2 style="font-size: 18px; font-weight: bold;">Building Information</h2>
                      <ul>
                        <li><strong>Structure:</strong> ${structure}</li>
                        <li><strong>House Number:</strong> ${houseno}</li>
                        <li><strong>GID:</strong> ${gid}</li>
                        <li><strong>House ID:</strong> ${hoid}</li>
                        <li><strong>Settlement:</strong> ${settlement}</li>
                        <li><strong>Building ID:</strong> ${id_building}</li>
                        <li><strong>Country:</strong> ${country}</li>
                        <li><strong>Campaign:</strong> ${campaign}</li>
                        <li><strong>Connected:</strong> ${connected}</li>
                        <li><strong>Note:</strong> ${note}</li>
                        <li><strong>Status:</strong> ${status}</li>
                        <li><strong>Map ID:</strong> ${id_map}</li>
                      </ul>
                    `).openPopup();
                  },
                  mouseout: () => {
                    layer.closePopup();
                  }
                });
              }}
            >
              {/* Tooltip menggunakan react-leaflet, dengan posisi di centroid */}
              <Tooltip
                permanent = "true"
                direction="center"
                offset={[0, 0]} // Menempatkan tooltip di tengah
                className="custom-tooltip"
                position={centroid} // Menggunakan centroid sebagai posisi tooltip
              >
                {houseno}
              </Tooltip>
            </GeoJSON>
          </React.Fragment>
        ))}
        
        {/* Menampilkan MultiLineString */}
            {boundaryGeoJson.map(({ geoJsonData, gid, name }) => (
            <React.Fragment key={gid}>
                    <GeoJSON
                    data={geoJsonData}
                    style={() => ({
                        color: '#FF6347',  // Garis berwarna tomato
                        weight: 3,
                        opacity: 1,
                    })}
                    onEachFeature={(feature, layer) => {
                        layer.on({
                        mouseover: () => {
                            layer.bindPopup(`
                            <h3>${name}</h3>
                            <ul>
                                <li>GID: ${gid}</li>
                            </ul>
                            `).openPopup();
                        },
                        mouseout: () => {
                            layer.closePopup();
                        }
                        });
                    }}
                />
            </React.Fragment>
            ))}

        {/* Menampilkan MultiLineString */}
            {accessGeoJson.map(({ geoJsonData, gid, fid_ }) => (
            <React.Fragment key={gid}>
                <GeoJSON
                    data={geoJsonData}
                    style={() => ({
                        color: '#006BFF',  // Garis berwarna tomato
                        weight: 3,
                        opacity: 1,
                    })}
                    onEachFeature={(feature, layer) => {
                        layer.on({
                        mouseover: () => {
                            layer.bindPopup(`
                            <h3>GID: ${gid}</h3>
                            <ul>
                                <li>FID: ${fid_}</li>
                            </ul>
                            `).openPopup();
                        },
                        mouseout: () => {
                            layer.closePopup();
                        } 
                        });
                    }}              
                />
            </React.Fragment>
            ))}
      </MapContainer>
    </div>
  );
};

export default MainMap;
