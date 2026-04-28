import * as PIXI from 'pixi.js';

/**
 * Programmatically-drawn chicken idol character.
 * Origin is roughly at the body centre.
 * Call update(delta) each frame to animate.
 */
export class ChickenSprite extends PIXI.Container {
  constructor(scale = 1) {
    super();
    this._s = scale;
    this._time = Math.random() * Math.PI * 2;
    this._bobSpeed = 1.5;
    this._bobAmount = 4;
    this._excited = false;
    this._baseY = 0;
    this._build();
  }

  _build() {
    const g = new PIXI.Graphics();
    const s = this._s;

    // ── Wings (drawn behind body) ──────────────────────────────
    g.beginFill(0xEECC33);
    g.drawEllipse(-43 * s, 8 * s, 16 * s, 24 * s);
    g.drawEllipse(43 * s, 8 * s, 16 * s, 24 * s);
    g.endFill();

    // ── Body ──────────────────────────────────────────────────
    g.beginFill(0xFFDD44);
    g.drawEllipse(0, 18 * s, 36 * s, 30 * s);
    g.endFill();

    // neck connector
    g.beginFill(0xFFDD44);
    g.drawRect(-9 * s, -14 * s, 18 * s, 18 * s);
    g.endFill();

    // ── Head ──────────────────────────────────────────────────
    g.beginFill(0xFFDD44);
    g.drawCircle(0, -26 * s, 22 * s);
    g.endFill();

    // ── Comb (3 red bumps) ─────────────────────────────────────
    g.beginFill(0xEE2222);
    g.drawCircle(-9 * s, -46 * s, 7 * s);
    g.drawCircle(0, -51 * s, 8 * s);
    g.drawCircle(9 * s, -46 * s, 7 * s);
    g.endFill();

    // ── Beak ──────────────────────────────────────────────────
    g.beginFill(0xFF8833);
    g.drawPolygon([
      -7 * s, -16 * s,
       7 * s, -16 * s,
       0,     -3 * s,
    ]);
    g.endFill();

    // ── Eye whites ────────────────────────────────────────────
    g.beginFill(0xFFFFEE);
    g.drawCircle(-9 * s, -31 * s, 6 * s);
    g.drawCircle(9 * s, -31 * s, 6 * s);
    g.endFill();

    // ── Pupils ────────────────────────────────────────────────
    g.beginFill(0x111122);
    g.drawCircle(-9 * s, -31 * s, 3.5 * s);
    g.drawCircle(9 * s, -31 * s, 3.5 * s);
    g.endFill();

    // ── Eye highlights ────────────────────────────────────────
    g.beginFill(0xFFFFFF);
    g.drawCircle(-7.5 * s, -33 * s, 1.5 * s);
    g.drawCircle(10.5 * s, -33 * s, 1.5 * s);
    g.endFill();

    // ── Blush ─────────────────────────────────────────────────
    g.beginFill(0xFF9999, 0.5);
    g.drawEllipse(-15 * s, -24 * s, 6 * s, 4 * s);
    g.drawEllipse(15 * s, -24 * s, 6 * s, 4 * s);
    g.endFill();

    // ── Idol bow (chest) ──────────────────────────────────────
    g.beginFill(0xFF66AA);
    g.drawPolygon([-16 * s, -1 * s, -6 * s, 8 * s, -6 * s, -1 * s]);
    g.drawPolygon([ 6 * s, -1 * s,  6 * s, 8 * s, 16 * s, -1 * s]);
    g.endFill();
    g.beginFill(0xFF44AA);
    g.drawCircle(0, 4 * s, 4.5 * s);
    g.endFill();

    // ── Microphone (right side) ───────────────────────────────
    g.beginFill(0x999999);
    g.drawRoundedRect(38 * s, -12 * s, 10 * s, 20 * s, 4 * s);
    g.endFill();
    g.beginFill(0xBBBBBB);
    g.drawCircle(43 * s, -16 * s, 8 * s);
    g.endFill();
    g.beginFill(0x666666);
    g.drawCircle(43 * s, -16 * s, 5 * s);
    g.endFill();

    // ── Feet ──────────────────────────────────────────────────
    g.lineStyle(3 * s, 0xFF8833);
    // left leg
    g.moveTo(-12 * s, 47 * s); g.lineTo(-12 * s, 60 * s);
    g.moveTo(-12 * s, 60 * s); g.lineTo(-22 * s, 67 * s);
    g.moveTo(-12 * s, 60 * s); g.lineTo(-12 * s, 70 * s);
    g.moveTo(-12 * s, 60 * s); g.lineTo(-2 * s,  67 * s);
    // right leg
    g.moveTo(12 * s, 47 * s); g.lineTo(12 * s, 60 * s);
    g.moveTo(12 * s, 60 * s); g.lineTo(2 * s,  67 * s);
    g.moveTo(12 * s, 60 * s); g.lineTo(12 * s, 70 * s);
    g.moveTo(12 * s, 60 * s); g.lineTo(22 * s, 67 * s);

    this.addChild(g);
  }

  /** Switch between idle and excited dance mode. */
  setExcited(excited) {
    this._excited = excited;
    this._bobSpeed  = excited ? 3.5 : 1.5;
    this._bobAmount = excited ? 8   : 4;
  }

  /** Call each frame with ticker delta. */
  update(delta) {
    this._time += delta * 0.04;
    this.y = this._baseY + Math.sin(this._time * this._bobSpeed) * this._bobAmount;
    this.rotation = this._excited ? Math.sin(this._time * 4) * 0.09 : 0;
  }
}
