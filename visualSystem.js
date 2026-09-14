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
    // Se divide equitativamente: la mitad es experiencia, la mitad es juventud
    this.particles = Array.from({ length: CONFIG.particleCount }, (_, i) => {
      const isExperience = i % 2 === 0;
      return {
        id: i,
        x: Math.random(), 
        y: Math.random(),
        targetX: 0.5,
        targetY: 0.5,
        role: isExperience ? "experience" : "youth",
        baseAngle: (i / CONFIG.particleCount) * TAU, // Distribución circular perfecta
        baseRadius: isExperience ? 0.2 : 0.4,        // Experiencia al centro, jóvenes afuera
        lane: i % 3,
        pulseOffset: Math.random() // Desfase para que los pulsos de luz no sean idénticos
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
    
    // Suavizado elegante de las propiedades globales
    for (const key of Object.keys(this.params)) {
      this.params[key] = lerp(this.params[key], this.target[key], CONFIG.transitionSpeed);
    }
    
    this.calculateTargets();
  }

  calculateTargets() {
    const cx = 0.64; // Centro visual X corrido un poco a la derecha (por los textos)
    const cy = 0.46; // Centro visual Y
    const t = this.time * this.params.rotation;
    const structure = this.target.structure || "loose_ring";
    
    const pCount = this.particles.length;

    for (let i = 0; i < pCount; i++) {
      const p = this.particles[i];
      let tx = cx, ty = cy; // Variables temporales para el Target
      
      const angle = p.baseAngle + t;
      const aspect = this.height / this.width;

      if (structure === "grid") {
        // Cuadrícula rígida institucional (Slide 2)
        const cols = Math.floor(Math.sqrt(pCount));
        const row = Math.floor(i / cols);
        const col = i % cols;
        tx = 0.45 + (col / cols) * 0.4 * this.params.spread;
        ty = 0.25 + (row / cols) * 0.6 * this.params.spread;
      } 
      else if (structure === "triad_clusters" || structure === "triad_impact") {
        // 3 Actores (Academia, Industria, Ciudad)
        const centers = [{x: 0.55, y: 0.3}, {x: 0.8, y: 0.6}, {x: 0.45, y: 0.65}];
        const center = centers[p.lane];
        const r = (p.role === "experience" ? 0.05 : 0.12) * this.params.spread;
        // Impacto genera una pequeña expansión rítmica
        const impactPulse = structure === "triad_impact" ? Math.sin(t * 10 + p.lane) * 0.03 : 0;
        tx = center.x + Math.cos(angle * 2) * (r + impactPulse) * aspect;
        ty = center.y + Math.sin(angle * 2) * (r + impactPulse);
      }
      else if (structure === "dual_rings") {
        // Dos generaciones separadas
        const r = (p.role === "experience" ? 0.15 : 0.35) * this.params.spread;
        // Giran en direcciones opuestas
        const a = p.role === "experience" ? angle : -angle;
        tx = cx + Math.cos(a) * r * aspect;
        ty = cy + Math.sin(a) * r;
      }
      else if (structure === "interlocking_rings") {
        // Se cruzan en un patrón de 8 (Lissajous) u órbitas elípticas rotadas
        const r = 0.25 * this.params.spread;
        if (p.role === "experience") {
          tx = cx + Math.cos(angle) * r * aspect;
          ty = cy + Math.sin(angle * 2) * r * 0.5; // Órbita vertical
        } else {
          tx = cx + Math.cos(angle * 2) * r * 1.5 * aspect; // Órbita horizontal
          ty = cy + Math.sin(angle) * r;
        }
      }
      else if (structure === "orbital_routes") {
        // La juventud explora, la experiencia es ancla
        if (p.role === "experience") {
          tx = cx + Math.cos(angle * 0.5) * 0.08 * aspect;
          ty = cy + Math.sin(angle * 0.5) * 0.08;
        } else {
          // Rutas amplias y elípticas
          const routeAngle = p.baseAngle + (t * 2);
          tx = cx + Math.cos(routeAngle) * 0.45 * aspect * this.params.spread;
          ty = cy + Math.sin(routeAngle) * 0.3 * this.params.spread;
        }
      }
      else if (structure === "mandala") {
        // Estructura Geométrica Perfecta para el Futuro Construido
        const rings = p.role === "experience" ? 1 : 3;
        const r = (0.15 * rings) * this.params.spread;
        const a = angle * (p.role === "experience" ? 1 : -1.5);
        tx = cx + Math.cos(a) * r * aspect;
        ty = cy + Math.sin(a) * r;
      }
      else if (structure === "youth_forward") {
        // Jóvenes pasan al frente ampliándose
        const r = p.role === "youth" ? 0.3 * this.params.spread : 0.1;
        tx = cx + Math.cos(angle) * r * aspect;
        ty = cy + Math.sin(angle) * r;
      }
      else {
        // constelación / nubes
        const r = p.baseRadius * this.params.spread * (1 + Math.sin(t * 2 + p.baseAngle)*0.1);
        tx = cx + Math.cos(angle) * r * aspect;
        ty = cy + Math.sin(angle) * r;
      }

      // Aplicar interpolación (Lerp) para movimiento siempre controlado y súper suave
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

    // 1. Dibujar la Malla y los Pulsos (La "Confianza" y "Trabajo en equipo")
    this.drawConstellation(ctx);
    
    // 2. Dibujar Nodos (Las Personas / Talento)
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
      // Brillo muy tenue para dejar ver bien las fotos
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

      // Evaluamos conexiones con otros nodos
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        
        // Regla: En estado de Dualidad (separados), no hay conexiones entre generaciones
        if (this.target.structure === "dual_rings" && p1.role !== p2.role) continue;

        const x2 = p2.x * this.width;
        const y2 = p2.y * this.height;
        const d = Math.hypot(x2 - x1, y2 - y1);

        if (d < maxDist) {
          // Fuerza de la conexión
          const strength = 1 - (d / maxDist);
          // Opacidad base muy delicada (elegante y no invasiva)
          const baseAlpha = strength * this.params.linkOpacity * 0.3; 
          const color = this.colors[(p1.lane + p2.lane) % this.colors.length];

          // DIBUJAR LÍNEA
          if (baseAlpha > 0.01) {
            ctx.strokeStyle = rgba(color, baseAlpha);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }

          // DIBUJAR PULSOS DE INFORMACIÓN (Confianza / Crecimiento)
          if (this.params.pulseRate > 0.1) {
            // Calculamos un punto a lo largo de la línea que viaja con el tiempo
            const pulseSpeed = 1.5;
            // Usamos el ID y el offset para que los pulsos no se vean idénticos o robóticos
            const tOffset = p1.pulseOffset + (p2.id * 0.1); 
            const routeProgress = ((this.time * pulseSpeed) + tOffset) % 1; 

            // Solo mostrar pulsos en el segmento central de la línea (para que nazcan y mueran suavemente)
            if (routeProgress > 0.1 && routeProgress < 0.9 && strength > 0.3) {
              const pulseX = lerp(x1, x2, routeProgress);
              const pulseY = lerp(y1, y2, routeProgress);
              
              // Fade in / Fade out del pulso
              const pulseAlpha = Math.sin(routeProgress * Math.PI) * this.params.pulseRate * strength * 0.8;
              
              ctx.fillStyle = rgba(color, pulseAlpha);
              ctx.beginPath();
              ctx.arc(pulseX, pulseY, 2.5, 0, TAU); // Bolita de luz viajando
              ctx.fill();
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

      // Color Semántico
      let color = this.colors[p.lane];
      if (isDuality) {
        color = p.role === "youth" ? CONFIG.palette.eventCyan : CONFIG.palette.eventSilver;
      }
      if (isPresent && p.role === "youth") {
        color = CONFIG.palette.eventRed;
      }

      const alpha = 0.6 + this.params.intensity * 0.4;
      
      // La juventud es pequeña (agilidad), la experiencia es grande (estabilidad/ancla)
      const baseR = p.role === "experience" ? 4 : 2.5; 
      const pulse = 1 + Math.sin(this.time * 2 + p.baseAngle) * 0.2;
      const radius = baseR * pulse;

      // Halo Suave Exterior
      ctx.fillStyle = rgba(color, alpha * 0.4);
      ctx.beginPath();
      ctx.arc(x, y, radius * 2.5, 0, TAU);
      ctx.fill();

      // Núcleo Sólido Minimalista
      ctx.fillStyle = rgba("#ffffff", alpha);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, TAU);
      ctx.fill();
    }
  }
}

window.VisualSystem = VisualSystem;