"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Toolbar,
  InputAdornment,
  Stack,
  Card,
  CardContent
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
} from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  TableView as TableIcon,
  Clear as ClearIcon,
  LocationOn as LocationIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';

// Custom Toolbar untuk DataGrid dengan auto-resize
function CustomToolbar({ onAutoResize }) {
  return (
    <GridToolbarContainer sx={{ p: 1, gap: 1 }}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
      <IconButton
        size="small"
        onClick={onAutoResize}
        sx={{
          color: '#0FB3BA',
          '&:hover': {
            backgroundColor: 'rgba(15, 179, 186, 0.1)',
          },
        }}
        title="Auto-resize columns to fit content"
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 0.5,
          fontSize: '12px',
          fontWeight: 500
        }}>
          📏 Auto-fit
        </Box>
      </IconButton>
    </GridToolbarContainer>
  );
}

// Custom Status Chip Component dengan design modern
const StatusChip = ({ status }) => {
  const getStatusConfig = (status) => {
    switch(status?.toLowerCase()) {
      case 'active': 
        return {
          color: '#27ae60',
          backgroundColor: '#d5f4e6',
          icon: '✅',
          label: 'Active'
        };
      case 'inactive': 
        return {
          color: '#e74c3c',
          backgroundColor: '#fdf2f2',
          icon: '❌',
          label: 'Inactive'
        };
      case 'pending': 
        return {
          color: '#f39c12',
          backgroundColor: '#fef9e7',
          icon: '⏳',
          label: 'Pending'
        };
      default: 
        return {
          color: '#95a5a6',
          backgroundColor: '#f8f9fa',
          icon: '❓',
          label: status || 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip 
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <span style={{ fontSize: '10px' }}>{config.icon}</span>
          <span style={{ fontSize: '11px', fontWeight: 600 }}>{config.label}</span>
        </Box>
      }
      size="small"
      sx={{
        backgroundColor: config.backgroundColor,
        color: config.color,
        border: `1px solid ${config.color}30`,
        fontWeight: 600,
        height: 24,
        '& .MuiChip-label': {
          px: 1
        }
      }}
    />
  );
};

const DataTable = ({ data, loading, onNavigateToMap }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [columnWidths, setColumnWidths] = useState({});

  // Get unique states for filter
  const states = useMemo(() => {
    if (!data?.length) return [];
    const uniqueStates = [...new Set(data.map(item => item.state))].filter(Boolean);
    return uniqueStates.sort();
  }, [data]);

  // Auto-resize columns based on content
  const handleAutoResize = () => {
    const newWidths = {
      organisation_id: 80,
      organisation: 220,
      state: 120,
      tier: 80,
      organisation_type: 160,
      address: 280,
      latitude: 120,
      longitude: 120,
      comments: 200
    };
    
    // Calculate optimal widths based on content
    if (data?.length) {
      data.forEach(item => {
        const orgLength = (item.organisation || '').length;
        const typeLength = (item.organisation_type || '').length;
        const addressLength = (item.address || '').length;
        const commentsLength = (item.comments || '').length;
        
        newWidths.organisation = Math.max(newWidths.organisation, Math.min(orgLength * 8 + 50, 350));
        newWidths.organisation_type = Math.max(newWidths.organisation_type, Math.min(typeLength * 7 + 40, 220));
        newWidths.address = Math.max(newWidths.address, Math.min(addressLength * 6 + 50, 400));
        newWidths.comments = Math.max(newWidths.comments, Math.min(commentsLength * 6 + 50, 350));
      });
    }
    
    setColumnWidths(newWidths);
  };

  // Handle navigate to map
  const handleNavigateToMap = useCallback((rowData) => {
    if (onNavigateToMap) {
      // Ensure proper decimal precision for coordinates
      const rawLat = rowData.latitude || rowData.lat || 0;
      const rawLng = rowData.longitude || rowData.lng || 0;
      
      // Handle comma decimal separator (convert to period)
      const cleanLat = typeof rawLat === 'string' ? rawLat.replace(',', '.') : rawLat;
      const cleanLng = typeof rawLng === 'string' ? rawLng.replace(',', '.') : rawLng;
      
      const lat = typeof cleanLat === 'string' ? parseFloat(cleanLat) : Number(cleanLat);
      const lng = typeof cleanLng === 'string' ? parseFloat(cleanLng) : Number(cleanLng);
      
      console.log('DataTable navigation - Coordinate parsing:', {
        organisation: rowData.organisation,
        id: rowData.organisation_id,
        rawLat,
        rawLng,
        cleanLat,
        cleanLng,
        lat,
        lng,
        latType: typeof rawLat,
        lngType: typeof rawLng
      });
      
      // Always call the callback, let parent handle the logic
      onNavigateToMap({
        lat: lat,
        lng: lng,
        organisation: rowData.organisation,
        id: rowData.organisation_id,
        address: rowData.address,
        state: rowData.state,
        tier: rowData.tier,
        fullData: rowData
      });
    } else {
      // If no callback provided, show a simple message
      console.log(`Navigate to ${rowData.organisation} on map`);
    }
  }, [onNavigateToMap]);

  // Define columns for DataGrid with dynamic widths
  const columns = useMemo(() => [
    {
      field: 'organisation_id',
      headerName: 'ID',
      width: columnWidths.organisation_id || 80,
      minWidth: 60,
      maxWidth: 100,
      type: 'number',
      headerAlign: 'center',
      align: 'center',
      flex: 0,
      resizable: true,
      renderCell: (params) => (
        <Chip 
          label={params.value || '-'}
          size="small"
          variant="outlined"
          color="primary"
          sx={{ 
            fontWeight: 600, 
            fontSize: '10px',
            height: 20,
            '& .MuiChip-label': {
              px: 0.8
            }
          }}
        />
      ),
    },
    {
      field: 'organisation',
      headerName: 'Organisation',
      width: columnWidths.organisation || 200,
      minWidth: 150,
      maxWidth: 350,
      flex: 0.3,
      headerAlign: 'left',
      align: 'left',
      resizable: true,
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: 1,
          height: '100%',
          py: 0.5,
          width: '100%'
        }}>
          <Box sx={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: '#0FB3BA',
            flexShrink: 0,
            mt: 0.5
          }} />
          <Typography 
            variant="body2" 
            fontWeight="600" 
            sx={{ 
              color: '#2c3e50',
              fontSize: '11px',
              lineHeight: 1.3,
              wordBreak: 'break-word',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              flex: 1
            }}
            title={params.value || '-'}
          >
            {params.value || '-'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'state',
      headerName: 'State',
      width: columnWidths.state || 120,
      minWidth: 100,
      maxWidth: 150,
      headerAlign: 'center',
      align: 'center',
      flex: 0,
      resizable: true,
      renderCell: (params) => <StatusChip status={params.value} />,
    },
    {
      field: 'tier',
      headerName: 'Tier',
      width: columnWidths.tier || 140,
      minWidth: 70,
      maxWidth: 100,
      headerAlign: 'center',
      align: 'center',
      flex: 0,
      resizable: true,
      renderCell: (params) => {
        const tier = params.value;
        const getTierColor = (tier) => {
          switch(tier) {
            case 1: return '#ff6b6b';
            case 2: return '#4ecdc4';
            case 3: return '#45b7d1';
            default: return '#95a5a6';
          }
        };
        
        return (
          <Chip
            label={tier ? `T${tier}` : '-'}
            size="small"
            sx={{
              backgroundColor: getTierColor(tier),
              color: 'white',
              fontWeight: 600,
              fontSize: '10px',
              height: 20,
              minWidth: '40px',
              '& .MuiChip-label': {
                px: 0.8
              }
            }}
          />
        );
      },
    },
    {
      field: 'organisation_type',
      headerName: 'Type',
      width: columnWidths.organisation_type || 140,
      minWidth: 120,
      maxWidth: 220,
      flex: 0.2,
      headerAlign: 'left',
      align: 'left',
      resizable: true,
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start',
          height: '100%',
          py: 0.5,
          width: '100%'
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#34495e',
              fontWeight: 500,
              backgroundColor: '#ecf0f1',
              padding: '2px 6px',
              borderRadius: 1,
              fontSize: '10px',
              lineHeight: 1.2,
              wordBreak: 'break-word',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              width: '100%'
            }}
            title={params.value || '-'}
          >
            {params.value || '-'}
          </Typography>
        </Box>
      ),
    },
    // {
    //   field: 'address',
    //   headerName: 'Address',
    //   width: columnWidths.address || 250,
    //   minWidth: 200,
    //   maxWidth: 400,
    //   flex: 0.4,
    //   headerAlign: 'left',
    //   align: 'left',
    //   resizable: true,
    //   renderCell: (params) => (
    //     <Box sx={{ 
    //       display: 'flex', 
    //       alignItems: 'flex-start',
    //       height: '100%',
    //       py: 0.5,
    //       width: '100%'
    //     }}>
    //       <Typography 
    //         variant="body2" 
    //         sx={{ 
    //           color: '#2c3e50',
    //           fontSize: '11px',
    //           lineHeight: 1.3,
    //           wordBreak: 'break-word',
    //           overflow: 'hidden',
    //           display: '-webkit-box',
    //           WebkitLineClamp: 2,
    //           WebkitBoxOrient: 'vertical',
    //           width: '100%'
    //         }}
    //         title={params.value || '-'}
    //       >
    //         {params.value || '-'}
    //       </Typography>
    //     </Box>
    //   ),
    // },
    // {
    //   field: 'comments',
    //   headerName: 'Comments',
    //   width: columnWidths.comments || 200,
    //   minWidth: 150,
    //   maxWidth: 350,
    //   flex: 0.3,
    //   headerAlign: 'left',
    //   align: 'left',
    //   resizable: true,
    //   renderCell: (params) => {
    //     const comments = params.value && params.value.trim() ? params.value : '-';
    //     const hasComments = comments !== '-';
        
    //     return (
    //       <Box sx={{ 
    //         display: 'flex', 
    //         alignItems: 'flex-start', 
    //         gap: 0.5,
    //         height: '100%',
    //         py: 0.5,
    //         width: '100%'
    //       }}>
    //         {hasComments && (
    //           <Box sx={{
    //             width: 3,
    //             height: 3,
    //             borderRadius: '50%',
    //             backgroundColor: '#27ae60',
    //             flexShrink: 0,
    //             mt: 0.5
    //           }} />
    //         )}
    //         <Typography 
    //           variant="body2" 
    //           sx={{ 
    //             color: hasComments ? '#2c3e50' : '#95a5a6',
    //             fontSize: '11px',
    //             fontStyle: hasComments ? 'normal' : 'italic',
    //             lineHeight: 1.3,
    //             wordBreak: 'break-word',
    //             overflow: 'hidden',
    //             display: '-webkit-box',
    //             WebkitLineClamp: 2,
    //             WebkitBoxOrient: 'vertical',
    //             flex: 1
    //           }}
    //           title={comments}
    //         >
    //           {comments}
    //         </Typography>
    //       </Box>
    //     );
    //   },
    // },
    {
      field: 'latitude',
      headerName: 'Latitude',
      width: columnWidths.latitude || 120,
      minWidth: 100,
      maxWidth: 150,
      flex: 0,
      headerAlign: 'center',
      align: 'center',
      resizable: true,
      type: 'number',
      renderCell: (params) => {
        const lat = params.value;
        const isValid = lat !== null && lat !== undefined && !isNaN(lat) && lat !== 0;
        const hasDuplicate = params.row.hasDuplicateCoordinates;
        
        return (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%'
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: hasDuplicate ? 'white' : (isValid ? '#2c3e50' : '#e74c3c'),
                fontSize: '11px',
                fontWeight: 500,
                fontFamily: 'monospace',
                backgroundColor: hasDuplicate ? '#e74c3c' : (isValid ? '#e8f5e8' : '#ffeaea'),
                padding: '4px 8px',
                borderRadius: 1,
                border: hasDuplicate ? '1px solid #c0392b' : (isValid ? '1px solid #27ae60' : '1px solid #e74c3c'),
                minWidth: '80px',
                textAlign: 'center',
                boxShadow: hasDuplicate ? '0 2px 4px rgba(231, 76, 60, 0.3)' : 'none'
              }}
              title={hasDuplicate ? `⚠️ Duplicate coordinates detected: ${lat?.toFixed(6)}` : (isValid ? `Latitude: ${lat?.toFixed(6)}` : 'Invalid coordinates')}
            >
              {hasDuplicate ? `🚨 ${lat.toFixed(6)}` : (isValid ? lat.toFixed(6) : '⚠️ N/A')}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'longitude',
      headerName: 'Longitude',
      width: columnWidths.longitude || 120,
      minWidth: 100,
      maxWidth: 150,
      flex: 0,
      headerAlign: 'center',
      align: 'center',
      resizable: true,
      type: 'number',
      renderCell: (params) => {
        const lng = params.value;
        const isValid = lng !== null && lng !== undefined && !isNaN(lng) && lng !== 0;
        const hasDuplicate = params.row.hasDuplicateCoordinates;
        
        return (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%'
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: hasDuplicate ? 'white' : (isValid ? '#2c3e50' : '#e74c3c'),
                fontSize: '11px',
                fontWeight: 500,
                fontFamily: 'monospace',
                backgroundColor: hasDuplicate ? '#e74c3c' : (isValid ? '#e8f5e8' : '#ffeaea'),
                padding: '4px 8px',
                borderRadius: 1,
                border: hasDuplicate ? '1px solid #c0392b' : (isValid ? '1px solid #27ae60' : '1px solid #e74c3c'),
                minWidth: '80px',
                textAlign: 'center',
                boxShadow: hasDuplicate ? '0 2px 4px rgba(231, 76, 60, 0.3)' : 'none'
              }}
              title={hasDuplicate ? `⚠️ Duplicate coordinates detected: ${lng?.toFixed(6)}` : (isValid ? `Longitude: ${lng?.toFixed(6)}` : 'Invalid coordinates')}
            >
              {hasDuplicate ? `🚨 ${lng.toFixed(6)}` : (isValid ? lng.toFixed(6) : '⚠️ N/A')}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Map',
      width: 100,
      minWidth: 80,
      maxWidth: 120,
      flex: 0,
      headerAlign: 'center',
      align: 'center',
      resizable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%'
        }}>
          <IconButton
            size="small"
            onClick={() => handleNavigateToMap(params.row.organisation_id ? params.row : params.row.fullData)}
            sx={{
              backgroundColor: '#0FB3BA',
              color: 'white',
              width: 32,
              height: 32,
              '&:hover': {
                backgroundColor: '#0a9aa1',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(15, 179, 186, 0.3)',
            }}
            title={`View ${params.row.organisation_id} on map`}
          >
            <LocationIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      ),
    },
  ], [columnWidths, handleNavigateToMap]);

  // Filter and search data
  const filteredData = useMemo(() => {
    if (!data?.length) return [];
    
    return data.filter(item => {
      const matchesSearch = !searchTerm || 
        Object.values(item).some(value => 
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesFilter = !filterState || item.state === filterState;
      
      return matchesSearch && matchesFilter;
    });
  }, [data, searchTerm, filterState]);

  // Prepare rows for DataGrid
  const rows = useMemo(() => {
    if (!data?.length || !filteredData?.length) return [];
    
    // First, find duplicate coordinates from ALL data (not filtered data)
    const allProcessedRows = data.map((item, index) => {
      // Ensure proper decimal precision for coordinates
      const rawLat = item.latitude || item.lat;
      const rawLng = item.longitude || item.lng;
      
      // Handle comma decimal separator (convert to period)
      const cleanLat = typeof rawLat === 'string' ? rawLat.replace(',', '.') : rawLat;
      const cleanLng = typeof rawLng === 'string' ? rawLng.replace(',', '.') : rawLng;
      
      const lat = typeof cleanLat === 'string' ? parseFloat(cleanLat) : Number(cleanLat);
      const lng = typeof cleanLng === 'string' ? parseFloat(cleanLng) : Number(cleanLng);
      
      return {
        id: item.organisation_id || index,
        organisation_id: item.organisation_id,
        latitude: lat,
        longitude: lng,
      };
    });
    
    // Find duplicate coordinates from ALL data
    const coordinateGroups = {};
    allProcessedRows.forEach(row => {
      const coordKey = `${row.latitude},${row.longitude}`;
      if (!coordinateGroups[coordKey]) {
        coordinateGroups[coordKey] = [];
      }
      coordinateGroups[coordKey].push(row.organisation_id || row.id);
    });
    
    // Mark organisation_ids with duplicate coordinates
    const duplicateCoordinates = new Set();
    Object.values(coordinateGroups).forEach(group => {
      if (group.length > 1) {
        group.forEach(orgId => duplicateCoordinates.add(orgId));
      }
    });
    
    // Now process filtered data and apply duplicate flags
    return filteredData.map((item, index) => {
      // Ensure proper decimal precision for coordinates
      const rawLat = item.latitude || item.lat;
      const rawLng = item.longitude || item.lng;
      
      // Handle comma decimal separator (convert to period)
      const cleanLat = typeof rawLat === 'string' ? rawLat.replace(',', '.') : rawLat;
      const cleanLng = typeof rawLng === 'string' ? rawLng.replace(',', '.') : rawLng;
      
      const lat = typeof cleanLat === 'string' ? parseFloat(cleanLat) : Number(cleanLat);
      const lng = typeof cleanLng === 'string' ? parseFloat(cleanLng) : Number(cleanLng);
      
      return {
        id: item.organisation_id || index,
        organisation_id: item.organisation_id,
        organisation: item.organisation,
        state: item.state,
        tier: item.tier,
        organisation_type: item.organisation_type,
        address: item.address,
        comments: item.comments,
        latitude: lat,
        longitude: lng,
        hasDuplicateCoordinates: duplicateCoordinates.has(item.organisation_id)
      };
    });
  }, [data, filteredData]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterState("");
  };

  if (loading) {
    return (
      <Box sx={{ 
        p: 3, 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Card elevation={24} sx={{ 
          p: 6, 
          textAlign: 'center', 
          minWidth: 400,
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <CardContent>
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
              <TableIcon sx={{ 
                fontSize: 64, 
                color: '#0FB3BA',
                animation: 'pulse 2s infinite'
              }} />
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 80,
                height: 80,
                borderRadius: '50%',
                border: '3px solid #0FB3BA30',
                borderTop: '3px solid #0FB3BA',
                animation: 'spin 1s linear infinite'
              }} />
            </Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#2c3e50' }}>
              🔄 Loading Data Table...
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '16px' }}>
              Please wait while we prepare your analytics dashboard
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1 }}>
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#0FB3BA',
                    animation: `bounce 1.4s infinite ease-in-out both`,
                    animationDelay: `${i * 0.16}s`
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
        <style jsx global>{`
          @keyframes spin {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0);
            } 40% {
              transform: scale(1);
            }
          }
        `}</style>
      </Box>
    );
  }

  if (!data?.length) {
    return (
      <Box sx={{ 
        p: 3, 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Card elevation={24} sx={{ 
          p: 6, 
          textAlign: 'center', 
          minWidth: 400,
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <CardContent>
            <TableIcon sx={{ 
              fontSize: 64, 
              color: '#95a5a6', 
              mb: 3,
              opacity: 0.7
            }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#2c3e50' }}>
              📊 No Data Available
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '16px', mb: 3 }}>
              No records found to display in the table
            </Typography>
            <Box sx={{
              p: 2,
              backgroundColor: '#ecf0f1',
              borderRadius: 2,
              border: '2px dashed #bdc3c7'
            }}>
              <Typography variant="body2" color="text.secondary">
                💡 Try refreshing the page or check your data source
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100vh', 
      p: 3, 
      background: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Paper 
        elevation={24}
        sx={{ 
          height: '95%', 
          width: '98%',
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        {/* Modern Header with Gradient */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #0FB3BA 0%, #1976d2 100%)',
          color: 'white',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(15, 179, 186, 0.3)'
        }}>
          <Box sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            p: 1.5,
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TableIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
              📊 Data Analytics Dashboard
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {filteredData.length} records • Advanced filtering & analytics
            </Typography>
          </Box>
        </Box>

        {/* Modern Filters Section */}
        <Box sx={{ 
          p: 3, 
          background: 'linear-gradient(to right, #f8f9fa, #e9ecef)',
          borderBottom: '2px solid #e3f2fd'
        }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              size="medium"
              placeholder="🔍 Search across all columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#0FB3BA' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                minWidth: 350,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'white',
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: '#0FB3BA',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0FB3BA',
                    borderWidth: 2,
                  },
                },
              }}
            />
            
            <FormControl size="medium" sx={{ minWidth: 200 }}>
              <InputLabel sx={{ color: '#0FB3BA' }}>🏛️ Filter by State</InputLabel>
              <Select
                value={filterState}
                label="🏛️ Filter by State"
                onChange={(e) => setFilterState(e.target.value)}
                sx={{
                  borderRadius: 3,
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0',
                    borderWidth: 2,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0FB3BA',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0FB3BA',
                    borderWidth: 2,
                  },
                }}
              >
                <MenuItem value="">🌐 All States</MenuItem>
                {states.map(state => (
                  <MenuItem key={state} value={state}>
                    🏛️ {state}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {(searchTerm || filterState) && (
              <IconButton 
                onClick={handleClearFilters}
                sx={{
                  backgroundColor: '#ff4757',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#ff3742',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease',
                  borderRadius: 2,
                  p: 1.5
                }}
                title="Clear all filters"
              >
                <ClearIcon />
              </IconButton>
            )}
          </Stack>
        </Box>

        {/* Modern DataGrid */}
        <Box sx={{ 
          flexGrow: 1, 
          minHeight: 0, 
          p: 2,
          overflow: 'hidden',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}>
          <DataGrid
            rows={rows}
            columns={columns}
            rowHeight={60}
            headerHeight={52}
            pageSize={pageSize}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            pagination
            disableSelectionOnClick
            disableColumnMenu={false}
            components={{
              Toolbar: () => <CustomToolbar onAutoResize={handleAutoResize} />,
            }}
            sx={{
              border: 'none',
              borderRadius: 2,
              backgroundColor: 'white',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              '& .MuiDataGrid-columnHeaders': {
                background: 'linear-gradient(135deg, #0FB3BA 0%, #1976d2 100%)',
                color: 'white',
                borderBottom: 'none',
                fontSize: '14px',
                fontWeight: 600,
                minHeight: '52px',
                '& .MuiDataGrid-columnHeader': {
                  '&:focus': {
                    outline: 'none',
                  },
                  '& .MuiDataGrid-columnHeaderTitle': {
                    color: 'black !important',
                    fontWeight: 700,
                    fontSize: '14px',
                    textShadow: '0 1px 2px rgba(255,255,255,0.5)',
                  },
                },
                '& .MuiDataGrid-columnHeaderTitleContainer': {
                  color: 'black !important',
                },
                '& .MuiDataGrid-iconSeparator': {
                  color: 'rgba(0,0,0,0.5)',
                },
                '& .MuiDataGrid-sortIcon': {
                  color: 'black !important',
                },
                '& .MuiDataGrid-menuIcon': {
                  color: 'black !important',
                },
              },
              '& .MuiDataGrid-row': {
                borderBottom: '1px solid #f0f0f0',
                minHeight: '60px !important',
                maxHeight: '60px !important',
                '&:nth-of-type(even)': {
                  backgroundColor: '#fafafa',
                },
                '&:hover': {
                  backgroundColor: '#e3f2fd',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(15, 179, 186, 0.15)',
                  transition: 'all 0.2s ease',
                },
                '&.Mui-selected': {
                  backgroundColor: '#e1f5fe',
                  '&:hover': {
                    backgroundColor: '#b3e5fc',
                  },
                },
              },
              '& .MuiDataGrid-cell': {
                borderColor: 'transparent',
                fontSize: '13px',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'flex-start',
                minHeight: '60px !important',
                maxHeight: '60px !important',
                '&:focus': {
                  outline: 'none',
                },
                '&:focus-within': {
                  outline: 'none',
                },
              },
              '& .MuiDataGrid-columnSeparator': {
                display: 'none',
              },
              '& .MuiDataGrid-toolbarContainer': {
                background: 'linear-gradient(to right, #f8f9fa, #e9ecef)',
                borderBottom: '2px solid #e3f2fd',
                borderRadius: '8px 8px 0 0',
                p: 2,
                minHeight: '56px',
                '& .MuiButton-root': {
                  color: '#0FB3BA',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(15, 179, 186, 0.1)',
                  },
                },
              },
              '& .MuiDataGrid-footerContainer': {
                background: 'linear-gradient(to right, #f8f9fa, #e9ecef)',
                borderTop: '2px solid #e3f2fd',
                borderRadius: '0 0 8px 8px',
                minHeight: '52px',
                overflow: 'hidden',
                '& .MuiTablePagination-root': {
                  color: '#0FB3BA',
                  fontWeight: 500,
                  overflow: 'hidden',
                },
                '& .MuiIconButton-root': {
                  color: '#0FB3BA',
                  '&:hover': {
                    backgroundColor: 'rgba(15, 179, 186, 0.1)',
                  },
                },
                '& .MuiTablePagination-toolbar': {
                  overflow: 'hidden',
                },
                '& .MuiTablePagination-spacer': {
                  overflow: 'hidden',
                },
              },
              '& .MuiCheckbox-root': {
                color: '#0FB3BA',
                '&.Mui-checked': {
                  color: '#0FB3BA',
                },
              },
              '& .MuiDataGrid-virtualScroller': {
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px',
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#c1c1c1',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#a8a8a8',
                  },
                },
                '& .MuiDataGrid-row': {
                  '& .MuiDataGrid-cell': {
                    overflow: 'visible',
                  },
                },
              },
              '& .MuiDataGrid-main': {
                overflow: 'hidden',
              },
              '& .MuiDataGrid-overlay': {
                overflow: 'hidden',
              },
            }}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
              sorting: {
                sortModel: [{ field: 'organisation_id', sort: 'asc' }],
              },
            }}
            pageSizeOptions={[5, 10, 25, 50, 100]}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default DataTable;
