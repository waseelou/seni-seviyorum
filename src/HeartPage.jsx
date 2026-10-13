import { useEffect, useRef } from "react";

// long phrase is repeated so it shows up most
const PHRASES = [
  "Ez je te hez dıkım",
  "Ez je te hez dıkım",
  "Ez je te hez dıkım",
  "hez dıkım",
  "❤",
  "❤",
];

const SPAWN_TIME = 4500; // ms until the last phrase starts flying out
const FLY_TIME = 1100;   // ms each phrase takes to spiral into place

const ease = (p) => 1 - Math.pow(1 - p, 3);

// classic heart shape: (x² + y² − 1)³ − x²y³ ≤ 0
function inHeart(x, y) {
  const a = x * x + y * y - 1;
  return a * a * a - x * x * y * y * y <= 0;
}

function buildHeart(ctx, w, h) {
  const S = Math.min(w, h) / 2.9;
  const cx = w / 2;
  const cy = h * 0.46; // a bit above center to leave room for the button
  const inside = (px, py) => inHeart((px - cx) / S, (cy - py) / S + 0.125);

  // distance from the center to the heart's edge, in every direction
  const DIRS = 720;
  const edgeR = [];
  for (let i = 0; i < DIRS; i++) {
    const a = (i / DIRS) * Math.PI * 2;
    let R = 0;
    while (R < 2 * S && inside(cx + Math.cos(a) * R, cy + Math.sin(a) * R)) R += 1;
    edgeR.push(R);
  }
  // soften the sharp dip at the top so letters don't bunch up there
  const raw = edgeR.slice();
  for (let i = 0; i < DIRS; i++) {
    let sum = 0;
    for (let k = -8; k <= 8; k++) sum += raw[(i + k + DIRS) % DIRS];
    edgeR[i] = sum / 17;
  }
  const edgeAt = (a) => {
    const f = ((((a / (Math.PI * 2)) % 1) + 1) % 1) * DIRS;
    const i = Math.floor(f);
    const k = f - i;
    return edgeR[i % DIRS] * (1 - k) + edgeR[(i + 1) % DIRS] * k;
  };
  const avgEdge = edgeR.reduce((sum, r) => sum + r, 0) / DIRS;

  const size = Math.max(9, S * 0.048);
  const font = `600 ${size.toFixed(1)}px "Segoe UI", system-ui, sans-serif`;
  const turns = avgEdge / (size * 1.45); // spacing between spiral rings
  const maxT = turns * Math.PI * 2;

  // the spiral path: grows from the center and ends exactly on the heart outline
  const pts = [];
  let len = 0;
  for (let t = 0; t <= maxT; t += 0.004) {
    const u = t / maxT;
    const r = u * (edgeAt(t) - size * 0.6);
    const p = { x: cx + Math.cos(t) * r, y: cy + Math.sin(t) * r, r, u };
    const prev = pts[pts.length - 1];
    if (prev) len += Math.hypot(p.x - prev.x, p.y - prev.y);
    p.s = len;
    pts.push(p);
  }

  // position at a given distance along the spiral (only ever walks forward)
  let j = 0;
  const at = (s) => {
    while (j < pts.length - 2 && pts[j + 1].s < s) j++;
    const a = pts[j];
    const b = pts[j + 1];
    const k = (s - a.s) / (b.s - a.s || 1);
    return {
      x: a.x + (b.x - a.x) * k,
      y: a.y + (b.y - a.y) * k,
      rot: Math.atan2(b.y - a.y, b.x - a.x),
      u: a.u,
    };
  };

  // write the phrases letter by letter along the spiral
  ctx.font = font;
  let s = pts.find((p) => p.r > size * 1.5).s; // skip the cramped very middle
  const words = [];
  for (;;) {
    const chars = Array.from(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
    const widths = chars.map((c) => ctx.measureText(c).width);
    const total = widths.reduce((sum, wd) => sum + wd, 0);
    if (s + total > len) break;

    const word = { chars: [] };
    chars.forEach((ch, i) => {
      const p = at(s + widths[i] / 2);
      const dx = p.x - cx;
      const dy = p.y - cy;
      word.chars.push({ ch, r: Math.hypot(dx, dy), a: Math.atan2(dy, dx), rot: p.rot });
      s += widths[i];
    });
    words.push(word);
    s += size * 0.6;
  }

  // the spiral already goes inside-out, so words appear in that order
  words.forEach((wd, i) => (wd.start = (i / words.length) * SPAWN_TIME));

  return { words, font, cx, cy, bottom: cy + 1.125 * S };
}

export default function HeartPage({ onNext }) {
  const canvasRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    const next = nextRef.current;
    let showTimer;
    // hide the button, then fade it in once the heart is done
    const showNextLater = () => {
      clearTimeout(showTimer);
      next.style.opacity = "0";
      next.style.pointerEvents = "none";
      showTimer = setTimeout(() => {
        next.style.opacity = "1";
        next.style.pointerEvents = "auto";
      }, SPAWN_TIME + FLY_TIME);
    };

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w, h, dpr, heart, bg, frame;
    let start = performance.now();

    const setup = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      heart = buildHeart(ctx, w, h);
      next.style.top = heart.bottom + 24 + "px";
      bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
      bg.addColorStop(0, "#0b0b0b");
      bg.addColorStop(1, "#0b0b0b");
    };

    const replay = () => {
      start = performance.now();
      showNextLater();
    };

    const draw = (now) => {
      const t = now - start;
      const { words, font, cx, cy } = heart;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "#570a0a";

      for (const wd of words) {
        const p = (t - wd.start) / FLY_TIME;
        if (p <= 0) continue;
        const e = ease(Math.min(p, 1));
        const spin = (1 - e) * Math.PI * 2.5; // spirals out while flying in
        const glow = p < 1 ? 1 - p : 0; // brief flash while flying in

        ctx.globalAlpha = Math.min(1, p * 2.5);
        // #570a0a, lit up a little while the word is flying in
        ctx.fillStyle = glow > 0 ? `hsl(0, 79%, ${19 + 35 * glow}%)` : "#570a0a";
        ctx.shadowBlur = glow > 0.05 ? 18 * glow : 0;

        for (const c of wd.chars) {
          const ang = c.a + spin;
          const x = cx + Math.cos(ang) * c.r * e;
          const y = cy + Math.sin(ang) * c.r * e;
          const cos = Math.cos(c.rot + spin) * dpr;
          const sin = Math.sin(c.rot + spin) * dpr;
          ctx.setTransform(cos, sin, -sin, cos, x * dpr, y * dpr);
          ctx.fillText(c.ch, 0, 0);
        }
      }

      frame = requestAnimationFrame(draw);
    };

    setup();
    showNextLater();
    window.addEventListener("resize", setup);
    canvas.addEventListener("click", replay);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(showTimer);
      window.removeEventListener("resize", setup);
      canvas.removeEventListener("click", replay);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ position: "fixed", top: 0, left: 0, display: "block", cursor: "pointer" }}
      />
      <button
        ref={nextRef}
        onClick={onNext}
        style={{
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: 0,
          pointerEvents: "none",
          transition: "opacity 1s ease",
          padding: "10px 28px",
          borderRadius: 999,
          border: "none",
          background: "#570a0a",
          color: "#f3e6e1",
          fontFamily: '"Segoe UI", system-ui, sans-serif',
          fontSize: 15,
          letterSpacing: 0.5,
          cursor: "pointer",
        }}
      >
        next
      </button>
    </>
  );
}
