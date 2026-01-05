"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (event?: React.MouseEvent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.className = savedTheme;
    } else {
      // Set dark as default theme
      localStorage.setItem("theme", "dark");
    }
  }, []);

  const toggleTheme = (event?: React.MouseEvent) => {
    if (isAnimating || typeof window === 'undefined') return;
    
    const newTheme = theme === "light" ? "dark" : "light";
    
    // Get click position or use center
    const x = event?.clientX ?? window.innerWidth / 2;
    const y = event?.clientY ?? window.innerHeight / 2;
    
    // Calculate distance to furthest corner
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    
    setIsAnimating(true);
    
    // Use View Transition API if available
    if ((document as any).startViewTransition) {
      const transition = (document as any).startViewTransition(() => {
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.className = newTheme;
      });
      
      transition.ready.then(() => {
        // Animate with custom clip-path
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius * 2}px at ${x}px ${y}px)`
            ]
          },
          {
            duration: 800,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)'
          }
        );
      });
      
      transition.finished.then(() => {
        setIsAnimating(false);
      });
    } else {
      // Fallback: Create wrapper for new theme
      const wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.style.top = '0';
      wrapper.style.left = '0';
      wrapper.style.width = '100vw';
      wrapper.style.height = '100vh';
      wrapper.style.pointerEvents = 'none';
      wrapper.style.zIndex = '9998';
      wrapper.style.clipPath = `circle(0px at ${x}px ${y}px)`;
      wrapper.style.transition = 'clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      
      // Capture current scroll position
      const scrollY = window.scrollY;
      
      // Clone the body
      const clone = document.body.cloneNode(true) as HTMLElement;
      clone.style.position = 'fixed';
      clone.style.top = `-${scrollY}px`;
      clone.style.left = '0';
      clone.style.width = '100%';
      clone.style.height = '100vh';
      clone.style.overflow = 'hidden';
      
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);
      
      // Apply new theme to clone
      clone.classList.remove(theme);
      clone.classList.add(newTheme);
      
      // Trigger animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          wrapper.style.clipPath = `circle(${endRadius * 2}px at ${x}px ${y}px)`;
        });
      });
      
      // Change actual theme after animation starts
      setTimeout(() => {
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.className = newTheme;
      }, 400);
      
      // Clean up
      setTimeout(() => {
        wrapper.remove();
        setIsAnimating(false);
      }, 850);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
