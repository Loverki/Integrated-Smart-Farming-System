import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import api from '../api/axios';

const SensorCharts = ({ farmId, sensorType, startDate, endDate }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [thresholds, setThresholds] = useState({ criticalMin: null, criticalMax: null, warningMin: null, warningMax: null });

  useEffect(() => {
    if (farmId && sensorType) {
      fetchChartData();
      fetchThresholds();
    }
  }, [farmId, sensorType, startDate, endDate]);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('farmId', farmId);
      params.append('sensorType', sensorType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/admin/sensors/readings?${params.toString()}`);
      const readings = response.data.readings || [];

      // Transform data for chart
      const formattedData = readings
        .map(reading => ({
          date: new Date(reading.recordedDate).toLocaleString(),
          timestamp: new Date(reading.recordedDate).getTime(),
          value: reading.sensorValue,
          status: reading.status
        }))
        .sort((a, b) => a.timestamp - b.timestamp);

      setChartData(formattedData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchThresholds = async () => {
    try {
      // Get default thresholds from service (hardcoded for now, could be API call)
      const defaults = {
        SOIL_MOISTURE: { criticalMin: 20, criticalMax: 80, warningMin: 30, warningMax: 70 },
        SOIL_PH: { criticalMin: 5.0, criticalMax: 8.5, warningMin: 6.0, warningMax: 7.5 },
        TEMPERATURE: { criticalMin: 5, criticalMax: 40, warningMin: 10, warningMax: 35 },
        HUMIDITY: { criticalMin: 30, criticalMax: 95, warningMin: 40, warningMax: 85 }
      };
      
      const sensorDefaults = defaults[sensorType] || defaults.TEMPERATURE;
      setThresholds(sensorDefaults);
    } catch (error) {
      console.error('Error fetching thresholds:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading chart data...</div>;
  }

  if (chartData.length === 0) {
    return <div className="text-center py-8 text-gray-500">No data available for the selected filters</div>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'CRITICAL': return '#ef4444';
      case 'WARNING': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          
          {/* Threshold reference lines */}
          {thresholds.criticalMin && (
            <ReferenceLine 
              y={thresholds.criticalMin} 
              stroke="#ef4444" 
              strokeDasharray="5 5" 
              label={{ value: "Critical Min", position: "insideTopLeft" }}
            />
          )}
          {thresholds.criticalMax && (
            <ReferenceLine 
              y={thresholds.criticalMax} 
              stroke="#ef4444" 
              strokeDasharray="5 5" 
              label={{ value: "Critical Max", position: "insideTopLeft" }}
            />
          )}
          {thresholds.warningMin && (
            <ReferenceLine 
              y={thresholds.warningMin} 
              stroke="#f59e0b" 
              strokeDasharray="3 3" 
              label={{ value: "Warning Min", position: "insideTopLeft" }}
            />
          )}
          {thresholds.warningMax && (
            <ReferenceLine 
              y={thresholds.warningMax} 
              stroke="#f59e0b" 
              strokeDasharray="3 3" 
              label={{ value: "Warning Max", position: "insideTopLeft" }}
            />
          )}
          
          {/* Sensor value line */}
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            name="Sensor Value"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SensorCharts;

