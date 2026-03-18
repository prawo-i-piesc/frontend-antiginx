"use client";

import Link from "next/link";
import { useState, useRef, useMemo, useEffect } from "react";
import React from "react";
import { useRouter } from 'next/navigation';
import { useTheme } from "../providers/ThemeProvider";
import useRequireAuth from '@/app/hooks/useRequireAuth';
import useProfile from '@/app/hooks/useProfile';
import NavLink from "../components/interface/NavLink";
import StatsCard from "../components/interface/StatsCard";
import RecentScansWidget from "../components/widgets/RecentScansWidget";
import UserLocationMapWidget from "../components/widgets/UserLocationMapWidget";

type WidgetType = 'totalUsers' | 'activeScans' | 'threats' | 'newRegistrations' | 'recentScans' | 'topCountries';

interface AdminWidget {
  id: string;
  type: WidgetType;
  size: "1x1" | "2x1" | "1x2" | "2x2";
}

const WIDGET_LIBRARY: AdminWidget[] = [
  { id: 'totalUsers', type: 'totalUsers', size: '1x1' },
  { id: 'activeScans', type: 'activeScans', size: '1x1' },
  { id: 'threats', type: 'threats', size: '1x1' },
  { id: 'newRegistrations', type: 'newRegistrations', size: '1x1' },
  { id: 'topCountries', type: 'topCountries', size: '2x2' },
  { id: 'recentScans', type: 'recentScans', size: '2x2' },
];

