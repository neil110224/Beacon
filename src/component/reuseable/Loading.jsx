import { useEffect, useRef } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

  @keyframes lanternPulse {
    0%,100% { box-shadow: 0 0 8px 2px rgba(0,0,0,0.25), 0 0 20px 6px rgba(0,0,0,0.1); }
    50%     { box-shadow: 0 0 18px 7px rgba(0,0,0,0.45), 0 0 40px 16px rgba(0,0,0,0.2); }
  }
  @keyframes glowPulse {
    0%,100% { opacity:0.6; transform:scale(1); }
    50%     { opacity:1; transform:scale(1.5); }
  }
  @keyframes dotBlink {
    0%,100% { opacity:0.1; }
    50%     { opacity:0.9; }
  }

  .lh-scene {
    position: relative;
  }

  .lh-lighthouse {
    position: absolute;
    bottom: 52px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 10;
  }
  .lh-lantern {
    width: 22px; height: 18px;
    background: linear-gradient(180deg, #1a1a1a 0%, #2a2a2a 60%, #111 100%);
    border: 1.5px solid #444;
    border-radius: 3px 3px 0 0;
    position: relative;
    display: flex;
    align-items: center; justify-content: center;
    animation: lanternPulse 2s ease-in-out infinite;
    z-index: 11;
  }
  .lh-lantern::before {
    content: '';
    position: absolute; top: -7px; left: 50%;
    transform: translateX(-50%);
    width: 26px; height: 7px;
    background: #1c1c1c;
    border-radius: 3px 3px 0 0;
    border: 1px solid #333;
  }
  .lh-lantern-inner {
    width: 7px; height: 7px;
    background: radial-gradient(circle, #000 10%, rgba(0,0,0,0.6) 50%, transparent 100%);
    border-radius: 50%;
    animation: glowPulse 2s ease-in-out infinite;
  }
  .lh-tower {
    width: 24px; height: 54px;
    background: linear-gradient(90deg, #0a0a0a 0%, #1a1a1a 28%, #141414 70%, #080808 100%);
    position: relative; overflow: hidden;
  }
  .lh-tower::before {
    content:''; position:absolute; inset:0;
    background: repeating-linear-gradient(
      180deg,
      transparent 0px, transparent 9px,
      rgba(60,60,60,0.8) 9px, rgba(60,60,60,0.8) 16px
    );
  }
  .lh-win {
    position:absolute; left:50%; transform:translateX(-50%);
    width:6px; height:8px;
    background:rgba(255,255,255,0.08);
    border:1px solid #333;
    border-radius:3px 3px 0 0;
    z-index:2;
  }
  .lh-tower-base {
    width:30px; height:10px;
    background:linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
    border-radius:2px 2px 0 0;
    border-bottom:2px solid #000;
  }

  .lh-loading-text {
    color: rgba(0,0,0,0.7);
    font-size: 10px;
    letter-spacing: 6px;
    text-transform: uppercase;
    font-family: 'Share Tech Mono', monospace;
  }
  .lh-dots span { display:inline-block; animation:dotBlink 1.5s ease-in-out infinite; }
  .lh-dots span:nth-child(2) { animation-delay:0.3s; }
  .lh-dots span:nth-child(3) { animation-delay:0.6s; }
`;

const W = 340;
const H = 180;
const OX = W / 2;
const OY = 32;
const BEAM_LENGTH = 190;
const BEAM_SPEED = 0.018;

const WAVE_LAYERS = [
  { amp: 8,  period: 200, speed: 0.7,  yBase: 0.62, color: [28, 34, 52],   alpha: 1.0, foam: true  },
  { amp: 6,  period: 150, speed: 1.1,  yBase: 0.68, color: [18, 22, 38],   alpha: 1.0, foam: false },
  { amp: 5,  period: 170, speed: 0.85, yBase: 0.74, color: [12, 15, 26],   alpha: 1.0, foam: true  },
  { amp: 4,  period: 120, speed: 1.4,  yBase: 0.80, color: [8,  10, 18],   alpha: 1.0, foam: false },
  { amp: 3,  period: 100, speed: 1.8,  yBase: 0.86, color: [5,  6,  12],   alpha: 1.0, foam: true  },
];

export default function LighthouseLoader({ text = "Loading" }) {
  const canvasRef = useRef(null);
  const beamAngleRef = useRef(-Math.PI / 2);
  const timeRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const styleId = "lighthouse-loader-styles";
    if (!document.getElementById(styleId)) {
      const tag = document.createElement("style");
      tag.id = styleId;
      tag.textContent = styles;
      document.head.appendChild(tag);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function getWaveY(layer, x, t) {
      const baseY = layer.yBase * H;
      return baseY
        + Math.sin((x / layer.period) * Math.PI * 2 + t * layer.speed) * layer.amp
        + Math.sin((x / (layer.period * 0.55)) * Math.PI * 2 + t * layer.speed * 1.4 + 1) * layer.amp * 0.45
        + Math.sin((x / (layer.period * 1.4)) * Math.PI * 2 + t * layer.speed * 0.6 + 2) * layer.amp * 0.3;
    }

    function drawWave(layer, t) {
      const [r, g, b] = layer.color;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 2) {
        ctx.lineTo(x, getWaveY(layer, x, t));
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = `rgba(${r},${g},${b},${layer.alpha})`;
      ctx.fill();

      if (layer.foam) {
        ctx.save();
        // Bright foam crest
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
          const y = getWaveY(layer, x, t);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba(180,200,255,0.10)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Tiny foam dots
        ctx.fillStyle = "rgba(200,220,255,0.08)";
        for (let x = 10; x < W; x += 28 + Math.sin(x) * 8) {
          const y = getWaveY(layer, x, t) - 1;
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    function drawRock(t) {
      const cx = W / 2;
      // Rock bobs very slightly with a slow wave
      const bob = Math.sin(t * 0.3) * 0.8;
      const ry = H - 8 + bob;

      // Shadow under rock
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.ellipse(cx, ry + 2, 48, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#020204";
      ctx.fill();
      ctx.restore();

      // Main rock
      ctx.beginPath();
      ctx.moveTo(cx - 50, ry + 2);
      ctx.bezierCurveTo(cx - 52, ry - 6,  cx - 42, ry - 26, cx - 20, ry - 36);
      ctx.bezierCurveTo(cx - 8,  ry - 42, cx + 8,  ry - 42, cx + 20, ry - 36);
      ctx.bezierCurveTo(cx + 42, ry - 26, cx + 52, ry - 6,  cx + 50, ry + 2);
      ctx.closePath();
      const rockGrad = ctx.createLinearGradient(cx - 50, ry - 42, cx + 50, ry + 2);
      rockGrad.addColorStop(0.0, "#22222c");
      rockGrad.addColorStop(0.4, "#16161e");
      rockGrad.addColorStop(1.0, "#080810");
      ctx.fillStyle = rockGrad;
      ctx.fill();

      // Rock surface highlight
      ctx.beginPath();
      ctx.moveTo(cx - 44, ry - 2);
      ctx.bezierCurveTo(cx - 40, ry - 18, cx - 22, ry - 38, cx, ry - 41);
      ctx.bezierCurveTo(cx + 22, ry - 38, cx + 40, ry - 18, cx + 44, ry - 2);
      ctx.strokeStyle = "rgba(255,255,255,0.055)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Rock cracks / texture
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.035)";
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(cx - 22, ry - 32); ctx.lineTo(cx - 12, ry - 18); ctx.lineTo(cx - 18, ry - 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 14, ry - 30); ctx.lineTo(cx + 22, ry - 15); ctx.lineTo(cx + 16, ry - 5);  ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 2,  ry - 38); ctx.lineTo(cx + 4,  ry - 24); ctx.stroke();
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const t = timeRef.current;

      // --- Beam ---
      const angle = beamAngleRef.current;
      const spread = Math.abs(Math.sin(angle));
      const screenAngle = -angle;
      const beamDirX = Math.cos(screenAngle);
      const halfSpread = 8 + spread * 60;
      const tipX = OX + beamDirX * BEAM_LENGTH;
      const tipY = OY;
      const perpX = -Math.sin(screenAngle);
      const perpY = Math.cos(screenAngle);
      const topX = tipX + perpX * halfSpread;
      const topY = tipY + perpY * halfSpread * 0.4;
      const botX = tipX - perpX * halfSpread;
      const botY = tipY - perpY * halfSpread * 0.4;
      const alpha = 0.12 + spread * 0.22;

      const grad = ctx.createLinearGradient(OX, OY, tipX, tipY);
      grad.addColorStop(0, `rgba(0,0,0,${alpha})`);
      grad.addColorStop(0.4, `rgba(0,0,0,${alpha * 0.5})`);
      grad.addColorStop(1, `rgba(0,0,0,0)`);
      ctx.beginPath(); ctx.moveTo(OX, OY); ctx.lineTo(topX, topY); ctx.lineTo(botX, botY); ctx.closePath();
      ctx.fillStyle = grad; ctx.fill();

      const coreGrad = ctx.createLinearGradient(OX, OY, tipX, tipY);
      coreGrad.addColorStop(0, `rgba(0,0,0,${0.35 + spread * 0.3})`);
      coreGrad.addColorStop(0.5, `rgba(0,0,0,${0.15 + spread * 0.15})`);
      coreGrad.addColorStop(1, `rgba(0,0,0,0)`);
      const coreHalf = halfSpread * 0.25;
      ctx.beginPath(); ctx.moveTo(OX, OY);
      ctx.lineTo(tipX + perpX * coreHalf, tipY + perpY * coreHalf * 0.4);
      ctx.lineTo(tipX - perpX * coreHalf, tipY - perpY * coreHalf * 0.4);
      ctx.closePath(); ctx.fillStyle = coreGrad; ctx.fill();

      beamAngleRef.current += BEAM_SPEED;
      if (beamAngleRef.current > Math.PI / 2) beamAngleRef.current = -Math.PI / 2;

      // --- Ocean waves ---
      for (const layer of WAVE_LAYERS) {
        drawWave(layer, t);
      }

      // Ocean floor
      ctx.fillStyle = "#030306";
      ctx.fillRect(0, H - 8, W, 8);

      // --- Rock (on top of waves) ---
      drawRock(t);

      timeRef.current += 0.035;
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div className="lh-scene" style={{ width: W, height: H }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 2, pointerEvents: "none" }}
        />

        {/* Lighthouse sitting on rock */}
        <div className="lh-lighthouse">
          <div className="lh-lantern">
            <div className="lh-lantern-inner" />
          </div>
          <div className="lh-tower">
            <div className="lh-win" style={{ top: 7 }} />
            <div className="lh-win" style={{ top: 27 }} />
          </div>
          <div className="lh-tower-base" />
        </div>
      </div>

      <div className="lh-loading-text">
        {text}
        <span className="lh-dots">
          <span>.</span><span>.</span><span>.</span>
        </span>
      </div>
    </div>
  );
}