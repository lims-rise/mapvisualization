"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px) saturate(190%) contrast(110%);
  -webkit-backdrop-filter: blur(22px) saturate(190%) contrast(110%);
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
`;

const ModalTitle = styled.h2`
  color: #0FB3BA;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  &.full-width {
    grid-column: 1 / -1;
  }
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #0FB3BA;
    box-shadow: 0 0 0 3px rgba(15, 179, 186, 0.1);
  }

  &:invalid {
    border-color: #ff4757;
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #0FB3BA;
    box-shadow: 0 0 0 3px rgba(15, 179, 186, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #0FB3BA;
    box-shadow: 0 0 0 3px rgba(15, 179, 186, 0.1);
  }
`;

const ConnectionsContainer = styled.div`
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  background: #f9f9f9;
`;

const ConnectionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const ConnectionInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0FB3BA;
  }
`;

const RemoveButton = styled.button`
  background: #ff4757;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s ease;

  &:hover {
    background: #ff3742;
  }
`;

const AddButton = styled.button`
  background: #0FB3BA;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 8px;
  transition: background 0.2s ease;

  &:hover {
    background: #0ea5ac;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 2px solid #f0f0f0;
`;

const CancelButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s ease;

  &:hover {
    background: #5a6268;
  }
`;

const SaveButton = styled.button`
  background: #0FB3BA;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s ease;

  &:hover {
    background: #0ea5ac;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.div`
  color: #ff4757;
  font-size: 12px;
  margin-top: 4px;
`;

const OrganisationModal = ({ isOpen, onClose, onSave, initialData = null, existingOrganisations = [] }) => {
  const [formData, setFormData] = useState({
    organisation_id: '',
    state: '',
    tier: '',
    organisation: '',
    organisation_type: '',
    address: '',
    comments: '',
    connections: [],
    latitude: '',
    longitude: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // States dan tiers yang tersedia
  // const states = [
  //   'Australian Capital Territory', 'New South Wales', 'Northern Territory', 
  //   'Queensland', 'South Australia', 'Tasmania', 'Victoria', 'Western Australia'
  // ];

  // const tiers = [1, 2, 3, 4, 5];

  // const organisationTypes = [
  //   'Government', 'Private', 'NGO', 'Academic', 'Research', 'Community', 'International'
  // ];

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        let incomingConnections = initialData.connections;
        if (typeof incomingConnections === 'string') {
          try { incomingConnections = JSON.parse(incomingConnections); } catch { incomingConnections = []; }
        }
        if (!Array.isArray(incomingConnections)) incomingConnections = [];
        const rawTier = initialData.tier;
        // Previously hid tier when not numeric; now always display original value if present
        // const tierValue = (rawTier !== undefined && rawTier !== null) ? String(rawTier) : '';
        const pickVal = (primary, alt) => (primary !== undefined && primary !== null ? primary : (alt !== undefined && alt !== null ? alt : ''));
        const rawLat = pickVal(initialData.latitude, initialData.lat);
        const rawLng = pickVal(initialData.longitude, initialData.lng);
        const sanitizeNumString = (v) => {
          if (v === '' || v === null || v === undefined) return '';
            const s = String(v).trim().replace(',', '.');
            return isNaN(parseFloat(s)) ? '' : s;
        };
        setFormData({
          organisation_id: initialData.organisation_id ?? '',
          state: initialData.state ?? '',
          tier: initialData.tier ?? '',
          organisation: initialData.organisation ?? '',
          organisation_type: initialData.organisation_type ?? '',
          address: initialData.address ?? '',
          comments: initialData.comments ?? '',
          connections: incomingConnections,
          latitude: sanitizeNumString(rawLat),
          longitude: sanitizeNumString(rawLng)
        });
      } else {
        setFormData({
          organisation_id: '',
          state: '',
          tier: '',
          organisation: '',
          organisation_type: '',
          address: '',
          comments: '',
          connections: [],
          latitude: '',
          longitude: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleConnectionChange = (index, value) => {
    const newConnections = [...formData.connections];
    newConnections[index] = parseInt(value) || value;
    setFormData(prev => ({
      ...prev,
      connections: newConnections
    }));
  };

  const addConnection = () => {
    setFormData(prev => ({
      ...prev,
      connections: [...prev.connections, '']
    }));
  };

  const removeConnection = (index) => {
    const newConnections = formData.connections.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      connections: newConnections
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.organisation.trim()) {
      newErrors.organisation = 'Organisation name is required';
    }

    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    if (!formData.tier) {
      newErrors.tier = 'Tier is required';
    }

    if (!formData.organisation_type) {
      newErrors.organisation_type = 'Organisation type is required';
    }

    if (formData.latitude && (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90)) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    if (formData.longitude && (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180)) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    // Validate connections
    const invalidConnections = formData.connections.filter(conn => {
      const connId = parseInt(conn);
      return isNaN(connId) || connId <= 0;
    });

    if (invalidConnections.length > 0) {
      newErrors.connections = 'All connections must be valid organisation IDs';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const dataToSave = {
        ...formData,
        // tier: formData.tier !== '' ? String(formData.tier) : null,
        latitude: formData.latitude !== '' ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude !== '' ? parseFloat(formData.longitude) : null,
        connections: formData.connections.filter(conn => conn !== '').map(conn => parseInt(conn))
      };
      await onSave(dataToSave, !!initialData); // pass isEdit flag
      onClose();
    } catch (error) {
      console.error('Error saving data:', error);
      setErrors({ general: 'Failed to save data. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            {initialData ? '✏️ Edit Organisation' : '➕ Add New Organisation'}
          </ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        {errors.general && (
          <ErrorText style={{ marginBottom: '16px', fontSize: '14px' }}>
            {errors.general}
          </ErrorText>
        )}

        <FormGrid>
          <FormGroup>
            <Label htmlFor="organisation">Organisation Name *</Label>
            <Input
              id="organisation"
              type="text"
              value={formData.organisation}
              onChange={(e) => handleInputChange('organisation', e.target.value)}
              placeholder="Enter organisation name"
            />
            {errors.organisation && <ErrorText>{errors.organisation}</ErrorText>}
          </FormGroup>

          {/* CHANGED: Organisation Type free text */}
          <FormGroup>
            <Label htmlFor="organisation_type">Organisation Type *</Label>
            <Input
              id="organisation_type"
              type="text"
              value={formData.organisation_type}
              onChange={(e) => handleInputChange('organisation_type', e.target.value)}
              placeholder="Enter organisation type (e.g., Government, Private, NGO)"
            />
            {errors.organisation_type && <ErrorText>{errors.organisation_type}</ErrorText>}
          </FormGroup>

          {/* CHANGED: State free text */}
          <FormGroup>
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              type="text"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="Enter state / region"
            />
            {errors.state && <ErrorText>{errors.state}</ErrorText>}
          </FormGroup>

          {/* CHANGED: Tier free text (numeric) */}
          <FormGroup>
            <Label htmlFor="tier">Tier *</Label>
            <Input
              id="tier"
              type="text" /* changed from number to text to allow any value */
              value={formData.tier}
              onChange={(e) => handleInputChange('tier', e.target.value)}
              placeholder="Enter tier"
            />
            {errors.tier && <ErrorText>{errors.tier}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => handleInputChange('latitude', e.target.value.replace(/,/g,'.'))}
              placeholder="e.g., -33.8688"
            />
            {errors.latitude && <ErrorText>{errors.latitude}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => handleInputChange('longitude', e.target.value.replace(/,/g,'.'))}
              placeholder="e.g., 151.2093"
            />
            {errors.longitude && <ErrorText>{errors.longitude}</ErrorText>}
          </FormGroup>

          <FormGroup className="full-width">
            <Label htmlFor="address">Address</Label>
            <TextArea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter full address"
            />
          </FormGroup>

          <FormGroup className="full-width">
            <Label htmlFor="comments">Comments</Label>
            <TextArea
              id="comments"
              value={formData.comments}
              onChange={(e) => handleInputChange('comments', e.target.value)}
              placeholder="Additional comments or notes"
            />
          </FormGroup>

          <FormGroup className="full-width">
            <Label>Connections (Organisation IDs)</Label>
            <ConnectionsContainer>
              {formData.connections.length === 0 ? (
                <div style={{ color: '#666', fontStyle: 'italic', marginBottom: '8px' }}>
                  No connections added yet
                </div>
              ) : (
                formData.connections.map((connection, index) => (
                  <ConnectionItem key={index}>
                    <ConnectionInput
                      type="number"
                      value={connection}
                      onChange={(e) => handleConnectionChange(index, e.target.value)}
                      placeholder="Organisation ID"
                    />
                    <RemoveButton onClick={() => removeConnection(index)}>
                      Remove
                    </RemoveButton>
                  </ConnectionItem>
                ))
              )
              }
              <AddButton onClick={addConnection}>
                + Add Connection
              </AddButton>
              {errors.connections && <ErrorText>{errors.connections}</ErrorText>}
            </ConnectionsContainer>
          </FormGroup>
        </FormGrid>

        <ButtonGroup>
          <CancelButton onClick={onClose}>
            Cancel
          </CancelButton>
          <SaveButton onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : (initialData ? 'Update' : 'Create')}
          </SaveButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default OrganisationModal;
