"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import React from "react";
import { notFound } from "next/navigation";
import { useTheme } from "@/app/providers/ThemeProvider";
import useRequireAuth from '@/app/hooks/useRequireAuth';
import useProfile from '@/app/hooks/useProfile';
import DashboardTopBar from "@/app/components/layout/DashboardTopBar";
import AdminSidebar from "@/app/components/layout/AdminSidebar";
import { API_CONFIG } from "@/app/config/constants";


type TableType = 'users' | 'scans' | 'premium_scans';

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

export default function AdminDatabasePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  const { token, initialized, auth: authFromHook } = useRequireAuth();
  const auth = authFromHook;
  const { profileName } = useProfile(token);

  const [activeTable, setActiveTable] = useState<TableType>('users');
  const [dbData, setDbData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  
  const itemsPerPage = 15;

  // Reset stanu paginacji przy zmianie tabeli, zapytania lub sortowania
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTable, searchQuery, sortConfig]);

  // Pobieranie danych z API
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setSortConfig(null); // Reset sortowania przy zmianie tabeli
      
      try {
        const backendUrl = API_CONFIG.BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/admin/database?table=${activeTable}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data = await response.json();
        setDbData(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setDbData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTable, token]);

  // 1. Krok: Filtrowanie po wyszukiwarce
  const filteredData = useMemo(() => {
    if (!searchQuery) return dbData;

    const query = searchQuery.toLowerCase();
    return dbData.filter(row => 
      Object.values(row).some(val => {
        if (val === null || val === undefined) return false;
        if (typeof val === 'object') return JSON.stringify(val).toLowerCase().includes(query);
        return String(val).toLowerCase().includes(query);
      })
    );
  }, [dbData, searchQuery]);

  // 2. Krok: Dynamiczne sortowanie
  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Zabezpieczenie przed null / undefined (spychamy je na dół)
        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        // Porównywanie (zadziała dla stringów, liczb i dat w ISO)
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableItems;
  }, [filteredData, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  
  // 3. Krok: Paginacja posortowanych danych
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    // Jeśli kliknęliśmy w tę samą kolumnę i było rosnąco, zmień na malejąco
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  if (!initialized) return null;
  if (!token) return null;
  if (!auth.user) return null;
  if (auth.user.role !== 'admin') notFound();

  const renderCellValue = (key: string, value: any) => {
    if (value === null || value === undefined) return <span className="text-zinc-400">-</span>;

    if (key === 'status') {
      const statusStr = String(value).toLowerCase();
      const isActive = statusStr === 'active' || statusStr === 'safe' || statusStr === 'completed';
      const isWarning = statusStr === 'warning' || statusStr === 'pending';
      
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold tracking-widest uppercase border
          ${isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
            isWarning ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
            'bg-red-500/10 text-red-500 border-red-500/20'}`}>
          {String(value)}
        </span>
      );
    }

    if (key === 'role') {
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold tracking-widest uppercase border ${value === 'admin' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'}`}>
          {String(value)}
        </span>
      );
    }

    if (key.endsWith('_at') && typeof value === 'string') {
      return new Date(value).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'medium' });
    }

    if (Array.isArray(value)) {
      return (
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          [{value.length} items]
        </span>
      );
    }

    if (typeof value === 'object') {
      return <span className="text-xs text-zinc-400">{'Object {...}'}</span>;
    }

    return String(value);
  };

  const renderTableHeaders = () => {
    // Bierzemy nagłówki z pierwszego elementu w całych danych (żeby nagłówki zostały nawet jak search nic nie znajdzie)
    if (dbData.length === 0) return null; 
    const columns = Object.keys(dbData[0]);
    
    return (
      <tr>
        {columns.map((col) => {
          const isSortedByThis = sortConfig?.key === col;
          return (
            <th 
              key={col} 
              onClick={() => handleSort(col)}
              className="px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-left border-b border-zinc-200/60 dark:border-zinc-800/40 bg-zinc-50 dark:bg-zinc-900 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors group select-none"
            >
              <div className="flex items-center gap-2">
                {col.replace(/_/g, ' ')}
                
                {/* Kontener na strzałeczki sortowania */}
                <div className="flex flex-col text-[10px] leading-none opacity-40 group-hover:opacity-100 transition-opacity">
                  <i className={`ri-arrow-up-s-line -mb-1 ${isSortedByThis && sortConfig.direction === 'asc' ? 'text-cyan-500 opacity-100' : ''}`}></i>
                  <i className={`ri-arrow-down-s-line ${isSortedByThis && sortConfig.direction === 'desc' ? 'text-cyan-500 opacity-100' : ''}`}></i>
                </div>
              </div>
            </th>
          );
        })}
      </tr>
    );
  };

  const renderTableRows = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={100} className="px-4 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex flex-col items-center justify-center gap-2">
              <i className="ri-loader-4-line animate-spin text-2xl text-cyan-500"></i>
              <p>Loading...</p>
            </div>
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={100} className="px-4 py-12 text-center text-sm text-red-500 dark:text-red-400">
            Unknown error: {error}
          </td>
        </tr>
      );
    }

    if (paginatedData.length === 0) {
      return (
        <tr>
          <td colSpan={100} className="px-4 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {searchQuery ? 'No matching data found.' : 'Table is empty.'}
          </td>
        </tr>
      );
    }

    return paginatedData.map((row, idx) => (
      <tr key={row.id || idx} className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/20 transition-colors border-b border-zinc-200/60 dark:border-zinc-800/40 last:border-0">
        {Object.entries(row).map(([key, value], i) => (
          <td key={`${key}-${i}`} className="px-4 py-3 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300">
            {renderCellValue(key, value)}
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div className="h-screen xl:flex bg-zinc-200 dark:bg-zinc-950 transition-colors select-none">
        <AdminSidebar 
        sidebarOpen={sidebarOpen} 
        profileName={profileName} 
        onLogout={() => auth.logout()} 
        activePage="database" 
        />
      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen xl:ml-0">
        <DashboardTopBar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          theme={theme}
          onToggleTheme={toggleTheme}
          showSearch
          searchPlaceholder="Search users, scans, reports..."
          showNotifications
          showMessages
        />

        <main className="flex-1 flex flex-col overflow-y-auto bg-zinc-100 dark:bg-zinc-950 scrollbar-theme p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Database</h2>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Browse and manage database entries.
              </p>
            </div>

            {/* Przełączanie tabel */}
            <div className="flex bg-white/85 dark:bg-zinc-900/20 border border-zinc-300 dark:border-zinc-800/60 rounded-xl p-1 shadow-sm">
              {(['users', 'scans', 'premium_scans'] as TableType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTable(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                    activeTable === tab 
                      ? 'bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20 shadow-sm' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 border border-transparent'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Główny kontener tabeli */}
          <div className="flex flex-col flex-1 bg-white/90 dark:bg-zinc-900/40 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-800/40 rounded-2xl shadow-sm overflow-hidden min-h-0">
            
            {/* Pasek narzędzi tabeli */}
            <div className="p-4 border-b border-zinc-200/60 dark:border-zinc-800/40 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-96">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                <input
                  type="text"
                  placeholder={`Search ${activeTable}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-zinc-800/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 dark:text-zinc-200 transition-all placeholder:text-zinc-500 dark:placeholder:text-zinc-500"
                />
              </div>
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Found: <span className="text-zinc-900 dark:text-zinc-100">{sortedData.length}</span>
              </div>
            </div>

            {/* Obszar przewijania tabeli */}
            <div className="flex-1 overflow-auto scrollbar-theme">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  {renderTableHeaders()}
                </thead>
                <tbody>
                  {renderTableRows()}
                </tbody>
              </table>
            </div>

            {/* Paginacja */}
            {totalPages > 1 && dbData.length > 0 && (
              <div className="px-4 py-3 border-t border-zinc-200/60 dark:border-zinc-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50/30 dark:bg-zinc-950/20">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Showing <span className="font-semibold text-zinc-700 dark:text-zinc-300">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-semibold text-zinc-700 dark:text-zinc-300">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> of <span className="font-semibold text-zinc-700 dark:text-zinc-300">{sortedData.length}</span>
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-200/80 dark:border-zinc-700/50 text-zinc-600 dark:text-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <i className="ri-arrow-left-s-line"></i>
                  </button>
                  <div className="flex gap-1 px-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = currentPage;
                      if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                      
                      if (pageNum < 1 || pageNum > totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                            currentPage === pageNum
                              ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-200/80 dark:border-zinc-700/50 text-zinc-600 dark:text-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <i className="ri-arrow-right-s-line"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50 xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}