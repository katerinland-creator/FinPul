import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register globally once
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Global styling defaults for clean modern dark canvas
ChartJS.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
ChartJS.defaults.color = '#94a3b8'; // slate-400
ChartJS.defaults.borderColor = 'rgba(51, 65, 85, 0.4)'; // slate-700/40

export default ChartJS;
