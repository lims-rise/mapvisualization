'use client';

import React from 'react';
import styled from 'styled-components';

const ToolbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  margin-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RightSection = styled.div`
  display: flex;
  gap: 8px;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const CountBadge = styled.span`
  background-color: #f3f4f6;
  color: #6b7280;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid;
  cursor: pointer;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  ${props => props.variant === 'primary' && `
    background-color: #3b82f6;
    color: white;
    border-color: #3b82f6;

    &:hover:not(:disabled) {
      background-color: #2563eb;
    }
  `}

  ${props => props.variant === 'secondary' && `
    background-color: white;
    color: #374151;
    border-color: #d1d5db;

    &:hover:not(:disabled) {
      background-color: #f9fafb;
      border-color: #9ca3af;
    }
  `}

  ${props => props.variant === 'danger' && `
    background-color: #ef4444;
    color: white;
    border-color: #ef4444;

    &:hover:not(:disabled) {
      background-color: #dc2626;
    }
  `}
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 8px 12px 8px 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background-color: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const SearchIcon = styled.svg`
  position: absolute;
  left: 12px;
  width: 16px;
  height: 16px;
  color: #9ca3af;
  pointer-events: none;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
  }

  ${props => props.active && `
    background-color: #3b82f6;
    color: white;
    border-color: #3b82f6;
  `}
`;

const CrudToolbar = ({
  title = "Data Management",
  totalCount = 0,
  selectedCount = 0,
  searchValue = "",
  onSearchChange,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onFilterClick,
  filters = [],
  activeFilters = [],
  isLoading = false
}) => {
  const hasSelection = selectedCount > 0;

  return (
    <ToolbarContainer>
      <LeftSection>
        <Title>{title}</Title>
        <CountBadge>
          {selectedCount > 0 ? `${selectedCount} selected` : `${totalCount} total`}
        </CountBadge>
      </LeftSection>

      <RightSection>
        {/* Search */}
        <SearchContainer>
          <SearchIcon viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search organisations..."
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </SearchContainer>

        {/* Filters */}
        {filters.length > 0 && (
          <FilterButton
            onClick={onFilterClick}
            active={activeFilters.length > 0}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            Filter
            {activeFilters.length > 0 && (
              <CountBadge style={{ backgroundColor: '#3b82f6', color: 'white', marginLeft: '4px' }}>
                {activeFilters.length}
              </CountBadge>
            )}
          </FilterButton>
        )}

        {/* CRUD Actions */}
        <ActionButton
          variant="primary"
          onClick={onAddClick}
          disabled={isLoading}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New
        </ActionButton>

        <ActionButton
          variant="secondary"
          onClick={onEditClick}
          disabled={!hasSelection || selectedCount > 1 || isLoading}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Edit
        </ActionButton>

        <ActionButton
          variant="danger"
          onClick={onDeleteClick}
          disabled={!hasSelection || isLoading}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          Delete {selectedCount > 1 ? `(${selectedCount})` : ''}
        </ActionButton>
      </RightSection>
    </ToolbarContainer>
  );
};

export default CrudToolbar;
