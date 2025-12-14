"use client";

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedX: number;
  speedY: number;
  colorIndex: number;
  rotation: number;
  rotationSpeed: number;
  sway: number;
  swaySpeed: number;
  swayOffset: number;
  lifespan: number;
}

interface Color {
  r: number;
  g: number;
  b: number;
}

export default function FireCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();

    const paletteBase: Color[] = [
      { r: 255, g: 200, b: 100 },   // Bright gold
      { r: 255, g: 140, b: 60 },    // Bright orange
      { r: 255, g: 100, b: 30 },    // Bright red-orange
      { r: 255, g: 80, b: 50 },     // Bright red
    ];

    let palette = [...paletteBase];
    let time = 0;
    const particles: Particle[] = [];

    const createParticle = (): Particle => {
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 20,
        size: 3 + Math.random() * 12,
        opacity: 0.25 + Math.random() * 0.4,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: -1 - Math.random() * 2,
        colorIndex: Math.floor(Math.random() * palette.length),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        sway: 0.2 + Math.random() * 0.3,
        swaySpeed: 0.005 + Math.random() * 0.01,
        swayOffset: Math.random() * Math.PI * 2,
        lifespan: 80 + Math.random() * 120
      };
    };

    // Initialize particles
    const particleCount = Math.floor((canvas.width * canvas.height) / 2000);
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }

    const updatePalette = () => {
      palette = paletteBase.map((color, index) => {
        const t = time + index * 0.5;
        const variation = 15;
        return {
          r: Math.min(255, Math.max(0, color.r + Math.sin(t) * variation)),
          g: Math.min(255, Math.max(0, color.g + Math.sin(t + 1) * variation)),
          b: Math.min(255, Math.max(0, color.b + Math.sin(t + 2) * variation))
        };
      });
    };

    const drawBrushstroke = (
      x: number,
      y: number,
      size: number,
      rotation: number,
      color: Color,
      opacity: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      const gradient = ctx.createLinearGradient(0, -size, 0, size);
      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
      gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`);
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(-size / 3, -size);
      ctx.quadraticCurveTo(size / 2, 0, -size / 3, size);
      ctx.quadraticCurveTo(size / 2, 0, size / 3, -size / 2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.6})`;
      ctx.beginPath();
      ctx.ellipse(size / 6, 0, size / 4, size / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;
      updatePalette();

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.speedX + Math.sin(time * p.swaySpeed + p.swayOffset) * p.sway;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        p.lifespan -= 1;

        const lifeFactor = p.lifespan / 200;
        const currentSize = p.size * lifeFactor;
        const currentOpacity = p.opacity * lifeFactor;

        if (p.lifespan > 0) {
          drawBrushstroke(
            p.x,
            p.y,
            currentSize,
            p.rotation,
            palette[p.colorIndex],
            currentOpacity
          );
        }

        if (p.lifespan <= 0 || p.y < -50) {
          particles[i] = createParticle();
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    let animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ filter: 'blur(1px)' }}
    />
  );
}
