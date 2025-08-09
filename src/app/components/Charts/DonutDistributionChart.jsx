"use client";

import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Card, CardContent, Typography, Box } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

function buildColors(n, baseHue = 200) {
  const colors = [];
  for (let i = 0; i < n; i++) {
    const hue = (baseHue + i * (360 / Math.max(n, 1))) % 360;
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }
  return colors;
}

/**
 * Reusable doughnut chart to show categorical distribution.
 * Props:
 * - title: string
 * - data: array of objects
 * - groupBy: string key to group by
 * - baseHue: number for palette variation
 */
const DonutDistributionChart = ({ title = 'Distribution', data = [], groupBy = 'state', baseHue = 200 }) => {
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

  const palette = useMemo(() => buildColors(labels.length, baseHue), [labels.length, baseHue]);

  const chartData = {
    labels,
    datasets: [
      {
        label: `${groupBy} share`,
        data: counts,
        backgroundColor: palette,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
      title: { display: true, text: title },
      tooltip: {
        callbacks: {
          label: function(ctx) {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0) || 1;
            const value = ctx.parsed;
            const pct = ((value / total) * 100).toFixed(1);
            return `${ctx.label}: ${value} (${pct}%)`;
          }
        }
      }
    },
    cutout: '60%',
  };

  return (
    <Card elevation={8} sx={{ borderRadius: 3 }}>
      <CardContent>
        <Box sx={{ height: 320 }}>
          <Doughnut data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default DonutDistributionChart;
