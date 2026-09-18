// visualSystem.js - Sistema de Fuego Prometeico Reconceptualizado
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
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
}

class VisualSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.width = 1;
    this.height = 1;
    this.dpr = 1;
    this.time = 0;

    this.params = {
      linkOpacity: 0.1,
      pulseRate: 0.0,
      spread: 1.0,
      rotation: 0.1,
      intensity: 0.5,
      centerX: 0.65,
      centerY: 0.48,
    };

    this.target = { ...this.params, structure: "loose_ring" };
    this.current = null;
    this.colors = ["#ff9800", "#f7353f", "#08a9dd"];

    this.particleCount = CONFIG.particleCount || 180;
    this.particles = Array.from({ length: this.particleCount }, (_, i) => {
      const isExperience = i % 2 === 0;
      return {
        id: i,
        x: 0.5,
        y: 0.5,
        currX: 0.5,
        currY: 0.5,
        life: Math.random(),
        maxLife: 0.6 + Math.random() * 0.8,
        size: 14 + Math.random() * 22,
        role: isExperience ? "experience" : "youth",
        lane: i % 3, // 0: Academia (Dorado), 1: Industria (Rojo), 2: Ciudad (Cian)
        seed: Math.random() * TAU,
        flickerSpeed: 4 + Math.random() * 6,
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
    this.colors = moment.colors || this.colors;

    let targetCx = 0.65;
    let targetCy = 0.48;

    if (moment.layout === "right") targetCx = 0.3;
    else if (moment.layout === "center") targetCx = 0.5;
    else if (moment.layout === "left") targetCx = 0.7;

    this.target = {
      ...moment.behavior,
      intensity: moment.intensity ?? 0.5,
      centerX: targetCx,
      centerY: targetCy,
    };
  }

  update() {
    this.time += 1 / 60;

    for (const key of Object.keys(this.params)) {
      this.params[key] = lerp(this.params[key], this.target[key], CONFIG.transitionSpeed);
    }

    this.updateFlameEmitterPositions();
  }

  updateFlameEmitterPositions() {
    const cx = this.params.centerX;
    const cy = this.params.centerY;
    const t = this.time;
    const momentId = this.current?.id || "";
    const struct = this.target.structure || "loose_ring";
    const pCount = this.particles.length;
    const aspect = this.height / this.width;

    for (let i = 0; i < pCount; i++) {
      const p = this.particles[i];
      let baseTx = cx;
      let baseTy = cy;
      const norm = i / pCount;
      const angle = (i / pCount) * TAU + t * 0.3;

      // SLIDE 1: Título Principal - Antorcha central equilibrada
      if (momentId === "relevo-generacional" || struct === "loose_ring") {
        const fH = norm * 0.38;
        const fW = Math.sin(norm * Math.PI) * 0.038 * aspect;
        baseTx = cx + (i % 2 === 0 ? fW : -fW);
        baseTy = cy + 0.16 - fH;
      } 
      // SLIDE 2: Auditorio de Grados - Fuego tenue en la base
      else if (momentId === "auditorio-grados" || struct === "grid") {
        const stageW = 0.65;
        baseTx = cx - stageW / 2 + norm * stageW;
        baseTy = cy + 0.26 + Math.sin(norm * Math.PI * 4 + t) * 0.01;
      } 
      // SLIDE 3: Universidad y Mundo - PUENTE DE FUEGO (Arco conectando dos puntos)
      else if (momentId === "universidad-mundo" || struct === "expanding_cloud") {
        const arcProgress = norm;
        const span = 0.5 * aspect; // Ancho del puente
        const arcH = Math.sin(arcProgress * Math.PI) * 0.18; // Parábola invertida
        baseTx = cx - span / 2 + arcProgress * span;
        baseTy = cy + 0.2 - arcH;
      } 
      // SLIDE 4: Academia + Industria + Ciudad - 3 Antorchas separadas y desplazadas
      else if (momentId === "academia-industria-ciudad" || struct === "triad_clusters") {
        const centers = [cx - 0.32, cx - 0.08, cx + 0.16];
        const torchX = centers[p.lane];
        const subNorm = (i % 30) / 30;
        const fH = subNorm * 0.32;
        const fW = Math.sin(subNorm * Math.PI) * 0.035 * aspect;
        baseTx = torchX + (i % 2 === 0 ? fW : -fW);
        baseTy = cy + 0.15 - fH;
      } 
      // SLIDE 5: El Impacto - Columna central fuerte con onda expansiva veloz en el suelo
      else if (momentId === "impacto" || struct === "triad_impact") {
        if (i % 3 === 0) {
          // Onda expansiva rápida (Shockwave)
          const shockwave = (norm + t * 2.5) % 1;
          const radius = shockwave * 0.6 * aspect;
          baseTx = cx + Math.cos(angle * 5) * radius;
          baseTy = cy + 0.25 + Math.sin(angle * 5) * (radius * 0.15); // Anillo aplanado por la perspectiva
        } else {
          // Núcleo del impacto: Llama central, densa y contundente
          const fH = norm * 0.55;
          const fW = Math.sin(norm * Math.PI) * 0.07 * aspect;
          baseTx = cx + (i % 2 === 0 ? fW : -fW);
          baseTy = cy + 0.25 - fH;
        }
      } 
      // SLIDE 6: Comunidad - Hoguera circular / Fogón comunitario
      else if (momentId === "comunidad" || struct === "constellation") {
        const hearthR = 0.18 * aspect;
        baseTx = cx + Math.cos(angle) * hearthR;
        baseTy = cy + 0.08 + Math.sin(angle) * (hearthR / aspect) * 0.4;
      } 
      // SLIDE 7: Confianza - Haz aerodinámico de altísima velocidad hacia arriba
      else if (momentId === "confianza") {
        const speedNorm = (norm + t * 1.8) % 1; // Ciclo muy acelerado para dar sensación de velocidad extrema
        const fH = speedNorm * 0.75; // Sube muy alto
        const taper = (1 - speedNorm) * 0.02 * aspect; // Base firme, punta finísima como un cohete
        baseTx = cx + (i % 2 === 0 ? taper : -taper);
        baseTy = cy + 0.30 - fH;
      } 
      // SLIDE 8: Nuevas Rutas - Desplazada a la derecha
      else if (momentId === "nuevas-rutas" || struct === "orbital_routes") {
        const shiftX = cx + 0.12; 
        if (p.role === "experience") {
          baseTx = shiftX + Math.cos(angle) * 0.08 * aspect;
          baseTy = cy + 0.18 + Math.sin(angle) * 0.03;
        } else {
          const spiralA = norm * TAU * 2.8 + t * 1.5;
          baseTx = shiftX + Math.cos(spiralA) * (norm * 0.35) * aspect;
          baseTy = cy + 0.18 - norm * 0.52;
        }
      } 
      // SLIDE 9: Dos Generaciones - Antorchas Gemelas en paralelo
      else if (momentId === "vision-generaciones" || struct === "dual_rings") {
        const isExp = p.role === "experience";
        const flameCx = isExp ? cx - 0.22 : cx + 0.22;
        const subNorm = (i % 40) / 40;
        const fH = subNorm * 0.38;
        const fW = Math.sin(subNorm * Math.PI) * 0.045 * aspect;
        baseTx = flameCx + (i % 2 === 0 ? fW : -fW);
        baseTy = cy + 0.14 - fH;
      } 
      // SLIDE 10: Trabajan Juntas - Vórtice de Doble Hélice
      else if (momentId === "trabajan-juntas" || struct === "interlocking_rings") {
        const strandPhase = p.role === "experience" ? 0 : Math.PI;
        const fH = (norm - 0.5) * 0.58;
        const twist = norm * Math.PI * 4.5 + t * 2.2 + strandPhase;
        baseTx = cx + Math.sin(twist) * 0.1 * aspect;
        baseTy = cy - fH;
      } 
      // SLIDE 11: Presente Joven - Llama en primer plano
      else if (momentId === "presente-joven" || struct === "youth_forward") {
        const fH = norm * 0.58;
        const fW = Math.sin(norm * Math.PI) * 0.08 * aspect;
        baseTx = cx + (i % 2 === 0 ? fW : -fW);
        baseTy = cy + 0.22 - fH;
      } 
      // SLIDE 12: El Futuro se Construye - PIRÁMIDE ESCALONADA (Bloques apilados paso a paso)
      else if (momentId === "futuro-construido" || struct === "mandala") {
        const steps = 4; // 4 niveles de construcción
        const stepIndex = Math.floor(norm * steps); // 0, 1, 2, 3
        const stepWidth = (steps - stepIndex) * 0.07 * aspect; // La base es la más ancha
        const stepHeight = stepIndex * 0.12; // Altura de cada bloque
        const horizontalPos = (i % 20) / 20; // Repartir partículas a lo ancho del escalón
        
        baseTx = cx - stepWidth + (horizontalPos * stepWidth * 2);
        baseTy = cy + 0.25 - stepHeight;
      } 
      // SLIDE 13: Cierre QR - Despeje de zona central
      else if (momentId === "qr-cierre") {
        const side = i % 2 === 0 ? 0.12 : 0.88;
        const fH = norm * 0.25;
        baseTx = side + (i % 4 === 0 ? 0.02 : -0.02);
        baseTy = cy + 0.25 - fH;
      }

      p.currX = lerp(p.currX, baseTx, CONFIG.transitionSpeed * 1.5);
      p.currY = lerp(p.currY, baseTy, CONFIG.transitionSpeed * 1.5);

      p.life += 0.015;
      if (p.life > p.maxLife) {
        p.life = 0;
      }

      const lifeNorm = p.life / p.maxLife;
      const draftY = -lifeNorm * 0.08;
      const turbulenceX = Math.sin(t * p.flickerSpeed + p.seed) * 0.008 * (1 - lifeNorm);

      p.x = p.currX + turbulenceX;
      p.y = p.currY + draftY;
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
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);
    this.drawBackground(ctx, this.hasBackgroundAsset());

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    this.drawFlameTongues(ctx);
    this.drawAscendingEmbers(ctx);

    ctx.restore();
  }

  drawBackground(ctx, hasBackgroundAsset = false) {
    const w = this.width;
    const h = this.height;
    const cx = w * this.params.centerX;
    const cy = h * this.params.centerY;

    if (hasBackgroundAsset) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const mainGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.5);
      mainGlow.addColorStop(0, "rgba(255, 120, 0, 0.12)");
      mainGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = mainGlow;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
      return;
    }

    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, "#030405");
    bgGrad.addColorStop(1, "#0a0604");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    const heatGlow = ctx.createRadialGradient(cx, cy + h * 0.08, 10, cx, cy, w * 0.45);
    heatGlow.addColorStop(0, "rgba(255, 90, 0, 0.16)");
    heatGlow.addColorStop(0.5, "rgba(180, 25, 0, 0.05)");
    heatGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = heatGlow;
    ctx.fillRect(0, 0, w, h);
  }

  drawFlameTongues(ctx) {
    const momentId = this.current?.id || "";
    const isTriad = momentId === "academia-industria-ciudad" || this.target.structure === "triad_clusters";
    const isDual = momentId === "vision-generaciones" || this.target.structure === "dual_rings";
    const isInterlocking = momentId === "trabajan-juntas" || this.target.structure === "interlocking_rings";
    const isYouthPresent = momentId === "presente-joven" || this.target.structure === "youth_forward";

    for (const p of this.particles) {
      const px = p.x * this.width;
      const py = p.y * this.height;

      const lifeNorm = p.life / p.maxLife;
      const fadeInOut = Math.sin(lifeNorm * Math.PI);
      const currentRadius = p.size * (1 - lifeNorm * 0.5) * (0.8 + fadeInOut * 0.4);

      if (currentRadius <= 0) continue;

      ctx.save();
      ctx.translate(px, py);
      ctx.scale(0.7, 1.6);

      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, currentRadius);

      // SLIDE 4: SINERGIA TRIPLE
      if (isTriad) {
        if (p.lane === 0) {
          grad.addColorStop(0.0, `rgba(255, 255, 240, ${fadeInOut * 0.98})`);
          grad.addColorStop(0.25, `rgba(255, 170, 0, ${fadeInOut * 0.85})`);
          grad.addColorStop(0.6, `rgba(200, 80, 0, ${fadeInOut * 0.4})`);
          grad.addColorStop(1.0, "rgba(100, 30, 0, 0)");
        } else if (p.lane === 1) {
          grad.addColorStop(0.0, `rgba(255, 240, 245, ${fadeInOut * 0.98})`);
          grad.addColorStop(0.25, `rgba(247, 53, 63, ${fadeInOut * 0.85})`);
          grad.addColorStop(0.6, `rgba(180, 10, 30, ${fadeInOut * 0.4})`);
          grad.addColorStop(1.0, "rgba(90, 0, 15, 0)");
        } else {
          grad.addColorStop(0.0, `rgba(240, 255, 255, ${fadeInOut * 0.98})`);
          grad.addColorStop(0.25, `rgba(8, 169, 221, ${fadeInOut * 0.85})`);
          grad.addColorStop(0.6, `rgba(0, 90, 180, ${fadeInOut * 0.4})`);
          grad.addColorStop(1.0, "rgba(0, 30, 90, 0)");
        }
      } 
      // SLIDE 11: PRESENTE JOVEN (Llama Azul/Cian Protagónica)
      else if (isYouthPresent) {
        grad.addColorStop(0.0, `rgba(240, 255, 255, ${fadeInOut * 0.98})`);
        grad.addColorStop(0.2, `rgba(8, 169, 221, ${fadeInOut * 0.85})`);
        grad.addColorStop(0.55, `rgba(0, 90, 200, ${fadeInOut * 0.45})`);
        grad.addColorStop(1.0, "rgba(0, 20, 80, 0)");
      }
      // SLIDE 9 & 10: DOS GENERACIONES / TRABAJAN JUNTAS (Dorada vs Azul)
      else if ((isDual || isInterlocking) && p.role === "youth") {
        grad.addColorStop(0.0, `rgba(255, 255, 255, ${fadeInOut * 0.95})`);
        grad.addColorStop(0.2, `rgba(120, 225, 255, ${fadeInOut * 0.8})`);
        grad.addColorStop(0.55, `rgba(8, 169, 221, ${fadeInOut * 0.45})`);
        grad.addColorStop(1.0, "rgba(0, 50, 120, 0)");
      } 
      // RESTO DE SLIDES: Fuego Prometeico Cálido Tradicional
      else {
        grad.addColorStop(0.0, `rgba(255, 255, 240, ${fadeInOut * 0.98})`);
        grad.addColorStop(0.22, `rgba(255, 180, 0, ${fadeInOut * 0.85})`);
        grad.addColorStop(0.58, `rgba(247, 53, 63, ${fadeInOut * 0.4})`);
        grad.addColorStop(1.0, "rgba(120, 0, 0, 0)");
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, currentRadius, 0, TAU);
      ctx.fill();

      ctx.restore();
    }
  }

  drawAscendingEmbers(ctx) {
    for (let i = 0; i < this.particles.length; i += 2) {
      const p = this.particles[i];
      const sparkProgress = (this.time * 2.2 + p.seed) % 1;
      const px = p.x * this.width + Math.sin(sparkProgress * 8 + p.id) * 10;
      const py = p.y * this.height - sparkProgress * 60;
      const alpha = (1 - sparkProgress) * 0.85;
      const sparkSize = (1 - sparkProgress) * 2.8;

      ctx.fillStyle = `rgba(255, 230, 150, ${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, sparkSize, 0, TAU);
      ctx.fill();
    }
  }
}

window.VisualSystem = VisualSystem;