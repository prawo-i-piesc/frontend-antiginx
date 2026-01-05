"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import React from "react";
import { useTheme } from "../providers/ThemeProvider";
import NavLink from "../components/interface/NavLink";
import StatsCard from "../components/interface/StatsCard";
import RecentScansWidget from "../components/widgets/RecentScansWidget";
import TopThreatsWidget from "../components/widgets/TopThreatsWidget";

type WidgetType = 'totalScans' | 'safeSites' | 'threats' | 'scheduled' | 'recentScans' | 'topThreats';

interface DashboardWidget {
  id: string;
  type: WidgetType;
  size: "1x1" | "2x1" | "1x2" | "2x2";
}

const WIDGET_LIBRARY: DashboardWidget[] = [
  { id: 'totalScans', type: 'totalScans', size: '1x1' },
  { id: 'safeSites', type: 'safeSites', size: '1x1' },
  { id: 'threats', type: 'threats', size: '1x1' },
  { id: 'scheduled', type: 'scheduled', size: '1x1' },
  { id: 'recentScans', type: 'recentScans', size: '2x2' },
  { id: 'topThreats', type: 'topThreats', size: '2x2' },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customizeMode, setCustomizeMode] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  const [activeWidgets, setActiveWidgets] = useState<DashboardWidget[]>([
    { id: 'totalScans', type: 'totalScans', size: '1x1' },
    { id: 'safeSites', type: 'safeSites', size: '1x1' },
    { id: 'threats', type: 'threats', size: '1x1' },
    { id: 'scheduled', type: 'scheduled', size: '1x1' },
    { id: 'recentScans', type: 'recentScans', size: '2x2' },
    { id: 'topThreats', type: 'topThreats', size: '2x2' },
  ]);

  const [draggedWidget, setDraggedWidget] = useState<DashboardWidget | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const draggedIndexRef = useRef<number | null>(null);
  const hoverIndexRef = useRef<number | null>(null);

  const availableWidgets = WIDGET_LIBRARY.filter(
    widget => !activeWidgets.find(aw => aw.type === widget.type)
  );

  const displayWidgets = draggedIndexRef.current !== null && hoverIndexRef.current !== null && draggedIndexRef.current !== hoverIndexRef.current
    ? (() => {
        const widgets = [...activeWidgets];
        const [removed] = widgets.splice(draggedIndexRef.current, 1);
        widgets.splice(hoverIndexRef.current, 0, removed);
        return widgets;
      })()
    : activeWidgets;

  function handleMouseDown(e: React.MouseEvent, widget: DashboardWidget, index: number) {
    if (!customizeMode) return;
    e.preventDefault();
    
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    
    setDraggedWidget(widget);
    draggedIndexRef.current = index;
    setMousePos({ x: e.clientX, y: e.clientY });
    
    const handleMouseMoveLocal = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseUpLocal = () => {
      if (draggedIndexRef.current !== null && hoverIndexRef.current !== null && draggedIndexRef.current !== hoverIndexRef.current) {
        const widgets = [...activeWidgets];
        const [removed] = widgets.splice(draggedIndexRef.current, 1);
        widgets.splice(hoverIndexRef.current, 0, removed);
        setActiveWidgets(widgets);
      }
      
      setDraggedWidget(null);
      draggedIndexRef.current = null;
      hoverIndexRef.current = null;
      
      document.removeEventListener('mousemove', handleMouseMoveLocal);
      document.removeEventListener('mouseup', handleMouseUpLocal);
    };
    
    document.addEventListener('mousemove', handleMouseMoveLocal);
    document.addEventListener('mouseup', handleMouseUpLocal);
  }

  function handleTouchStart(e: React.TouchEvent, widget: DashboardWidget, index: number) {
    if (!customizeMode) return;
    e.preventDefault();
    
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const touch = e.touches[0];
    
    dragOffset.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
    
    setDraggedWidget(widget);
    draggedIndexRef.current = index;
    setMousePos({ x: touch.clientX, y: touch.clientY });
    
    // Prevent body scrolling during drag
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    
    const handleTouchMoveLocal = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      setMousePos({ x: touch.clientX, y: touch.clientY });
      
      // Find element under touch point (excluding the floating preview)
      const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
      const widgetElement = elements.find(el => el.hasAttribute('data-widget-index'));
      if (widgetElement) {
        const newIndex = parseInt(widgetElement.getAttribute('data-widget-index') || '-1');
        if (newIndex >= 0 && newIndex !== draggedIndexRef.current) {
          hoverIndexRef.current = newIndex;
        }
      }
    };
    
    const handleTouchEndLocal = () => {
      if (draggedIndexRef.current !== null && hoverIndexRef.current !== null && draggedIndexRef.current !== hoverIndexRef.current) {
        const widgets = [...activeWidgets];
        const [removed] = widgets.splice(draggedIndexRef.current, 1);
        widgets.splice(hoverIndexRef.current, 0, removed);
        setActiveWidgets(widgets);
      }
      
      setDraggedWidget(null);
      draggedIndexRef.current = null;
      hoverIndexRef.current = null;
      
      // Restore body scrolling
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      
      document.removeEventListener('touchmove', handleTouchMoveLocal);
      document.removeEventListener('touchend', handleTouchEndLocal);
      document.removeEventListener('touchcancel', handleTouchEndLocal);
    };
    
    document.addEventListener('touchmove', handleTouchMoveLocal, { passive: false });
    document.addEventListener('touchend', handleTouchEndLocal);
    document.addEventListener('touchcancel', handleTouchEndLocal);
  }

  function handleMouseMove(e: MouseEvent) {
    setMousePos({ x: e.clientX, y: e.clientY });
  }

  function handleMouseUp() {
    setDraggedWidget(null);
    draggedIndexRef.current = null;
    hoverIndexRef.current = null;
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }

  function handleWidgetMouseEnter(index: number) {
    if (draggedWidget) {
      hoverIndexRef.current = index;
    }
  }

  function removeWidget(widgetId: string) {
    setActiveWidgets(activeWidgets.filter(w => w.id !== widgetId));
  }

  function addWidget(widget: DashboardWidget) {
    const newWidget = { ...widget, id: `${widget.type}-${Date.now()}` };
    setActiveWidgets([...activeWidgets, newWidget]);
  }

  function renderWidgetContent(widget: DashboardWidget) {
    switch (widget.type) {
      case 'totalScans':
        return (
          <StatsCard
            icon="ri-search-line"
            iconColor="text-cyan-400"
            iconBgColor="bg-cyan-500/10"
            value="2,847"
            label="Total Scans"
            trend={{ value: "12.5%", isPositive: true, color: "text-green-400" }}
          />
        );
      case 'safeSites':
        return (
          <StatsCard
            icon="ri-shield-check-line"
            iconColor="text-green-400"
            iconBgColor="bg-green-500/10"
            value="2,654"
            label="Safe Sites"
            trend={{ value: "8.2%", isPositive: true, color: "text-green-400" }}
          />
        );
      case 'threats':
        return (
          <StatsCard
            icon="ri-alert-line"
            iconColor="text-red-400"
            iconBgColor="bg-red-500/10"
            value="193"
            label="Detected Threats"
            trend={{ value: "3.1%", isPositive: false, color: "text-red-400" }}
          />
        );
      case 'scheduled':
        return (
          <StatsCard
            icon="ri-calendar-line"
            iconColor="text-purple-400"
            iconBgColor="bg-purple-500/10"
            value="24"
            label="Scheduled Tests"
            trend={{ value: "2 new", isPositive: true, color: "text-green-400" }}
          />
        );
      case 'recentScans':
        return <RecentScansWidget />;
      case 'topThreats':
        return <TopThreatsWidget />;
      default:
        return null;
    }
  }

  return (
    <div className="h-screen xl:flex bg-zinc-200 dark:bg-zinc-950 transition-colors select-none">
      {/* Sidebar */}
      <aside
        className={`fixed xl:static top-0 left-0 z-50 w-70 h-screen xl:h-full backdrop-blur-2xl border-r border-zinc-200/80 dark:border-zinc-800/60 flex flex-col transition-all duration-300 ease-in-out shadow-xl xl:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="h-20 px-6 border-b border-zinc-200/60 bg-white/90 dark:bg-zinc-950/80 dark:border-zinc-800/40 flex items-center">
          <Link href="/" className="flex items-center group">
            <img src="/logotype.png" alt="AntiGinx Logo" className="h-7 w-auto invert dark:invert-0 transition-transform group-hover:scale-105" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto bg-white/90 dark:bg-zinc-950/80 backdrop-blur-2xl">
          <div className="mb-8">
            <h3 className="mb-3 px-2 text-[10px] font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">MENU</h3>
            <ul className="space-y-1">
              <li><NavLink href="/dashboard" icon="ri-dashboard-line" label="Dashboard" isActive /></li>
              <li><NavLink href="/dashboard/calendar" icon="ri-calendar-line" label="Calendar" /></li>
              <li><NavLink href="/dashboard/profile" icon="ri-user-line" label="Profile" /></li>
              <li><NavLink href="/dashboard/forms" icon="ri-file-text-line" label="Forms" /></li>
              <li><NavLink href="/dashboard/tables" icon="ri-table-line" label="Tables" /></li>
              <li><NavLink href="/dashboard/settings" icon="ri-settings-line" label="Settings" /></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 px-2 text-[10px] font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">OTHERS</h3>
            <ul className="space-y-1">
              <li><NavLink href="/dashboard/chart" icon="ri-bar-chart-line" label="Chart" /></li>
              <li><NavLink href="/dashboard/ui" icon="ri-layout-line" label="UI Elements" /></li>
              <li><NavLink href="/dashboard/auth" icon="ri-lock-line" label="Authentication" /></li>
            </ul>
          </div>
        </nav>

        
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen xl:ml-0">
        {/* Header */}
        <header
          className="sticky h-20 top-0 z-40 bg-white/85 dark:bg-zinc-950 backdrop-blur-2xl border-b border-zinc-200 dark:border-zinc-800/50 flex items-center transition-colors"
        >
          <div className="flex items-center justify-between px-6 w-full">
            {/* Left: Mobile menu + Search */}
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="xl:hidden w-10 h-10 bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-300 dark:hover:bg-zinc-700/60 rounded-xl flex items-center justify-center transition-all border border-zinc-400 dark:border-zinc-700/50 hover:border-zinc-500 dark:hover:border-zinc-600/50"
              >
                <i className="ri-menu-line text-zinc-700 dark:text-zinc-200 text-xl"></i>
              </button>

              {/* Search */}
              <div className="hidden lg:block flex-1 max-w-lg">
                <div className="relative group">
                  <div className="absolute inset-0 bg-cyan-500/5 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                  <input
                    type="text"
                    placeholder="Search for scans, threats, or reports..."
                    className="relative w-full bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700/50 rounded-xl pl-11 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:bg-zinc-200 dark:focus:bg-zinc-800/80 transition-all"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors">
                    <i className="ri-search-line text-lg"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button 
                onClick={(e) => toggleTheme(e)}
                className="sm:flex w-10 h-10 bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-300 dark:hover:bg-zinc-700/60 rounded-xl items-center justify-center transition-all border border-zinc-300 dark:border-zinc-700/50 hover:border-zinc-500 dark:hover:border-zinc-600/50 group"
              >
                {theme === "dark" ? (
                  <i className="ri-moon-line text-zinc-600 dark:text-zinc-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors text-lg"></i>
                ) : (
                  <i className="ri-sun-line text-zinc-600 group-hover:text-cyan-500 transition-colors text-lg"></i>
                )}
              </button>

              {/* Notifications */}
              <button className="relative w-10 h-10 bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-300 dark:hover:bg-zinc-700/60 rounded-xl flex items-center justify-center transition-all border border-zinc-300 dark:border-zinc-700/50 hover:border-zinc-500 dark:hover:border-zinc-600/50 group">
                <i className="ri-notification-3-line text-zinc-600 dark:text-zinc-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors"></i>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-zinc-900"></span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              </button>

              {/* Messages */}
              <button className="sm:flex relative w-10 h-10 bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-300 dark:hover:bg-zinc-700/60 rounded-xl items-center justify-center transition-all border border-zinc-300 dark:border-zinc-700/50 hover:border-zinc-500 dark:hover:border-zinc-600/50 group">
                <i className="ri-message-3-line text-zinc-600 dark:text-zinc-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors"></i>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-zinc-900"></span>
              </button>

              {/* User Dropdown */}
              <button className="hidden sm:flex items-center gap-3 pl-3 pr-4 py-2transition-all group">
                <div className="relative">
                  <div className="w-9 h-9 bg-linear-to-br from-zinc-500 to-zinc-600 rounded-lg flex items-center justify-center">
                    <span className="text-zinc-100 font-bold text-sm">JK</span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900"></div>
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">Jan K.</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-500">Premium</div>
                </div>
                <i className="hidden sm:flex ri-arrow-down-s-line text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors text-lg"></i>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-zinc-100 dark:bg-zinc-950">
          <div className="p-6">
            {/* Dashboard Header with Customize */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Dashboard Overview</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Main activity and statistics summary
                </p>
              </div>
              <button 
                onClick={() => setCustomizeMode(!customizeMode)}
                className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer rounded-xl border transition-all font-medium ${
                  customizeMode 
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 dark:bg-cyan-500/10' 
                    : 'border-zinc-300 bg-white/85 dark:bg-zinc-900/20 dark:border-zinc-500/30 text-zinc-600 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <i className={`text-lg ${customizeMode ? 'ri-check-line' : 'ri-edit-line'}`}></i>
                <span className="hidden sm:block">{customizeMode ? 'Done' : 'Customize'}</span>
              </button>
            </div>

            {/* Active Widgets Grid */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-4 relative" style={{ transition: 'all 0.3s ease-out' }}>
              {displayWidgets.map((widget, index) => {
                const isDragging = draggedIndexRef.current === activeWidgets.indexOf(widget);
                const sizeClasses = {
                  "1x1": "",
                  "2x1": "col-span-2",
                  "1x2": "row-span-2",
                  "2x2": "col-span-2 row-span-2",
                };
                
                // Check if previous widget would block grid flow (create empty space)
                const prevWidget = index > 0 ? displayWidgets[index - 1] : null;
                const shouldShowDropZone = customizeMode && draggedWidget && prevWidget && 
                  (prevWidget.size === '2x1' || prevWidget.size === '2x2') &&
                  (widget.size === '2x1' || widget.size === '2x2');

                return (
                  <React.Fragment key={widget.id}>
                    
                    <div
                      key={widget.id}
                      data-widget-index={index}
                      className={`group relative h-full ${sizeClasses[widget.size]} ${
                      isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                        }`}
                        onMouseDown={(e) => handleMouseDown(e, widget, activeWidgets.indexOf(widget))}
                        onTouchStart={(e) => handleTouchStart(e, widget, activeWidgets.indexOf(widget))}
                        onMouseEnter={() => handleWidgetMouseEnter(index)}
                        style={{
                            cursor: customizeMode ? 'move' : 'default',
                            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',                            touchAction: customizeMode ? 'none' : 'auto',                        }}
                        >
                      {customizeMode && !draggedWidget && (
                        <div className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeWidget(widget.id);
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="cursor-pointer w-7 h-7 bg-red-500/90 hover:bg-red-500 rounded-lg flex items-center justify-center text-white shadow-lg transition-all"
                          >
                            <i className="ri-close-line text-sm"></i>
                          </button>
                        </div>
                      )}
                      {renderWidgetContent(widget)}
                    </div>
                  </React.Fragment>
                );
              })}
              
              {/* Floating drag preview */}
              {draggedWidget && (
                <div
                  className="fixed pointer-events-none z-50 opacity-80"
                  style={{
                    left: mousePos.x - dragOffset.current.x,
                    top: mousePos.y - dragOffset.current.y,
                    width: draggedWidget.size.includes('2x') 
                      ? 'min(616px, calc(100vw - 2rem))' 
                      : 'min(300px, calc(50vw - 1rem))',
                  }}
                >
                  <div className="bg-white dark:bg-zinc-900 rounded-xl border-2 border-cyan-500 shadow-2xl">
                    {renderWidgetContent(draggedWidget)}
                  </div>
                </div>
              )}
            </div>

            {/* Widget Library - Only visible in customize mode */}
            {customizeMode && availableWidgets.length > 0 && (
              <>
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-300 dark:border-zinc-800"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-zinc-100 dark:bg-zinc-950 px-4 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                      Available Widgets
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 auto-rows-fr">
                  {availableWidgets.map((widget) => (
                    <div
                      key={widget.type}
                      onClick={() => addWidget(widget)}
                      className={`cursor-pointer opacity-60 hover:opacity-100 hover:scale-[1.02] transition-all ${
                        widget.size === '2x1' ? 'col-span-2' :
                        widget.size === '1x2' ? 'row-span-2' :
                        widget.size === '2x2' ? 'col-span-2 row-span-2' : ''
                      }`}
                    >
                      <div className="h-full relative group/library">
                        <div className="absolute inset-0 bg-cyan-500/10 rounded-xl opacity-0 group-hover/library:opacity-100 transition-opacity pointer-events-none"></div>
                        <div className="absolute -top-2 -right-2 z-10 w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center text-white shadow-lg opacity-0 group-hover/library:opacity-100 transition-opacity">
                          <i className="ri-add-line text-sm"></i>
                        </div>
                        {renderWidgetContent(widget)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50 xl:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
