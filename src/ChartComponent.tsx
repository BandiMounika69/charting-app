import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";
import "./ChartComponent.css";

interface DataPoint {
  timestamp: string;
  value: number;
}

const ChartComponent: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [timeframe, setTimeframe] = useState("daily");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    fetch("/data.json")
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => {
        console.error("Error fetching data:", error);
        // Handle errors, e.g., set an error state or notify the user
      });
  };

  const handleTimeframeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setTimeframe(event.target.value);
  };

  const formatDataForTimeframe = (
    data: DataPoint[],
    timeframe: string
  ): DataPoint[] => {
    if (timeframe === "weekly") {
      const weeklyData: { [key: string]: DataPoint } = {};
      data.forEach((point) => {
        const week = new Date(point.timestamp).toISOString().slice(0, 10);
        if (!weeklyData[week]) {
          weeklyData[week] = { timestamp: week, value: 0 };
        }
        weeklyData[week].value += point.value;
      });
      return Object.values(weeklyData);
    } else if (timeframe === "monthly") {
      const monthlyData: { [key: string]: DataPoint } = {};
      data.forEach((point) => {
        const month = new Date(point.timestamp).toISOString().slice(0, 7);
        if (!monthlyData[month]) {
          monthlyData[month] = { timestamp: month, value: 0 };
        }
        monthlyData[month].value += point.value;
      });
      return Object.values(monthlyData);
    }
    return data;
  };

  const handleClick = (data: DataPoint) => {
    alert(`Timestamp: ${data.timestamp}\nValue: ${data.value}`);
  };

  const exportChart = (format: "jpg" | "png") => {
    const chartElement = document.querySelector(
      ".recharts-wrapper"
    ) as HTMLElement;
    if (chartElement) {
      html2canvas(chartElement).then((canvas) => {
        const link = document.createElement("a");
        link.download = `chart.${format}`;
        link.href = canvas.toDataURL(`image/${format}`);
        link.click();
      });
    }
  };

  const formattedData = formatDataForTimeframe(data, timeframe);

  return (
    <div className="chart-container">
      <div className="chart-controls">
        <select value={timeframe} onChange={handleTimeframeChange}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <button onClick={() => exportChart("png")}>Export as PNG</button>
        <button onClick={() => exportChart("jpg")}>Export as JPG</button>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={formattedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
            onClick={(event: any) => {
              const activePayload = event?.activePayload;
              if (activePayload && activePayload.length) {
                handleClick(activePayload[0].payload);
              }
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartComponent;