export default function AdminPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customizeMode, setCustomizeMode] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const [activeWidgets, setActiveWidgets] = useState<AdminWidget[]>([
    { id: 'topCountries', type: 'topCountries', size: '2x2' },
    { id: 'recentScans', type: 'recentScans', size: '2x2' },
    { id: 'totalUsers', type: 'totalUsers', size: '1x1' },
    { id: 'activeScans', type: 'activeScans', size: '1x1' },
    { id: 'threats', type: 'threats', size: '1x1' },
    { id: 'newRegistrations', type: 'newRegistrations', size: '1x1' },

  ]);

  const [draggedWidget, setDraggedWidget] = useState<AdminWidget | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [selectedWidgetIndex, setSelectedWidgetIndex] = useState<number | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const draggedIndexRef = useRef<number | null>(null);
  const hoverIndexRef = useRef<number | null>(null);

  const { token, initialized, auth: authFromHook } = useRequireAuth();
  const auth = authFromHook;
  const { profileName } = useProfile(token);

  // preserve original render behaviour while keeping hook order stable
  if (!initialized) return null;
  if (!token) return null;

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

  function handleMouseDown(e: React.MouseEvent, widget: AdminWidget, index: number) {
    if (!customizeMode) return;
    e.preventDefault();

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

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

  function handleTouchStart(e: React.TouchEvent, widget: AdminWidget, index: number) {
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
    setDraggedIndex(index);
    draggedIndexRef.current = index;
    setMousePos({ x: touch.clientX, y: touch.clientY });

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const handleTouchMoveLocal = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      setMousePos({ x: touch.clientX, y: touch.clientY });

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

  function handleWidgetMouseEnter(index: number) {
    if (draggedWidget) {
      setHoverIndex(index);
      hoverIndexRef.current = index;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    if (!customizeMode) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (selectedWidgetIndex === index) {
        setSelectedWidgetIndex(null);
      } else {
        setSelectedWidgetIndex(index);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setSelectedWidgetIndex(null);
      return;
    }

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

  function addWidget(widget: AdminWidget) {
    const newWidget = { ...widget, id: `${widget.type}-${Date.now()}` };
    setActiveWidgets([...activeWidgets, newWidget]);
  }

  function renderWidgetContent(widget: AdminWidget) {
    switch (widget.type) {
      case 'totalUsers':
        return (
          <StatsCard
            icon="ri-group-line"
            iconColor="text-purple-400"
            iconBgColor="bg-purple-500/10"
            value="14,382"
            label="Total Users"
            trend={{ value: "5.3%", isPositive: true, color: "text-green-400" }}
          />
        );
      case 'activeScans':
        return (
          <StatsCard
            icon="ri-scan-line"
            iconColor="text-cyan-400"
            iconBgColor="bg-cyan-500/10"
            value="2,847"
            label="All-time Scans"
            trend={{ value: "12.5%", isPositive: true, color: "text-green-400" }}
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
      case 'newRegistrations':
        return (
          <StatsCard
            icon="ri-user-add-line"
            iconColor="text-emerald-400"
            iconBgColor="bg-emerald-500/10"
            value="84"
            label="New Registrations"
            trend={{ value: "18 today", isPositive: true, color: "text-green-400" }}
          />
        );
      case 'recentScans':
        return <RecentScansWidget />;
      case 'topCountries':
        return <UserLocationMapWidget />;
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
        <div className="h-20 px-6 border-b border-zinc-200/60 bg-white/90 dark:bg-zinc-950/80 dark:border-zinc-800/40 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <img src="/logotype.png" alt="AntiGinx Logo" className="h-7 w-auto invert dark:invert-0 transition-transform group-hover:scale-105" />
          </Link>
          <span className="text-[10px] font-semibold tracking-widest uppercase px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto bg-white/90 dark:bg-zinc-950/80 backdrop-blur-2xl">
          <div className="mb-8">
            <h3 className="mb-3 px-2 text-[10px] font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">MANAGEMENT</h3>
            <ul className="space-y-1">
              <li><NavLink href="/admin" icon="ri-shield-star-line" label="Overview" isActive /></li>
              <li><NavLink href="/admin/users" icon="ri-group-line" label="Users" /></li>
              <li><NavLink href="/admin/database" icon="ri-database-2-line" label="Database" /></li>
              <li><NavLink href="/admin/reports" icon="ri-file-chart-line" label="Reports" /></li>
              <li><NavLink href="/admin/settings" icon="ri-settings-4-line" label="Settings" /></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 px-2 text-[10px] font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">SYSTEM</h3>
            <ul className="space-y-1">
              <li><NavLink href="/admin/logs" icon="ri-terminal-box-line" label="Audit Logs" /></li>
              <li><NavLink href="/admin/analytics" icon="ri-bar-chart-2-line" label="Analytics" /></li>
              <li><NavLink href="/dashboard" icon="ri-dashboard-line" label="User Dashboard" /></li>
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
                    placeholder="Search users, scans, reports..."
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
                className="cursor-pointer sm:flex w-10 h-10 bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-300 dark:hover:bg-zinc-700/60 rounded-xl items-center justify-center transition-all border border-zinc-300 dark:border-zinc-700/50 hover:border-zinc-500 dark:hover:border-zinc-600/50 group"
              >
                {theme === "dark" ? (
                  <i className="ri-moon-line text-zinc-600 dark:text-zinc-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors text-lg"></i>
                ) : (
                  <i className="ri-sun-line text-zinc-600 group-hover:text-cyan-500 transition-colors text-lg"></i>
                )}
              </button>


              {/* User + Logout */}
              <div className="flex items-center gap-3 pl-3 pr-4 py-2 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 bg-linear-to-br from-cyan-600 to-cyan-700 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{(profileName || 'A').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()}</span>
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-cyan-500 rounded-full border-2 border-white dark:border-zinc-950 flex items-center justify-center">
                      <i className="ri-shield-fill text-white" style={{ fontSize: '7px' }}></i>
                    </span>
                  </div>

                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 transition-colors">{profileName ? profileName.split(' ')[0] + " " + (profileName.split(' ')[1] ? profileName.split(' ')[1][0] + "." : '') : 'Admin'}</div>
                    <div className="text-xs text-cyan-500 dark:text-cyan-400 font-medium">Administrator</div>
                  </div>

                  <button
                    onClick={() => auth.logout()}
                    aria-label="Logout"
                    title="Logout"
                    className="flex items-center justify-center transition-colors text-zinc-600 dark:text-zinc-300 hover:text-red-500 dark:hover:text-red-400 cursor-pointer"
                  >
                    <i className="ri-logout-box-line text-lg" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-zinc-100 dark:bg-zinc-950">
          <div className="p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Admin Panel</h2>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Platform-wide statistics and management overview
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
                const isDragging = draggedIndexRef.current === activeWidgets.indexOf(widget);
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
