import React, { useState, useEffect } from 'react';
import '../theme.css';
import supabaseService from '../services/supabaseService';
import { excelService } from '../services/excelService';

export default function TableBookingSystem() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    const data = await supabaseService.getAllTables();
    setTables(data);
    setLoading(false);
  };

  const handleExport = () => {
    excelService.exportToExcel(tables);
  };

  const handleClick = (table) => {
    // TODO: implement booking modal
    console.log('Clicked table', table);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col container">
      <button className="btn mb-4" onClick={handleExport}>
        Export to Excel
      </button>
      <div className="table-grid" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
        {tables.map((t) => (
          <div
            key={t.table_id}
            className={`table-cell status-${t.booking_status || 'available'}`}
            onClick={() => handleClick(t)}
          >
            {t.table_id}
          </div>
        ))}
      </div>
    </div>
  );
}
