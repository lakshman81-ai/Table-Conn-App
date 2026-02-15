import { useState, useCallback } from 'react';

export default function useLogs() {
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((message) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev]);
  }, []);

  return { logs, addLog };
}
