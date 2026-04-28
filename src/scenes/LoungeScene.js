import * as PIXI from 'pixi.js';
import { BaseScene } from './BaseScene.js';
import { ChickenSprite } from '../graphics/ChickenSprite.js';
import { IDOL_ROSTER } from '../data/chickens.js';

// ── Seat layout ───────────────────────────────────────────────────────────────
// 6 seats: 2 rows of 3. Add more entries here to expand the team in future.
// colFrac / rowFrac: position as fraction of screen W/H
// scale: relative size (smaller = farther back, creates perspective feel)
const SEAT_CONFIGS = [
  // Back row — smaller, positioned near wall/floor boundary
  { colFrac: 0.20, rowFrac: 0.54, scale: 0.72 },
  { colFrac: 0.50, rowFrac: 0.54, scale: 0.72 },
  { colFrac: 0.80, rowFrac: 0.54, scale: 0.72 },
  // Front row — larger, positioned in the lower floor area
  { colFrac: 0.20, rowFrac: 0.82, scale: 1.00 },
  { colFrac: 0.50, rowFrac: 0.82, scale: 1.00 },
  { colFrac: 0.80, rowFrac: 0.82, scale: 1.00 },
];

const IDOL_NAMES = IDOL_ROSTER.map(c => c.name);

export class LoungeScene extends BaseScene {
  constructor(sceneManager) {
    super(sceneManager);
    this._chickens = [];
    this._time = 0;
  }

  init() {
    const W = this.sceneManager.width;
    const H = this.sceneManager.height;

    this._drawRoom(W, H);
    this._drawDecorations(W, H);

    // Layer order: seat backrests → chickens → seat fronts → name tags
    SEAT_CONFIGS.forEach(cfg => this._drawSeatBack(W, H, cfg));
    SEAT_CONFIGS.forEach((cfg, i) => this._placeChicken(W, H, cfg, i));
    SEAT_CONFIGS.forEach(cfg => this._drawSeatFront(W, H, cfg));
    SEAT_CONFIGS.forEach((cfg, i) => this._drawNameTag(W, H, cfg, IDOL_NAMES[i]));

    this._drawRoomHeader(W, H);
  }

  // ── Room background ─────────────────────────────────────────────────────────
  _drawRoom(W, H) {
    const g = new PIXI.Graphics();
    const wallH = H * 0.50;

    // Back wall (upper half) — warm cream
    g.beginFill(0xFFF0DC);
    g.drawRect(0, 0, W, wallH);
    g.endFill();

    // Floor (lower half) — warm wood
    g.beginFill(0xC8966A);
    g.drawRect(0, wallH, W, H - wallH);
    g.endFill();

    // Baseboard
    g.beginFill(0x9B7048);
    g.drawRect(0, wallH, W, 10);
    g.endFill();

    // Ceiling glow strip
    for (let i = 5; i >= 0; i--) {
      g.beginFill(0xFFFFEE, (6 - i) * 0.024);
      g.drawRect(0, 0, W, (i + 1) * 18);
      g.endFill();
    }

    // Floor planks (horizontal)
    g.lineStyle(1, 0xAA7744, 0.32);
    for (let i = 1; i <= 6; i++) {
      const y = wallH + 10 + i * ((H - wallH - 10) / 7);
      g.moveTo(0, y);
      g.lineTo(W, y);
    }
    // Subtle diagonal wood grain
    g.lineStyle(1, 0xAA7744, 0.10);
    for (let i = 0; i < 14; i++) {
      const x = W * (i / 14);
      g.moveTo(x, wallH);
      g.lineTo(x + W * 0.12, H);
    }
    g.lineStyle(0);

    // Soft pink rug under seats
    g.beginFill(0xFF99BB, 0.22);
    g.drawEllipse(W / 2, wallH + (H - wallH) * 0.60, W * 0.46, (H - wallH) * 0.34);
    g.endFill();
    g.lineStyle(2, 0xFF77AA, 0.28);
    g.drawEllipse(W / 2, wallH + (H - wallH) * 0.60, W * 0.46, (H - wallH) * 0.34);
    g.lineStyle(0);

    this.container.addChild(g);
  }

  // ── Wall decorations ────────────────────────────────────────────────────────
  _drawDecorations(W, H) {
    const g = new PIXI.Graphics();
    const wallH = H * 0.50;

    // Center window
    const winW = Math.min(W * 0.24, 130);
    const winH = wallH * 0.58;
    const winX = W / 2 - winW / 2;
    const winY = wallH * 0.10;

    // Sky
    g.beginFill(0x87CEEB);
    g.drawRect(winX, winY, winW, winH);
    g.endFill();
    // Clouds
    g.beginFill(0xFFFFFF, 0.85);
    g.drawEllipse(winX + winW * 0.28, winY + winH * 0.22, winW * 0.22, winH * 0.10);
    g.drawEllipse(winX + winW * 0.68, winY + winH * 0.42, winW * 0.20, winH * 0.09);
    g.endFill();
    // Window frame
    g.lineStyle(4, 0x8B6914);
    g.drawRect(winX, winY, winW, winH);
    g.moveTo(winX + winW / 2, winY);
    g.lineTo(winX + winW / 2, winY + winH);
    g.moveTo(winX, winY + winH / 2);
    g.lineTo(winX + winW, winY + winH / 2);
    g.lineStyle(0);

    // Left poster
    this._drawPoster(g, W * 0.04, wallH * 0.08, Math.min(W * 0.18, 80), wallH * 0.60);
    // Right poster
    this._drawPoster(g, W * 0.78, wallH * 0.08, Math.min(W * 0.18, 80), wallH * 0.60);

    this.container.addChild(g);
  }

