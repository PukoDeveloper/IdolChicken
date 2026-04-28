import * as PIXI from 'pixi.js';
import { BaseScene } from './BaseScene.js';
import { ChickenSprite } from '../graphics/ChickenSprite.js';
import { CHICKENS } from '../data/chickens.js';
import { WELCOME_DIALOGUES } from '../data/dialogues.js';
import { DialogueSystem } from '../systems/DialogueSystem.js';

export class WelcomeScene extends BaseScene {
  constructor(sceneManager) {
    super(sceneManager);
    this._chicken     = null;
    this._dialogueSys = null;
    this._time        = 0;
  }

  init() {
    const W = this.sceneManager.width;
    const H = this.sceneManager.height;

    this._drawBackground(W, H);
    this._createChickenPortrait(W, H);

    this._dialogueSys = new DialogueSystem(
      this.container,
      WELCOME_DIALOGUES,
      W, H,
      {
        lastLabel: '▶ 前往休息室',
        onComplete: () => {
          this.sceneManager.save({ initialized: true });
          import('./LoungeScene.js')
            .then(({ LoungeScene }) => this.sceneManager.changeScene(new LoungeScene(this.sceneManager)))
            .catch((err) => console.error('Failed to load LoungeScene:', err));
        },
      }
    );
    this._dialogueSys.start();
  }

  // ── Background ──────────────────────────────────────────────────────────────
  _drawBackground(W, H) {
    const g = new PIXI.Graphics();

    // Cream office wall (upper 60%)
    g.beginFill(0xFFF3E0);
    g.drawRect(0, 0, W, H * 0.62);
    g.endFill();

    // Warm wood floor (lower 38%)
    g.beginFill(0xC8966A);
    g.drawRect(0, H * 0.62, W, H * 0.38);
    g.endFill();

    // Baseboard
    g.beginFill(0x9B7048);
    g.drawRect(0, H * 0.62, W, 10);
    g.endFill();

    // Subtle ceiling light glow
    for (let i = 5; i >= 0; i--) {
      g.beginFill(0xFFFFEE, (6 - i) * 0.022);
      g.drawRect(0, 0, W, (i + 1) * 18);
      g.endFill();
    }

    // Floor planks
    g.lineStyle(1, 0xAA7744, 0.3);
    for (let i = 1; i <= 5; i++) {
      const y = H * 0.62 + 10 + i * ((H * 0.38 - 10) / 6);
      g.moveTo(0, y);
      g.lineTo(W, y);
    }
    g.lineStyle(0);

    this.container.addChild(g);

    // Decorations
    this._drawOfficeDecorations(W, H);
  }

  _drawOfficeDecorations(W, H) {
    const g = new PIXI.Graphics();

    // Agency sign board on wall (centered-right)
    const signX = W * 0.52;
    const signY = H * 0.06;
    const signW = Math.min(W * 0.42, 220);
    const signH = Math.min(H * 0.1, 52);
    g.beginFill(0x8B5E3C);
    g.drawRoundedRect(signX, signY, signW, signH, 6);
    g.endFill();
    g.lineStyle(2, 0xFFD580);
    g.drawRoundedRect(signX, signY, signW, signH, 6);
    g.lineStyle(0);

    // Decorative star on sign
    g.beginFill(0xFFD580, 0.7);
    const sp = _starPoints(signX + 22, signY + signH / 2, 9, 4);
    g.drawPolygon(sp);
    g.endFill();

    // Potted plant (left side)
    const plantX = W * 0.06;
    const plantY = H * 0.42;
    g.beginFill(0x7B3F1E);
    g.drawRoundedRect(plantX, plantY, 28, 34, 4);
    g.endFill();
    g.beginFill(0x228B22);
    g.drawEllipse(plantX + 14, plantY - 14, 22, 16);
    g.drawEllipse(plantX + 6, plantY - 4, 12, 10);
    g.drawEllipse(plantX + 22, plantY - 4, 12, 10);
    g.endFill();

    // Picture frame (left wall)
    const frmX = W * 0.04;
    const frmY = H * 0.08;
    const frmW = Math.min(W * 0.22, 100);
    const frmH = Math.min(H * 0.28, 120);
    g.lineStyle(4, 0x6B4226);
    g.drawRoundedRect(frmX, frmY, frmW, frmH, 4);
    g.lineStyle(0);
    g.beginFill(0xE8D5C4);
    g.drawRect(frmX + 4, frmY + 4, frmW - 8, frmH - 8);
    g.endFill();
    // Star in frame
    g.beginFill(0xFFD700, 0.5);
    g.drawPolygon(_starPoints(frmX + frmW / 2, frmY + frmH / 2, frmH * 0.28, frmH * 0.13));
    g.endFill();

    this.container.addChild(g);

    // Sign label text
    const signLabel = new PIXI.Text('雞翅事務所', {
      fontFamily: 'Arial',
      fontSize: Math.min(signH * 0.48, 22),
      fill: 0xFFD580,
      fontWeight: 'bold',
    });
    signLabel.anchor.set(0, 0.5);
    signLabel.x = signX + 38;
    signLabel.y = signY + signH / 2;
    this.container.addChild(signLabel);
  }

  // ── Chicken portrait ────────────────────────────────────────────────────────
  _createChickenPortrait(W, H) {
    const scale    = Math.min(W * 0.0048, 2.8, H * 0.003);
    const director = CHICKENS.director;
    this._chicken  = new ChickenSprite(scale, director);
    this._chicken.x      = W * 0.5;
    this._chicken._baseY = H * 0.4;
    this._chicken.y      = this._chicken._baseY;
    this.container.addChild(this._chicken);
  }

  // ── Update loop ─────────────────────────────────────────────────────────────
  update(delta) {
    this._time += delta * 0.04;
    if (this._chicken)     this._chicken.update(delta);
    if (this._dialogueSys) this._dialogueSys.update(delta);
  }

  destroy() {
    if (this._dialogueSys) {
      this._dialogueSys.destroy();
      this._dialogueSys = null;
    }
    super.destroy();
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
