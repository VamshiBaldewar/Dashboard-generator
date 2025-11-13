import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Paper, Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

const ChartGenerator = ({ data, columnTypes, onFilter }) => {
  if (!data || data.length === 0 || !columnTypes || Object.keys(columnTypes).length === 0) {
    return null;
  }

  const numericKeys = Object.keys(columnTypes).filter(
    (key) => columnTypes[key] === 'numeric'
  );
  const stringKeys = Object.keys(columnTypes).filter(
    (key) => columnTypes[key] === 'string'
  );

  const charts = [];

  const handleBarClick = (data, xKey) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const { payload } = data.activePayload[0];
      onFilter(xKey, payload[xKey]);
    }
  };

  const handlePieClick = (data, nameKey) => {
    onFilter(nameKey, data.name);
  };

  // Generate Bar Charts (String vs. Numeric)
  stringKeys.forEach((xKey) => {
    numericKeys.forEach((yKey) => {
      charts.push(
        <Grid item xs={12} md={6} lg={4} key={`${xKey}-${yKey}-bar`}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="h6">{`${yKey} by ${xKey}`}</Typography>
              <ResponsiveContainer>
                <BarChart data={data} onClick={(d) => handleBarClick(d, xKey)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xKey} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={yKey} fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </motion.div>
        </Grid>
      );
    });
  });

  // Generate Line Charts (Numeric vs. Numeric)
  if (numericKeys.length >= 2) {
    const xKey = numericKeys[0];
    numericKeys.slice(1).forEach((yKey) => {
      charts.push(
        <Grid item xs={12} md={6} lg={4} key={`${xKey}-${yKey}-line`}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="h6">{`${yKey} over ${xKey}`}</Typography>
              <ResponsiveContainer>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xKey} type="number" domain={['dataMin', 'dataMax']} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey={yKey} stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </motion.div>
        </Grid>
      );
    });
  }

  // Generate Area Charts (Numeric vs. Numeric)
  if (numericKeys.length >= 2) {
    const xKey = numericKeys[0];
    numericKeys.slice(1).forEach((yKey) => {
      charts.push(
        <Grid item xs={12} md={6} lg={4} key={`${xKey}-${yKey}-area`}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="h6">{`Area Chart: ${yKey} over ${xKey}`}</Typography>
              <ResponsiveContainer>
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xKey} type="number" domain={['dataMin', 'dataMax']} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey={yKey} stroke="#ffc658" fill="#ffc658" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </motion.div>
        </Grid>
      );
    });
  }

  // Generate Pie Charts (String vs. Numeric)
  stringKeys.forEach((nameKey) => {
    numericKeys.forEach((valueKey) => {
      const pieData = data
        .reduce((acc, row) => {
          const existing = acc.find((item) => item.name === row[nameKey]);
          if (existing) {
            existing.value += row[valueKey];
          } else {
            acc.push({ name: row[nameKey], value: row[valueKey] });
          }
          return acc;
        }, [])
        .filter((item) => item.value > 0);

      if (pieData.length > 1 && pieData.length < 20) { // Only render pie charts with a reasonable number of slices
        charts.push(
          <Grid item xs={12} md={6} lg={4} key={`${nameKey}-${valueKey}-pie`}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <Paper sx={{ p: 2, height: 300 }}>
                <Typography variant="h6">{`Pie Chart: ${valueKey} by ${nameKey}`}</Typography>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          onClick={() => handlePieClick(entry, nameKey)}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </motion.div>
          </Grid>
        );
      }
    });
  });


  if (charts.length === 0) {
    return (
      <Typography variant="h6" sx={{ mt: 3 }}>
        No suitable charts could be generated for this data. Please check your data and try again.
      </Typography>
    );
  }

  return (
    <Grid container spacing={3} sx={{ mt: 3 }}>
      {charts}
    </Grid>
  );
};

export default ChartGenerator;
