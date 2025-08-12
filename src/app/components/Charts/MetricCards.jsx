"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import PublicIcon from '@mui/icons-material/Public';
import CategoryIcon from '@mui/icons-material/Category';

const StatCard = ({ icon, label, value, color = '#0FB3BA' }) => (
  <Card elevation={8} sx={{ borderRadius: 3 }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: 'rgba(15,179,186,0.1)',
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{value}</Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const MetricCards = ({ data = [] }) => {
  const total = data?.length || 0;
  const byState = useMemo(() => new Set(data.map(d => d.state).filter(Boolean)).size, [data]);
  const byType = useMemo(() => new Set(data.map(d => d.organisation_type).filter(Boolean)).size, [data]);

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 2 }}>
      <StatCard icon={<GroupsIcon />} label="Total Organisations" value={total} color="#1976d2" />
      <StatCard icon={<PublicIcon />} label="Unique States" value={byState} color="#0FB3BA" />
      <StatCard icon={<CategoryIcon />} label="Unique Types" value={byType} color="#8e44ad" />
    </Box>
  );
};

export default MetricCards;
