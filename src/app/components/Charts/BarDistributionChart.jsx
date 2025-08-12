"use client";

import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, Typography, Box } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * Reusable bar chart to show distribution by a categorical field.
 * Props:
 * - title: string
 * - data: array of objects (dataset from DB)
 * - groupBy: string (key to group by, e.g., 'state' or 'organisation_type')
 * - color: string (bar color)
 */
const BarDistributionChart = ({ title = 'Distribution', data = [], groupBy = 'state', color = '#0FB3BA' }) => {
  const { labels, counts } = useMemo(() => {
    const map = new Map();
    (Array.isArray(data) ? data : []).forEach(item => {
      const key = item?.[groupBy] ?? 'Unknown';
      map.set(key, (map.get(key) || 0) + 1);
    });
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    return {
      labels: sorted.map(([k]) => String(k)),
      counts: sorted.map(([, v]) => v),
    };
  }, [data, groupBy]);

  const chartData = {
    labels,
    datasets: [
      {
        label: `${groupBy} count`,
        data: counts,
        backgroundColor: color,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: title },
      tooltip: {
        callbacks: {
          label: function(context) {
            const v = context.parsed.y;
            const l = context.label;
            return `${l}: ${v} item(s)`;
          }
        }
      }
    },
    scales: {
      x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 } },
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  return (
    <Card elevation={8} sx={{ borderRadius: 3 }}>
      <CardContent>
        <Box sx={{ height: 320 }}>
          <Bar data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default BarDistributionChart;
