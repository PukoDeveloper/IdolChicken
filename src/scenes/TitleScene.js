import * as PIXI from 'pixi.js';
import { BaseScene } from './BaseScene.js';
import { ChickenSprite } from '../graphics/ChickenSprite.js';

export class TitleScene extends BaseScene {
  constructor(sceneManager) {
    super(sceneManager);
    this._time = 0;
    this._stars = [];
    this._chicken = null;
    this._startBtn = null;
    this._sparkles = null;
    this._floatingNotes = [];
  }

  init() {
    const W = this.sceneManager.width;
    const H = this.sceneManager.height;

    this._drawBackground(W, H);
    this._createStars(W, H);
    this._drawSpotlights(W, H);
    this._drawCurtains(W, H);
    this._drawStage(W, H);
    this._drawTitle(W, H);
    this._createChicken(W, H);
    this._createStartButton(W, H);
    this._createFloatingNotes(W, H);
  }

  // ── Background ─────────────────────────────────────────────────────────────
  _drawBackground(W, H) {
    const g = new PIXI.Graphics();
    g.beginFill(0x080830);
    g.drawRect(0, 0, W, H);
    g.endFill();
    // horizon glow
    for (let i = 0; i < 15; i++) {
      g.beginFill(0xAA22FF, (1 - i / 15) * 0.14);
      g.drawRect(0, H - i * 22, W, 22);
      g.endFill();
    }
    this.container.addChild(g);
  }

  _createStars(W, H) {
    const container = new PIXI.Container();
    for (let i = 0; i < 70; i++) {
      const g = new PIXI.Graphics();
      const r = Math.random() * 1.8 + 0.4;
      g.beginFill(0xFFFFFF);
      g.drawCircle(0, 0, r);
      g.endFill();
      g.x = Math.random() * W;
      g.y = Math.random() * H * 0.62;
      g._phase = Math.random() * Math.PI * 2;
      g._spd   = Math.random() * 0.04 + 0.02;
      container.addChild(g);
      this._stars.push(g);
    }
    this.container.addChild(container);
  }

  _drawSpotlights(W, H) {
    const g = new PIXI.Graphics();
    g.beginFill(0xFFFFCC, 0.04);
    g.drawPolygon([W * 0.07, 0, W * 0.03, 0, W * 0.38, H, W * 0.50, H]);
    g.endFill();
    g.beginFill(0xFFFFCC, 0.04);
    g.drawPolygon([W * 0.93, 0, W * 0.97, 0, W * 0.62, H, W * 0.50, H]);
    g.endFill();
    this.container.addChild(g);
  }

  _drawCurtains(W, H) {
    const g = new PIXI.Graphics();
    g.beginFill(0x770022);
    g.drawRect(0, 0, 42, H);
    g.endFill();
    g.beginFill(0x990033, 0.45);
    g.drawRect(32, 0, 18, H);
    g.endFill();
    g.beginFill(0x770022);
    g.drawRect(W - 42, 0, 42, H);
    g.endFill();
    g.beginFill(0x990033, 0.45);
    g.drawRect(W - 50, 0, 18, H);
    g.endFill();
    this.container.addChild(g);
  }

  _drawStage(W, H) {
    const g = new PIXI.Graphics();
    g.beginFill(0x28104A);
    g.drawRect(55, H - 140, W - 110, 140);
    g.endFill();
    g.lineStyle(3, 0xCC44FF);
    g.moveTo(55, H - 140);
    g.lineTo(W - 55, H - 140);
    g.lineStyle(0);
    // glowing floor strips
    for (let i = 0; i < 6; i++) {
      g.beginFill(0xFF44AA, 0.06 + i * 0.015);
      g.drawRect(55 + i * 32, H - 140, 16, 140);
      g.endFill();
    }
    this.container.addChild(g);
  }

  // ── Title text ─────────────────────────────────────────────────────────────
  _drawTitle(W, H) {
    const idol = new PIXI.Text('IDOL', {
      fontFamily: 'Impact, Arial Black, Arial',
      fontSize: 86,
      fill: ['#FFD700', '#FF8C00'],
      fillGradientType: 1,
      fillGradientStops: [0, 1],
      stroke: '#CC4400',
      strokeThickness: 6,
      dropShadow: true,
      dropShadowColor: '#FF0088',
      dropShadowBlur: 16,
      dropShadowDistance: 4,
    });
    idol.anchor.set(0.5);
    idol.x = W / 2;
    idol.y = 82;
    this.container.addChild(idol);

    const chk = new PIXI.Text('CHICKEN', {
      fontFamily: 'Impact, Arial Black, Arial',
      fontSize: 72,
      fill: ['#FF88FF', '#FF22CC'],
      fillGradientType: 1,
      fillGradientStops: [0, 1],
      stroke: '#880044',
      strokeThickness: 6,
      dropShadow: true,
      dropShadowColor: '#FF0088',
      dropShadowBlur: 14,
      dropShadowDistance: 3,
    });
    chk.anchor.set(0.5);
    chk.x = W / 2;
    chk.y = 166;
    this.container.addChild(chk);

    const sub = new PIXI.Text('偶像雞  ✦  Rhythm Adventure', {
      fontFamily: 'Arial',
      fontSize: 17,
      fill: 0xCCAEFF,
      dropShadow: true,
      dropShadowBlur: 6,
      dropShadowColor: '#880088',
      dropShadowDistance: 2,
    });
    sub.anchor.set(0.5);
    sub.x = W / 2;
    sub.y = 225;
    this.container.addChild(sub);

    this._titleMain = idol;
  }