  _drawPoster(g, x, y, w, h) {
    g.beginFill(0xFFEEFF);
    g.drawRoundedRect(x, y, w, h, 4);
    g.endFill();
    g.lineStyle(3, 0xCC44AA);
    g.drawRoundedRect(x, y, w, h, 4);
    g.lineStyle(0);
    // Star on poster
    g.beginFill(0xFF88CC, 0.65);
    g.drawPolygon(_starPoints(x + w / 2, y + h * 0.46, Math.min(w, h) * 0.30, Math.min(w, h) * 0.13));
    g.endFill();
  }

  // ── Seat backrest (drawn before the chicken) ────────────────────────────────
  _drawSeatBack(W, H, cfg) {
    const x = W * cfg.colFrac;
    const y = H * cfg.rowFrac;
    const s = cfg.scale;
    const seatH = 30 * s;
    const backW = 72 * s;
    const backH = 60 * s;

    const g = new PIXI.Graphics();
    // Main backrest
    g.beginFill(0xCC3B6E);
    g.drawRoundedRect(-backW / 2, -seatH / 2 - backH, backW, backH, 9 * s);
    g.endFill();
    // Cushion highlight
    g.beginFill(0xFF6699, 0.45);
    g.drawRoundedRect(-backW / 2 + 6 * s, -seatH / 2 - backH + 6 * s, backW - 12 * s, backH - 10 * s, 7 * s);
    g.endFill();

    g.x = x;
    g.y = y;
    this.container.addChild(g);
  }

  // ── Chicken placement (between backrest and seat front) ─────────────────────
  _placeChicken(W, H, cfg, index) {
    const x = W * cfg.colFrac;
    const y = H * cfg.rowFrac;
    const s = cfg.scale;
    const seatH = 30 * s;
    const chickenScale = s * 0.85;

    // Position the chicken so its body sits partway into the seat cushion,
    // while its head and upper body remain visible above the backrest.
    const seatTopY = y - seatH / 2;
    const chicken = new ChickenSprite(chickenScale, IDOL_ROSTER[index]);
    chicken.x = x;
    chicken._baseY = seatTopY - 38 * chickenScale;
    chicken.y = chicken._baseY;

    this.container.addChild(chicken);
    this._chickens.push(chicken);
  }

  // ── Seat front (drawn over the chicken's feet) ──────────────────────────────
  _drawSeatFront(W, H, cfg) {
    const x = W * cfg.colFrac;
    const y = H * cfg.rowFrac;
    const s = cfg.scale;
    const seatW = 84 * s;
    const seatH = 30 * s;
    const legH = 18 * s;
    const legW = 7 * s;

    const g = new PIXI.Graphics();
    // Seat body
    g.beginFill(0xCC3B6E);
    g.drawRoundedRect(-seatW / 2, -seatH / 2, seatW, seatH, 8 * s);
    g.endFill();
    // Seat cushion highlight
    g.beginFill(0xFF6699, 0.50);
    g.drawRoundedRect(-seatW / 2 + 6 * s, -seatH / 2 + 4 * s, seatW - 12 * s, seatH / 2 - 2 * s, 5 * s);
    g.endFill();
    // Front legs
    g.beginFill(0x8B2E52);
    g.drawRoundedRect(-seatW / 2 + 6 * s, seatH / 2, legW, legH, 2 * s);
    g.drawRoundedRect(seatW / 2 - 6 * s - legW, seatH / 2, legW, legH, 2 * s);
    g.endFill();

    g.x = x;
    g.y = y;
    this.container.addChild(g);
  }

  // ── Name tag below each seat ────────────────────────────────────────────────
  _drawNameTag(W, H, cfg, name) {
    const x = W * cfg.colFrac;
    const y = H * cfg.rowFrac;
    const s = cfg.scale;
    const seatH = 30 * s;
    const legH = 18 * s;

    const tag = new PIXI.Text(name, {
      fontFamily: 'Arial',
      fontSize: Math.max(10, Math.min(14 * s, 16)),
      fill: 0xFFFFFF,
      stroke: 0x550022,
      strokeThickness: 3,
      fontWeight: 'bold',
    });
    tag.anchor.set(0.5);
    tag.x = x;
    tag.y = y + seatH / 2 + legH + 7 * s;
    this.container.addChild(tag);
  }

  // ── Room label header ────────────────────────────────────────────────────────
  _drawRoomHeader(W, H) {
    const strip = new PIXI.Graphics();
    strip.beginFill(0x000000, 0.28);
    strip.drawRect(0, 0, W, 42);
    strip.endFill();
    this.container.addChild(strip);

    const label = new PIXI.Text('休息室', {
      fontFamily: 'Arial',
      fontSize: 22,
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 4,
      dropShadow: true,
      dropShadowBlur: 6,
      dropShadowColor: 0x000000,
      dropShadowDistance: 2,
    });
    label.anchor.set(0.5, 0.5);
    label.x = W / 2;
    label.y = 21;
    this.container.addChild(label);
  }

  // ── Update loop ─────────────────────────────────────────────────────────────
  update(delta) {
    this._time += delta * 0.04;
    this._chickens.forEach(c => c.update(delta));
  }
}

// ── Helper ────────────────────────────────────────────────────────────────────
function _starPoints(cx, cy, outer, inner) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  return pts;
}
