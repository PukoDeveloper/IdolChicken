import * as PIXI from 'pixi.js';
import { BaseScene } from './BaseScene.js';
import { ChickenSprite } from '../graphics/ChickenSprite.js';

export class ResultScene extends BaseScene {
  constructor(sceneManager) {
    super(sceneManager);
    this._time    = 0;
    this._chicken = null;
    this._stars   = [];
  }

  init() {
    const W = this.sceneManager.width;
    const H = this.sceneManager.height;
    const d = this.sceneManager.gameData;

    this._drawBackground(W, H);
    this._createStars(W, H);
    this._drawPanel(W, H);
    this._drawTitle(W, H);
    this._drawStats(W, H, d);
    this._drawRating(W, H, d);
    this._createChicken(W, H, d);
    this._createButtons(W, H);
  }

  // ── Background ────────────────────────────────────────────────────────────
  _drawBackground(W, H) {
    const g = new PIXI.Graphics();
    g.beginFill(0x06031A);
    g.drawRect(0, 0, W, H);
    g.endFill();
    // radial-ish glow from centre
    for (let i = 10; i >= 0; i--) {
      g.beginFill(0x8822FF, (11 - i) * 0.008);
      g.drawEllipse(W / 2, H / 2, (W / 2) * (i / 10 + 0.3), (H / 2) * (i / 10 + 0.3));
      g.endFill();
    }
    this.container.addChild(g);
  }

  _createStars(W, H) {
    const c = new PIXI.Container();
    for (let i = 0; i < 50; i++) {
      const g = new PIXI.Graphics();
      g.beginFill(0xFFFFFF);
      g.drawCircle(0, 0, Math.random() * 1.6 + 0.3);
      g.endFill();
      g.x = Math.random() * W;
      g.y = Math.random() * H;
      g._phase = Math.random() * Math.PI * 2;
      g._spd   = Math.random() * 0.06 + 0.02;
      c.addChild(g);
      this._stars.push(g);
    }
    this.container.addChild(c);
  }

  _drawPanel(W, H) {
    const g = new PIXI.Graphics();
    g.beginFill(0x12083A, 0.92);
    g.drawRoundedRect(W * 0.1, H * 0.08, W * 0.8, H * 0.82, 20);
    g.endFill();
    g.lineStyle(2.5, 0xAA44FF, 0.8);
    g.drawRoundedRect(W * 0.1, H * 0.08, W * 0.8, H * 0.82, 20);
    this.container.addChild(g);
  }

  _drawTitle(W, H) {
    const t = new PIXI.Text('RESULT', {
      fontFamily: 'Impact, Arial Black, Arial',
      fontSize: 60,
      fill: ['#FF88FF', '#FF22CC'],
      fillGradientType: 1,
      fillGradientStops: [0, 1],
      stroke: '#880044',
      strokeThickness: 5,
      dropShadow: true,
      dropShadowColor: '#FF0088',
      dropShadowBlur: 14,
      dropShadowDistance: 3,
    });
    t.anchor.set(0.5);
    t.x = W / 2;
    t.y = H * 0.08 + 50;
    this.container.addChild(t);
  }

  // ── Stats table ───────────────────────────────────────────────────────────
  _drawStats(W, H, d) {
    const rows = [
      { label: 'SCORE',    value: String(d.score).padStart(6, '0'), color: 0xFFFFFF },
      { label: 'PERFECT',  value: String(d.perfect),                color: 0xFFFF44 },
      { label: 'GOOD',     value: String(d.good),                   color: 0x88FF88 },
      { label: 'MISS',     value: String(d.miss),                   color: 0xFF4455 },
      { label: 'MAX COMBO',value: `x${d.maxCombo}`,                 color: 0xFF88FF },
    ];

    const startY = H * 0.28;
    const lineH  = 44;
    const leftX  = W * 0.2;
    const rightX = W * 0.8;

    rows.forEach((row, i) => {
      const y = startY + i * lineH;

      // separator
      const sep = new PIXI.Graphics();
      sep.lineStyle(1, 0x444466, 0.5);
      sep.moveTo(leftX, y - 2); sep.lineTo(rightX, y - 2);
      this.container.addChild(sep);

      const lbl = new PIXI.Text(row.label, {
        fontFamily: 'Arial', fontSize: 16, fill: 0x9999BB, fontWeight: 'bold',
      });
      lbl.x = leftX; lbl.y = y + 6;
      this.container.addChild(lbl);

      const val = new PIXI.Text(row.value, {
        fontFamily: 'Arial Black, Arial', fontSize: 26,
        fill: row.color, stroke: 0x000000, strokeThickness: 3,
      });
      val.anchor.set(1, 0);
      val.x = rightX; val.y = y;
      this.container.addChild(val);
    });
  }

