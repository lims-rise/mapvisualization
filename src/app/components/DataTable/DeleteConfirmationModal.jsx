"use client";

import React from 'react';
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
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  text-align: center;
`;

const WarningIcon = styled.div`
  font-size: 48px;
  color: #ff4757;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  color: #333;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 12px 0;
`;

const Message = styled.p`
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 8px 0;
`;

const OrganisationInfo = styled.div`
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  margin: 16px 0;
  border-left: 4px solid #ff4757;
`;

const OrganisationName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 16px;
  margin-bottom: 4px;
`;

const OrganisationDetails = styled.div`
  font-size: 12px;
  color: #666;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
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

const DeleteButton = styled.button`
  background: #ff4757;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s ease;

  &:hover {
    background: #ff3742;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, items = [], isLoading = false }) => {
  if (!isOpen || !items.length) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const isSingleItem = items.length === 1;
  const organisationData = isSingleItem ? items[0] : null;

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContent>
        <WarningIcon>⚠️</WarningIcon>
        
        <Title>Delete Organisation{!isSingleItem ? 's' : ''}</Title>
        
        <Message>
          Are you sure you want to delete {isSingleItem ? 'this organisation' : `these ${items.length} organisations`}? This action cannot be undone.
        </Message>

        {isSingleItem ? (
          <OrganisationInfo>
            <OrganisationName>
              {organisationData.organisation || 'Unknown Organisation'}
            </OrganisationName>
            <OrganisationDetails>
              ID: {organisationData.organisation_id} | 
              State: {organisationData.state || 'N/A'} | 
              Type: {organisationData.organisation_type || 'N/A'}
            </OrganisationDetails>
          </OrganisationInfo>
        ) : (
          <OrganisationInfo>
            <OrganisationName>
              Multiple organisations selected
            </OrganisationName>
            <OrganisationDetails>
              {items.map(item => item.organisation || `ID: ${item.organisation_id}`).join(', ')}
            </OrganisationDetails>
          </OrganisationInfo>
        )}

        <Message style={{ fontSize: '12px', color: '#ff4757', fontWeight: '600' }}>
          All related connections and data will be permanently removed.
        </Message>

        <ButtonGroup>
          <CancelButton onClick={onClose} disabled={isLoading}>
            Cancel
          </CancelButton>
          <DeleteButton onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </DeleteButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default DeleteConfirmationModal;
