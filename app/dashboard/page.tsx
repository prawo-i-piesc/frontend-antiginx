"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import React from "react";
import { useRouter } from 'next/navigation';
import { useTheme } from "../providers/ThemeProvider";
import useRequireAuth from '@/app/hooks/useRequireAuth';
import useProfile from '@/app/hooks/useProfile';
import DashboardTopBar from "../components/layout/DashboardTopBar";
import DashboardSidebar from "../components/layout/DashboardSidebar";
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
  const router = useRouter();

  
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [selectedWidgetIndex, setSelectedWidgetIndex] = useState<number | null>(null);
  const [blockBodyScroll, setBlockBodyScroll] = useState(false);
  const [dragOffsetState, setDragOffsetState] = useState({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const draggedIndexRef = useRef<number | null>(null);
  const hoverIndexRef = useRef<number | null>(null);
  const nextWidgetId = useRef(0);
  // auth initialization and redirect logic moved to hooks
  const { token, initialized, auth: authFromHook } = useRequireAuth();
  const auth = authFromHook;
  const { profileName, setProfileName } = useProfile(token);

  const displayWidgets = useMemo(() => {
    if (draggedIndex !== null && hoverIndex !== null && draggedIndex !== hoverIndex) {
      const widgets = [...activeWidgets];
      const [removed] = widgets.splice(draggedIndex, 1);
      widgets.splice(hoverIndex, 0, removed);
      return widgets;
    }
    return activeWidgets;
  }, [activeWidgets, draggedIndex, hoverIndex]);
  const availableWidgets = WIDGET_LIBRARY.filter(
    widget => !activeWidgets.find(aw => aw.type === widget.type)
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (blockBodyScroll) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      if (typeof document === 'undefined') return;
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [blockBodyScroll]);

  // preserve original render behaviour while keeping hook order stable
  if (!initialized) return null;
  if (!token) return null;


  function handleMouseDown(e: React.MouseEvent, widget: DashboardWidget, index: number) {
    if (!customizeMode) return;
    e.preventDefault();
    
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setDragOffsetState({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    
    setDraggedWidget(widget);
    setDraggedIndex(index);
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
      setDraggedIndex(null);
      setHoverIndex(null);
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
    setDragOffsetState({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
    
    setDraggedWidget(widget);
    setDraggedIndex(index);
    draggedIndexRef.current = index;
    setMousePos({ x: touch.clientX, y: touch.clientY });
    
    // Prevent body scrolling during drag via effect
    setBlockBodyScroll(true);
    
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
          setHoverIndex(newIndex);
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
      setDraggedIndex(null);
      setHoverIndex(null);
      draggedIndexRef.current = null;
      hoverIndexRef.current = null;
      
      // Restore body scrolling via effect
      setBlockBodyScroll(false);
      
      document.removeEventListener('touchmove', handleTouchMoveLocal);
      document.removeEventListener('touchend', handleTouchEndLocal);
      document.removeEventListener('touchcancel', handleTouchEndLocal);
    };
    
    document.addEventListener('touchmove', handleTouchMoveLocal, { passive: false });
    document.addEventListener('touchend', handleTouchEndLocal);
    document.addEventListener('touchcancel', handleTouchEndLocal);
  }


  function handleWidgetMouseEnter(index: number) {
    if (draggedWidget) {
      setHoverIndex(index);
      hoverIndexRef.current = index;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    if (!customizeMode) return;

    // Select widget with Enter or Space
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (selectedWidgetIndex === index) {
        setSelectedWidgetIndex(null);
      } else {
        setSelectedWidgetIndex(index);
      }
      return;
    }

    // Cancel selection with Escape
    if (e.key === 'Escape') {
      e.preventDefault();
      setSelectedWidgetIndex(null);
      return;
    }

    // Move widget with arrow keys
    if (selectedWidgetIndex === index) {
      let newIndex = index;
      
      if (e.key === 'ArrowUp' && index > 0) {
        e.preventDefault();
        newIndex = index - 1;
      } else if (e.key === 'ArrowDown' && index < activeWidgets.length - 1) {
        e.preventDefault();
        newIndex = index + 1;
      } else if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        newIndex = index - 1;
      } else if (e.key === 'ArrowRight' && index < activeWidgets.length - 1) {
        e.preventDefault();
        newIndex = index + 1;
      }

      if (newIndex !== index) {
        const widgets = [...activeWidgets];
        const [removed] = widgets.splice(index, 1);
        widgets.splice(newIndex, 0, removed);
        setActiveWidgets(widgets);
        setSelectedWidgetIndex(newIndex);
      }
    }
  }

  function removeWidget(widgetId: string) {
    setActiveWidgets(activeWidgets.filter(w => w.id !== widgetId));
  }

  function addWidget(widget: DashboardWidget) {
    const id = `${widget.type}-${nextWidgetId.current++}`;
    const newWidget = { ...widget, id };
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
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        profileName={profileName}
        onLogout={() => auth.logout()}
        activePage="overview"
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen xl:ml-0">
        <DashboardTopBar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          theme={theme}
          onToggleTheme={toggleTheme}
          showSearch
          showNotifications
          showMessages
        />

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
                aria-pressed={customizeMode}
                aria-label={customizeMode ? 'Exit customize mode' : 'Enter customize mode'}
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
            <div id="widget-instructions" className="sr-only">
              Press Enter or Space to select a widget. Use arrow keys to move the selected widget. Press Escape to deselect.
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-4 relative" style={{ transition: 'all 0.3s ease-out' }}>
              {displayWidgets.map((widget, index) => {
                const isDragging = draggedIndex === activeWidgets.indexOf(widget);
                const sizeClasses = {
                  "1x1": "",
                  "2x1": "col-span-2",
                  "1x2": "row-span-2",
                  "2x2": "col-span-2 row-span-2",
                };
                

                return (
                  <React.Fragment key={widget.id}>
                    
                    <div
                      key={widget.id}
                      data-widget-index={index}
                      tabIndex={customizeMode ? 0 : -1}
                      role={customizeMode ? 'button' : undefined}
                      aria-label={customizeMode ? `${widget.type} widget. Press Enter to select, use arrow keys to move` : undefined}
                      aria-grabbed={selectedWidgetIndex === index}
                      aria-describedby={customizeMode ? 'widget-instructions' : undefined}
                      className={`group relative h-full ${sizeClasses[widget.size]} ${
                      isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                        } ${
                      selectedWidgetIndex === index ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-zinc-100 dark:ring-offset-zinc-950' : ''
                        }`}
                        onMouseDown={(e) => handleMouseDown(e, widget, activeWidgets.indexOf(widget))}
                        onTouchStart={(e) => handleTouchStart(e, widget, activeWidgets.indexOf(widget))}
                        onMouseEnter={() => handleWidgetMouseEnter(index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        style={{
                            cursor: customizeMode ? 'move' : 'default',
                            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            touchAction: customizeMode ? 'none' : 'auto',
                        }}
                        >
                      {customizeMode && !draggedWidget && (
                        <div className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeWidget(widget.id);
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            aria-label={`Remove ${widget.type} widget`}
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
                    left: mousePos.x - dragOffsetState.x,
                    top: mousePos.y - dragOffsetState.y,
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
