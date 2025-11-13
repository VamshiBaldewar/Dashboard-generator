import React, { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { motion } from 'framer-motion';

const inferColumnTypes = (data) => {
  if (!data || data.length === 0) {
    return {};
  }
  const types = {};
  const keys = Object.keys(data[0]);
  keys.forEach((key) => {
    let isNumeric = true;
    for (let i = 0; i < data.length; i++) {
      const value = data[i][key];
      if (value !== null && value !== '' && isNaN(Number(value))) {
        isNumeric = false;
        break;
      }
    }
    types[key] = isNumeric ? 'numeric' : 'string';
  });
  return types;
};

const cleanData = (data) => {
  const columnTypes = inferColumnTypes(data);
  return data.map((row) => {
    const newRow = {};
    for (const key in row) {
      if (columnTypes[key] === 'numeric') {
        const value = row[key];
        if (typeof value === 'string') {
          const num = parseFloat(value.replace(/[^0-9.-]+/g, ''));
          newRow[key] = isNaN(num) ? null : num;
        } else if (typeof value === 'number') {
          newRow[key] = value;
        } else {
          newRow[key] = null;
        }
      } else {
        newRow[key] = row[key];
      }
    }
    return newRow;
  });
};

function App() {
  const [data, setData] = useState([]);
  const [columnTypes, setColumnTypes] = useState({});
  const [open, setOpen] = useState(true);

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    const extension = file.name.split('.').pop().toLowerCase();

    reader.onload = (event) => {
      const fileContent = event.target.result;
      let parsedData = [];
      if (extension === 'csv') {
        Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            parsedData = results.data;
            const cleaned = cleanData(parsedData);
            setData(cleaned);
            setColumnTypes(inferColumnTypes(cleaned));
          },
        });
      } else if (extension === 'xlsx' || extension === 'xls') {
        const workbook = XLSX.read(fileContent, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        parsedData = XLSX.utils.sheet_to_json(sheet);
        const cleaned = cleanData(parsedData);
        setData(cleaned);
        setColumnTypes(inferColumnTypes(cleaned));
      }
    };

    if (extension === 'csv') {
      reader.readAsText(file);
    } else if (extension === 'xlsx' || extension === 'xls') {
      reader.readAsBinaryString(file);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header open={open} handleDrawerOpen={() => setOpen(true)} />
      <Sidebar open={open} handleDrawerClose={() => setOpen(false)} onFileUpload={handleFileUpload} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%' }}
      >
        <Dashboard data={data} columnTypes={columnTypes} open={open} />
      </motion.div>
    </Box>
  );
}

export default App;
