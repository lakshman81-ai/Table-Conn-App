import { useState } from 'react';
import Papa from 'papaparse';

export default function useTables(addLog) {
  const [tables, setTables] = useState([]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);

    files.forEach((file) => {
      Papa.parse(file, {
        preview: 6,
        complete: (results) => {
          const dataRows = results.data.slice(1);
          const newTable = {
            id: `table-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: file.name,
            headers: results.data[0] || [],
            rows: dataRows,
            rowCount: dataRows.length
          };
          setTables(prev => [...prev, newTable]);
          addLog(`Loaded ${file.name} with ${results.data[0]?.length || 0} columns.`);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          addLog(`Error parsing ${file.name}: ${error.message}`);
        }
      });
    });
  };

  return { tables, handleFileUpload };
}
