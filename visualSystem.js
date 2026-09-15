const TAU = Math.PI * 2;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const n = parseInt(clean, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

class VisualSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.width = 1;
    this.height = 1;
    this.dpr = 1;
    this.time = 0;
    
    // Parámetros de la gramática controlados por moments.js
    this.params = {
      linkOpacity: 0.1,
      pulseRate: 0.0,
      spread: 1.0,
      rotation: 0.1,
      intensity: 0.5,
    };
    
    this.target = { ...this.params, structure: "loose_ring" };
    this.current = null;
    this.colors = ["#08a9dd", "#f7353f", "#e96daa"];
    
    // Inicialización del Talento (Nodos Controlados)
    this.particles = Array.from({ length: CONFIG.particleCount }, (_, i) => {
      const isExperience = i % 2 === 0;
      return {
        id: i,
        x: Math.random(), 
        y: Math.random(),
        targetX: 0.5,
        targetY: 0.5,
        role: isExperience ? "experience" : "youth",
        baseAngle: (i / CONFIG.particleCount) * TAU, 
        baseRadius: isExperience ? 0.2 : 0.4,        
        lane: i % 3,
        pulseOffset: Math.random() 
      };
    });

    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  setMoment(moment) {
    this.current = moment;
    this.colors = moment.colors;
    this.target = {
      ...moment.behavior,
      intensity: moment.intensity,
    };
  }

  update() {
    this.time += 1 / 60;
    
    for (const key of Object.keys(this.params)) {
      this.params[key] = lerp(this.params[key], this.target[key], CONFIG.transitionSpeed);
    }
    
    this.calculateTargets();
  }

  calculateTargets() {
    const cx = 0.64; 
    const cy = 0.46; 
    const t = this.time * this.params.rotation;
    const structure = this.target.structure || "loose_ring";
    
    const pCount = this.particles.length;

    for (let i = 0; i < pCount; i++) {
      const p = this.particles[i];
      let tx = cx, ty = cy; 
      
      const angle = p.baseAngle + t;
      const aspect = this.height / this.width;

      if (structure === "grid") {
        const cols = Math.floor(Math.sqrt(pCount));
        const row = Math.floor(i / cols);
        const col = i % cols;
        tx = 0.45 + (col / cols) * 0.4 * this.params.spread;
        ty = 0.25 + (row / cols) * 0.6 * this.params.spread;
      } 
      else if (structure === "triad_clusters" || structure === "triad_impact") {
        const centers = [{x: 0.55, y: 0.3}, {x: 0.8, y: 0.6}, {x: 0.45, y: 0.65}];
        const center = centers[p.lane];
        const r = (p.role === "experience" ? 0.05 : 0.12) * this.params.spread;
        const impactPulse = structure === "triad_impact" ? Math.sin(t * 10 + p.lane) * 0.03 : 0;
        tx = center.x + Math.cos(angle * 2) * (r + impactPulse) * aspect;
        ty = center.y + Math.sin(angle * 2) * (r + impactPulse);
      }
      else if (structure === "dual_rings") {
        const r = (p.role === "experience" ? 0.15 : 0.35) * this.params.spread;
        const a = p.role === "experience" ? angle : -angle;
        tx = cx + Math.cos(a) * r * aspect;
        ty = cy + Math.sin(a) * r;
      }
      else if (structure === "interlocking_rings") {
        const r = 0.25 * this.params.spread;
        if (p.role === "experience") {
          tx = cx + Math.cos(angle) * r * aspect;
          ty = cy + Math.sin(angle * 2) * r * 0.5; 
        } else {
          tx = cx + Math.cos(angle * 2) * r * 1.5 * aspect; 
          ty = cy + Math.sin(angle) * r;
        }
      }
      else if (structure === "orbital_routes") {
        if (p.role === "experience") {
          tx = cx + Math.cos(angle * 0.5) * 0.08 * aspect;
          ty = cy + Math.sin(angle * 0.5) * 0.08;
        } else {
          const routeAngle = p.baseAngle + (t * 2);
          tx = cx + Math.cos(routeAngle) * 0.45 * aspect * this.params.spread;
          ty = cy + Math.sin(routeAngle) * 0.3 * this.params.spread;
        }
      }
      else if (structure === "mandala") {
        const rings = p.role === "experience" ? 1 : 3;
        const r = (0.15 * rings) * this.params.spread;
        const a = angle * (p.role === "experience" ? 1 : -1.5);
        tx = cx + Math.cos(a) * r * aspect;
        ty = cy + Math.sin(a) * r;
      }
      else if (structure === "youth_forward") {
        const r = p.role === "youth" ? 0.3 * this.params.spread : 0.1;
        tx = cx + Math.cos(angle) * r * aspect;
        ty = cy + Math.sin(angle) * r;
      }
      else {
        const r = p.baseRadius * this.params.spread * (1 + Math.sin(t * 2 + p.baseAngle)*0.1);
        tx = cx + Math.cos(angle) * r * aspect;
        ty = cy + Math.sin(angle) * r;
      }

      p.x = lerp(p.x, tx, CONFIG.transitionSpeed * 1.5);
      p.y = lerp(p.y, ty, CONFIG.transitionSpeed * 1.5);
    }
  }

  hasBackgroundAsset() {
    const configuredAsset = CONFIG.assets.byMoment?.[this.current?.id];
    const asset = configuredAsset === false ? null : configuredAsset || this.current?.asset;
    return asset?.placement === "background";
  }

  render() {
    this.update();
    const ctx = this.ctx;
    const hasBg = this.hasBackgroundAsset();

    ctx.clearRect(0, 0, this.width, this.height);
    this.drawBackground(ctx, hasBg);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    this.drawConstellation(ctx);
    this.drawNodes(ctx);

    ctx.restore();
  }

  drawBackground(ctx, hasBackgroundAsset = false) {
    if (hasBackgroundAsset) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const haze = ctx.createRadialGradient(
        this.width * 0.64, this.height * 0.48, 0,
        this.width * 0.64, this.height * 0.48, this.width * 0.48
      );
      haze.addColorStop(0, rgba(this.colors[1], 0.04 + this.params.intensity * 0.03));
      haze.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
      return;
    }

    const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, "#050607");
    gradient.addColorStop(0.44, rgba(this.colors[0], 0.08 + this.params.intensity * 0.06));
    gradient.addColorStop(1, "#111315");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  drawConstellation(ctx) {
    const maxDist = CONFIG.connectionDistance;
    
    for (let i = 0; i < this.particles.length; i++) {
      const p1 = this.particles[i];
      const x1 = p1.x * this.width;
      const y1 = p1.y * this.height;

      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        
        if (this.target.structure === "dual_rings" && p1.role !== p2.role) continue;

        const x2 = p2.x * this.width;
        const y2 = p2.y * this.height;
        const d = Math.hypot(x2 - x1, y2 - y1);

        if (d < maxDist) {
          const strength = 1 - (d / maxDist);
          const baseAlpha = strength * this.params.linkOpacity * 0.3; 
          const color = this.colors[(p1.lane + p2.lane) % this.colors.length];

          if (baseAlpha > 0.01) {
            ctx.strokeStyle = rgba(color, baseAlpha);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }

          if (this.params.pulseRate > 0.1) {
            const pulseSpeed = 1.5;
            const tOffset = p1.pulseOffset + (p2.id * 0.1); 
            const routeProgress = ((this.time * pulseSpeed) + tOffset) % 1; 

            if (routeProgress > 0.1 && routeProgress < 0.9 && strength > 0.3) {
              const pulseX = lerp(x1, x2, routeProgress);
              const pulseY = lerp(y1, y2, routeProgress);
              const pulseAlpha = Math.sin(routeProgress * Math.PI) * this.params.pulseRate * strength * 0.8;
              
              // Pulsos de energía (ahora son rombos de luz en lugar de círculos)
              ctx.save();
              ctx.translate(pulseX, pulseY);
              ctx.rotate(this.time * 3); // Giran rápidamente al viajar
              ctx.fillStyle = rgba(color, pulseAlpha);
              ctx.beginPath();
              const pSize = 2.5;
              ctx.moveTo(0, -pSize);
              ctx.lineTo(pSize, 0);
              ctx.lineTo(0, pSize);
              ctx.lineTo(-pSize, 0);
              ctx.closePath();
              ctx.fill();
              ctx.restore();
            }
          }
        }
      }
    }
  }

  drawNodes(ctx) {
    const isDuality = this.target.structure === "dual_rings";
    const isPresent = this.target.structure === "youth_forward";

    for (const p of this.particles) {
      const x = p.x * this.width;
      const y = p.y * this.height;

      let color = this.colors[p.lane];
      if (isDuality) {
        color = p.role === "youth" ? CONFIG.palette.eventCyan : CONFIG.palette.eventSilver;
      }
      if (isPresent && p.role === "youth") {
        color = CONFIG.palette.eventRed;
      }

      const alpha = 0.6 + this.params.intensity * 0.4;
      
      // Ajuste de tamaño para las formas poligonales
      const baseSize = p.role === "experience" ? 4.5 : 3.5; 
      const pulse = 1 + Math.sin(this.time * 2 + p.baseAngle) * 0.2;
      const size = baseSize * pulse;

      ctx.save();
      ctx.translate(x, y);
      
      // Rotación individual de cada geometría
      const rot = p.role === "experience" 
        ? (this.time * 0.5 + p.baseAngle) 
        : (-this.time * 1.5 + p.baseAngle);
      ctx.rotate(rot);

      if (p.role === "experience") {
        // GEOMETRÍA DE EXPERIENCIA: Rombo sólido anclado
        ctx.strokeStyle = rgba(color, alpha * 0.5);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -size * 1.8);
        ctx.lineTo(size * 1.8, 0);
        ctx.lineTo(0, size * 1.8);
        ctx.lineTo(-size * 1.8, 0);
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = rgba("#ffffff", alpha);
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.8);
        ctx.lineTo(size * 0.8, 0);
        ctx.lineTo(0, size * 0.8);
        ctx.lineTo(-size * 0.8, 0);
        ctx.closePath();
        ctx.fill();

      } else {
        // GEOMETRÍA DE JUVENTUD: Triángulo ágil de dirección
        ctx.strokeStyle = rgba(color, alpha * 0.5);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -size * 1.6);
        ctx.lineTo(size * 1.4, size * 1.2);
        ctx.lineTo(-size * 1.4, size * 1.2);
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = rgba("#ffffff", alpha);
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.8);
        ctx.lineTo(size * 0.7, size * 0.6);
        ctx.lineTo(-size * 0.7, size * 0.6);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
  }
}

window.VisualSystem = VisualSystem;