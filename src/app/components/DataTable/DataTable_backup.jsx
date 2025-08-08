"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
  CardContent,
  Snackbar,
  Alert
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

const DataTable = ({ data, loading, onNavigateToMap, selectedOrganisation }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [columnWidths, setColumnWidths] = useState({});
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const lastSelectedIdRef = useRef(null);
  const dataGridRef = useRef(null);
  const isInitialRenderRef = useRef(true);
  const navigationInProgressRef = useRef(false);
  const [showNavigationSnack, setShowNavigationSnack] = useState(false);
  const [navigationMessage, setNavigationMessage] = useState('');

  // Get unique states for filter
  const states = useMemo(() => {
    if (!data?.length) return [];
    const uniqueStates = [...new Set(data.map(item => item.state))].filter(Boolean);
    return uniqueStates.sort();
  }, [data]);

  // Filter and search data - MOVED UP untuk digunakan di useEffect
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

  // Fixed Auto-navigate logic
  useEffect(() => {
    const currentSelectedId = selectedOrganisation?.id;
    const currentOrgName = selectedOrganisation?.organisation;
    
    console.log('🔍 Navigation Effect Triggered:', {
      selectedOrganisation,
      currentSelectedId,
      filteredDataLength: filteredData.length,
      navigationInProgress: navigationInProgressRef.current,
      lastTrackedId: lastSelectedIdRef.current,
      isInitialRender: isInitialRenderRef.current,
      paginationModel: paginationModel
    });
    
    if (currentSelectedId && 
        filteredData.length > 0 && 
        !navigationInProgressRef.current &&
        (currentSelectedId !== lastSelectedIdRef.current || isInitialRenderRef.current)) {
      
      navigationInProgressRef.current = true;
      
      // Small delay to ensure state sync
      setTimeout(() => {
        const selectedRowIndex = filteredData.findIndex(
          item => item.organisation_id === currentSelectedId
        );
        
        if (selectedRowIndex !== -1) {
          const currentPageSize = paginationModel.pageSize;
          const targetPage = Math.floor(selectedRowIndex / currentPageSize);
          const isInitialNavigation = isInitialRenderRef.current;
          
          console.log('Unified auto-navigation:', {
            organisation: currentOrgName,
            id: currentSelectedId,
            rowIndex: selectedRowIndex,
            currentPageState: paginationModel.page,
            targetPage: targetPage,
            pageSize: currentPageSize,
            totalRows: filteredData.length,
            isInitialNavigation,
            lastTrackedId: lastSelectedIdRef.current,
            calculationCheck: `Index ${selectedRowIndex} / PageSize ${currentPageSize} = Page ${targetPage}`,
            rowInPage: selectedRowIndex % currentPageSize + 1,
            actualPageDisplay: targetPage + 1
          });
          
          if (isInitialRenderRef.current) {
            isInitialRenderRef.current = false;
          }
          
          if (targetPage !== paginationModel.page) {
            setPaginationModel(prev => ({
              ...prev,
              page: targetPage
            }));
            
            const rowInPage = selectedRowIndex % currentPageSize + 1;
            const message = isInitialNavigation 
              ? `🏠 Welcome back! Showing "${currentOrgName}" on page ${targetPage + 1} (row ${rowInPage} in page)`
              : `🎯 Auto-navigated to page ${targetPage + 1} for "${currentOrgName}" (row ${rowInPage} in page)`;
            
            setNavigationMessage(message);
            setShowNavigationSnack(true);
            
            setTimeout(() => {
              if (dataGridRef.current) {
                const selectedRowElement = dataGridRef.current.querySelector('.selected-map-row');
                if (selectedRowElement) {
                  selectedRowElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                  });
                  selectedRowElement.style.animation = 'highlightPulse 2s ease-in-out';
                  setTimeout(() => {
                    if (selectedRowElement.style) {
                      selectedRowElement.style.animation = '';
                    }
                  }, 2000);
                }
              }
              
              setTimeout(() => {
                lastSelectedIdRef.current = currentSelectedId;
                navigationInProgressRef.current = false;
              }, 500);
            }, 400);
          } else {
            setTimeout(() => {
              if (dataGridRef.current) {
                const selectedRowElement = dataGridRef.current.querySelector('.selected-map-row');
                if (selectedRowElement) {
                  selectedRowElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                  });
                  selectedRowElement.style.animation = 'highlightPulse 1.5s ease-in-out';
                  
                  if (isInitialNavigation) {
                    const rowInPage = selectedRowIndex % currentPageSize + 1;
                    setNavigationMessage(
                      `🏠 Welcome back! "${currentOrgName}" is already visible (row ${rowInPage} in page ${targetPage + 1})`
                    );
                    setShowNavigationSnack(true);
                  }
                  
                  setTimeout(() => {
                    if (selectedRowElement.style) {
                      selectedRowElement.style.animation = '';
                    }
                  }, 1500);
                }
              }
              
              setTimeout(() => {
                lastSelectedIdRef.current = currentSelectedId;
                navigationInProgressRef.current = false;
              }, 200);
            }, 200);
          }
        } else {
          navigationInProgressRef.current = false;
          console.log('Row not found for navigation:', {
            searchedId: currentSelectedId,
            totalRows: filteredData.length,
            availableIds: filteredData.map(item => item.organisation_id)
          });
        }
      }, 100);
    }
  }, [selectedOrganisation?.id, filteredData.length, paginationModel.pageSize]);
  
  useEffect(() => {
    if (!navigationInProgressRef.current) {
      isInitialRenderRef.current = false;
    }
  }, [paginationModel.page]);

  const handlePaginationModelChange = useCallback((newModel) => {
    setPaginationModel(newModel);
    if (newModel.pageSize !== pageSize) {
      setPageSize(newModel.pageSize);
    }
  }, [pageSize]);

  // Manual trigger untuk navigate ke selected row
  const handleFindSelectedRow = useCallback(() => {
    if (selectedOrganisation && selectedOrganisation.id && filteredData.length > 0) {
      lastSelectedIdRef.current = null;
      
      const selectedRowIndex = filteredData.findIndex(
        item => item.organisation_id === selectedOrganisation.id
      );
      
      if (selectedRowIndex !== -1) {
        const currentPageSize = paginationModel.pageSize;
        const targetPage = Math.floor(selectedRowIndex / currentPageSize);
        
        console.log('Manual navigation trigger:', {
          organisation: selectedOrganisation.organisation,
          id: selectedOrganisation.id,
          rowIndex: selectedRowIndex,
          currentPage: paginationModel.page,
          targetPage: targetPage,
          pageSize: currentPageSize,
          calculationCheck: `Index ${selectedRowIndex} / PageSize ${currentPageSize} = Page ${targetPage}`,
          rowInPage: selectedRowIndex % currentPageSize + 1,
          actualPageDisplay: targetPage + 1
        });
        
        if (targetPage !== paginationModel.page) {
          setPaginationModel(prev => ({ ...prev, page: targetPage }));
        }
        
        const rowInPage = selectedRowIndex % currentPageSize + 1;
        setNavigationMessage(
          `🔍 Found "${selectedOrganisation.organisation}" on page ${targetPage + 1} (row ${rowInPage} in page)!`
        );
        setShowNavigationSnack(true);
        
        setTimeout(() => {
          if (dataGridRef.current) {
            const selectedRowElement = dataGridRef.current.querySelector('.selected-map-row');
            if (selectedRowElement) {
              selectedRowElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
              });
              selectedRowElement.style.animation = 'highlightPulse 2s ease-in-out';
              setTimeout(() => {
                if (selectedRowElement.style) {
                  selectedRowElement.style.animation = '';
                }
              }, 2000);
            } else {
              console.log('Manual navigation: Selected row element not found after navigation');
            }
          }
          lastSelectedIdRef.current = selectedOrganisation.id;
        }, targetPage !== paginationModel.page ? 400 : 100);
      } else {
        console.log('Manual navigation: Row not found', {
          searchedId: selectedOrganisation.id,
          totalFilteredRows: filteredData.length,
          availableIds: filteredData.slice(0, 10).map(item => item.organisation_id)
        });
      }
    }
  }, [selectedOrganisation, filteredData, paginationModel.pageSize, paginationModel.page]);

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
      const rawLat = rowData.latitude || rowData.lat || 0;
      const rawLng = rowData.longitude || rowData.lng || 0;
      
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
      console.log(`Navigate to ${rowData.organisation} on map`);
    }
  }, [onNavigateToMap]);

  // Define columns for DataGrid with dynamic widths - SAME AS BEFORE
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
    // ... ALL OTHER COLUMNS SAME AS BEFORE - truncated for brevity
  ], [columnWidths, handleNavigateToMap]);

  // Prepare rows for DataGrid - SAME AS BEFORE
  const rows = useMemo(() => {
    if (!data?.length || !filteredData?.length) return [];
    
    const allProcessedRows = data.map((item, index) => {
      const rawLat = item.latitude || item.lat;
      const rawLng = item.longitude || item.lng;
      
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
    
    const coordinateGroups = {};
    allProcessedRows.forEach(row => {
      const coordKey = `${row.latitude},${row.longitude}`;
      if (!coordinateGroups[coordKey]) {
        coordinateGroups[coordKey] = [];
      }
      coordinateGroups[coordKey].push(row.organisation_id || row.id);
    });
    
    const duplicateCoordinates = new Set();
    Object.values(coordinateGroups).forEach(group => {
      if (group.length > 1) {
        group.forEach(orgId => duplicateCoordinates.add(orgId));
      }
    });
    
    return filteredData.map((item, index) => {
      const rawLat = item.latitude || item.lat;
      const rawLng = item.longitude || item.lng;
      
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
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  useEffect(() => {
    setPaginationModel(prev => ({ ...prev, page: 0 }));
    lastSelectedIdRef.current = null;
    isInitialRenderRef.current = true;
  }, [searchTerm, filterState]);

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
    <div>Basic Table Component - Restore needed</div>
  );
};

export default DataTable;