  // ── Rating ────────────────────────────────────────────────────────────────
  _drawRating(W, H, d) {
    const total   = d.total || 1;
    const pctHit  = (d.perfect + d.good) / total;
    let grade, color;
    if      (d.miss === 0 && d.perfect === total) { grade = 'S+'; color = 0xFF88FF; }
    else if (pctHit >= 0.95)                      { grade = 'S';  color = 0xFFDD44; }
    else if (pctHit >= 0.85)                      { grade = 'A';  color = 0x88FF88; }
    else if (pctHit >= 0.70)                      { grade = 'B';  color = 0x44CCFF; }
    else if (pctHit >= 0.50)                      { grade = 'C';  color = 0xFF8833; }
    else                                           { grade = 'D';  color = 0xFF4444; }

    const t = new PIXI.Text(grade, {
      fontFamily: 'Impact, Arial Black',
      fontSize: 90,
      fill: color,
      stroke: 0x000000,
      strokeThickness: 7,
      dropShadow: true,
      dropShadowBlur: 20,
      dropShadowColor: color,
      dropShadowDistance: 0,
    });
    t.anchor.set(0.5);
    t.x = W * 0.82;
    t.y = H * 0.62;
    this.container.addChild(t);
    this._ratingText = t;
    this._ratingColor = color;
  }

  // ── Chicken ───────────────────────────────────────────────────────────────
  _createChicken(W, H, d) {
    this._chicken = new ChickenSprite(1.1);
    this._chicken.x = W * 0.2;
    this._chicken._baseY = H * 0.70;
    this._chicken.y = this._chicken._baseY;
    const happy = d.miss < (d.total || 1) * 0.3;
    this._chicken.setExcited(happy);
    this.container.addChild(this._chicken);
  }

  // ── Buttons ───────────────────────────────────────────────────────────────
  _createButtons(W, H) {
    const makeBtn = (label, color, x, onClick) => {
      const btn = new PIXI.Container();
      btn.interactive = true;
      btn.cursor = 'pointer';

      const bg = new PIXI.Graphics();
      bg.beginFill(color);
      bg.drawRoundedRect(-100, -22, 200, 44, 22);
      bg.endFill();
      bg.lineStyle(2, 0xFFFFFF, 0.4);
      bg.drawRoundedRect(-100, -22, 200, 44, 22);

      const lbl = new PIXI.Text(label, {
        fontFamily: 'Arial', fontSize: 18, fill: 0xFFFFFF, fontWeight: 'bold',
      });
      lbl.anchor.set(0.5);

      btn.addChild(bg); btn.addChild(lbl);
      btn.x = x; btn.y = H - 52;
      btn.on('pointerdown', onClick);
      btn.on('pointerover', () => { btn.alpha = 0.78; });
      btn.on('pointerout',  () => { btn.alpha = 1.0; });
      this.container.addChild(btn);
    };

    makeBtn('▶ Play Again', 0xCC1166, W * 0.35, () => {
      import('./GameScene.js').then(({ GameScene }) => {
        this.sceneManager.changeScene(new GameScene(this.sceneManager));
      });
    });

    makeBtn('⌂ Title', 0x334488, W * 0.65, () => {
      import('./TitleScene.js').then(({ TitleScene }) => {
        this.sceneManager.changeScene(new TitleScene(this.sceneManager));
      });
    });
  }

  // ── Update ────────────────────────────────────────────────────────────────
  update(delta) {
    this._time += delta * 0.04;

    this._stars.forEach(s => {
      s.alpha = 0.2 + Math.sin(this._time * s._spd * 30 + s._phase) * 0.8;
    });

    if (this._chicken) this._chicken.update(delta);

    if (this._ratingText) {
      const p = 1 + Math.sin(this._time * 2.0) * 0.06;
      this._ratingText.scale.set(p);
    }
  }
}