  // ── Chicken + sparkles ─────────────────────────────────────────────────────
  _createChicken(W, H) {
    this._chicken = new ChickenSprite(1.6);
    this._chicken.x = W / 2;
    this._chicken._baseY = H - 148;
    this._chicken.y = this._chicken._baseY;
    this.container.addChild(this._chicken);

    // decorative 5-point stars around the chicken
    const spk = new PIXI.Graphics();
    const positions = [
      [-85, -85], [85, -85], [-108, -28], [108, -28],
      [-62, 22], [62, 22], [0, -115],
    ];
    positions.forEach(([dx, dy]) => {
      spk.beginFill(0xFFFF88, 0.85);
      spk.drawPolygon(_starPoints(dx, dy, 9, 4));
      spk.endFill();
    });
    spk.x = W / 2;
    spk.y = H - 148;
    this.container.addChild(spk);
    this._sparkles = spk;
  }

  // ── Start button ───────────────────────────────────────────────────────────
  _createStartButton(W, H) {
    const btn = new PIXI.Container();
    btn.interactive = true;
    btn.cursor = 'pointer';

    const bg = new PIXI.Graphics();
    bg.beginFill(0xDD1166);
    bg.drawRoundedRect(-145, -30, 290, 60, 30);
    bg.endFill();
    bg.lineStyle(2, 0xFF88CC);
    bg.drawRoundedRect(-145, -30, 290, 60, 30);

    const label = new PIXI.Text('▶  點擊開始  Click to Start', {
      fontFamily: 'Arial',
      fontSize: 22,
      fill: 0xFFFFFF,
      fontWeight: 'bold',
    });
    label.anchor.set(0.5);

    btn.addChild(bg);
    btn.addChild(label);
    btn.x = W / 2;
    btn.y = H - 48;

    btn.on('pointerdown', () => {
      // lazy import to avoid circular dependency at module load time
      import('./GameScene.js').then(({ GameScene }) => {
        this.sceneManager.changeScene(new GameScene(this.sceneManager));
      });
    });
    btn.on('pointerover', () => { btn.alpha = 0.82; });
    btn.on('pointerout',  () => { btn.alpha = 1.0; });

    this.container.addChild(btn);
    this._startBtn = btn;
  }

  // ── Floating music notes ───────────────────────────────────────────────────
  _createFloatingNotes(W, H) {
    const symbols = ['♪', '♫', '♬', '♩', '♭'];
    for (let i = 0; i < 9; i++) {
      const t = new PIXI.Text(symbols[i % symbols.length], {
        fontFamily: 'Arial',
        fontSize: Math.random() * 18 + 13,
        fill: 0xFFCCFF,
      });
      t.x  = Math.random() * W;
      t.y  = Math.random() * H;
      t._vy = -(Math.random() * 0.45 + 0.15);
      t._vx = (Math.random() - 0.5) * 0.25;
      t._ap = Math.random() * Math.PI * 2;
      this.container.addChild(t);
      this._floatingNotes.push(t);
    }
  }

  // ── Update loop ────────────────────────────────────────────────────────────
  update(delta) {
    this._time += delta * 0.04;

    // twinkle stars
    this._stars.forEach(s => {
      s.alpha = 0.3 + Math.sin(this._time * s._spd * 28 + s._phase) * 0.7;
    });

    // bob chicken
    if (this._chicken) this._chicken.update(delta);

    // pulse start button
    if (this._startBtn) {
      const p = 1 + Math.sin(this._time * 2.6) * 0.055;
      this._startBtn.scale.set(p);
    }

    // spin sparkles
    if (this._sparkles) this._sparkles.rotation = this._time * 0.28;

    // float music notes
    const H = this.sceneManager.height;
    const W = this.sceneManager.width;
    this._floatingNotes.forEach(n => {
      n.x += n._vx * delta;
      n.y += n._vy * delta;
      n.alpha = 0.45 + Math.sin(this._time * 1.2 + n._ap) * 0.45;
      if (n.y < -30) { n.y = H + 10; n.x = Math.random() * W; }
    });

    // subtle title pulse
    if (this._titleMain) {
      const tp = 1 + Math.sin(this._time * 1.4) * 0.018;
      this._titleMain.scale.set(tp);
    }
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function _starPoints(cx, cy, outer, inner) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  return pts;
}
