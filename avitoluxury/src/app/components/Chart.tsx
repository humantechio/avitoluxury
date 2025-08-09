'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
  type: 'line';
  data: ChartData<'line'>;
  title: string;
  height?: number;
}

interface BarChartProps {
  type: 'bar';
  data: ChartData<'bar'>;
  title: string;
  height?: number;
}

type ChartProps = LineChartProps | BarChartProps;

const Chart: React.FC<ChartProps> = ({ type, data, title, height = 300 }) => {
  const options: ChartOptions<typeof type> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow" style={{ height: `${height}px` }}>
      {type === 'line' ? (
        <Line options={options as ChartOptions<'line'>} data={data as ChartData<'line'>} />
      ) : (
        <Bar options={options as ChartOptions<'bar'>} data={data as ChartData<'bar'>} />
      )}
    </div>
  );
};

export default Chart; 