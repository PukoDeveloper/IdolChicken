import * as PIXI from 'pixi.js';
import { BaseScene } from './BaseScene.js';
import { ChickenSprite } from '../graphics/ChickenSprite.js';

// ── Layout constants ──────────────────────────────────────────────────────────
const HIGHWAY_X     = 160;   // left edge of note highway
const HIGHWAY_W     = 480;   // total highway width
const LANE_COUNT    = 4;
const LANE_W        = HIGHWAY_W / LANE_COUNT;  // 120 px each
const TARGET_Y      = 510;   // hit-zone centre Y
const SPAWN_Y       = -30;   // notes appear here
const FALL_DURATION = 2.0;   // seconds to fall
const FALL_DIST     = TARGET_Y - SPAWN_Y;      // 540 px
const NOTE_SPEED    = FALL_DIST / FALL_DURATION;  // px / s
const NOTE_SPEED_PF = NOTE_SPEED / 60;            // px / frame @ 60 fps
const PERFECT_RANGE = 52;    // px window around TARGET_Y
const GOOD_RANGE    = 110;
const NOTE_W        = 88;
const NOTE_H        = 22;

const LANE_COLORS = [0x4488FF, 0x44EE88, 0xFFEE44, 0xFF4455];
const KEY_LABELS  = ['D', 'F', 'J', 'K'];
const KEY_CODES   = ['KeyD', 'KeyF', 'KeyJ', 'KeyK'];

// ── Song pattern (hitTime = second when note should be pressed) ────────────────
const RAW_NOTES = [
  // intro – slow quarter notes
  { lane: 0, hitTime: 2.00 }, { lane: 2, hitTime: 2.50 },
  { lane: 1, hitTime: 3.00 }, { lane: 3, hitTime: 3.50 },
  // build – consecutive lanes
  { lane: 0, hitTime: 4.00 }, { lane: 1, hitTime: 4.50 },
  { lane: 2, hitTime: 5.00 }, { lane: 3, hitTime: 5.50 },
  // doubles
  { lane: 0, hitTime: 6.00 }, { lane: 3, hitTime: 6.00 },
  { lane: 1, hitTime: 6.50 }, { lane: 2, hitTime: 6.50 },
  { lane: 0, hitTime: 7.00 }, { lane: 1, hitTime: 7.00 },
  { lane: 2, hitTime: 7.50 }, { lane: 3, hitTime: 7.50 },
  // 8ths
  { lane: 0, hitTime: 8.00 }, { lane: 2, hitTime: 8.25 },
  { lane: 1, hitTime: 8.50 }, { lane: 3, hitTime: 8.75 },
  { lane: 2, hitTime: 9.00 }, { lane: 0, hitTime: 9.25 },
  { lane: 3, hitTime: 9.50 }, { lane: 1, hitTime: 9.75 },
  // middle section
  { lane: 1, hitTime: 10.00 }, { lane: 2, hitTime: 10.50 },
  { lane: 0, hitTime: 11.00 }, { lane: 3, hitTime: 11.50 },
  { lane: 0, hitTime: 12.00 }, { lane: 3, hitTime: 12.00 },
  { lane: 1, hitTime: 12.50 }, { lane: 2, hitTime: 13.00 },
  { lane: 0, hitTime: 13.50 }, { lane: 1, hitTime: 14.00 },
  // climax
  { lane: 2, hitTime: 14.00 }, { lane: 3, hitTime: 14.25 },
  { lane: 0, hitTime: 14.50 }, { lane: 1, hitTime: 14.75 },
  { lane: 2, hitTime: 15.00 }, { lane: 3, hitTime: 15.00 },
  { lane: 0, hitTime: 15.50 }, { lane: 1, hitTime: 15.50 },
  // outro
  { lane: 2, hitTime: 16.00 }, { lane: 3, hitTime: 16.50 },
  { lane: 0, hitTime: 17.00 }, { lane: 1, hitTime: 17.50 },
  { lane: 2, hitTime: 18.00 }, { lane: 3, hitTime: 18.50 },
];

const SONG_NOTES   = RAW_NOTES.map(n => ({ ...n, spawnTime: n.hitTime - FALL_DURATION }));
const TOTAL_NOTES  = SONG_NOTES.length;
const SONG_END_TIME = SONG_NOTES[SONG_NOTES.length - 1].hitTime + 3.0;

// ── Scene ─────────────────────────────────────────────────────────────────────
export class GameScene extends BaseScene {
  constructor(sceneManager) {
    super(sceneManager);
    this._gameTime    = 0;
    this._countdown   = 3;       // 3-second countdown before notes
    this._cdPhase     = 0;       // phase within the current countdown second
    this._noteIndex   = 0;
    this._notes       = [];      // live note objects
    this._score       = 0;
    this._combo       = 0;
    this._maxCombo    = 0;
    this._perfect     = 0;
    this._good        = 0;
    this._miss        = 0;
    this._effects     = [];      // floating hit-judgement labels
    this._laneFlash   = [0, 0, 0, 0];   // per-lane flash countdown (frames)
    this._songEnded   = false;
    this._keyHandler  = null;
    // PIXI objects
    this._noteContainer  = null;
    this._fxContainer    = null;
    this._hitZoneGfx     = null;
    this._scoreText      = null;
    this._comboText      = null;
    this._cdText         = null;
    this._chicken        = null;
    this._progressBar    = null;
    this._progressFill   = null;
  }

  init() {
    const W = this.sceneManager.width;
    const H = this.sceneManager.height;

    this._drawBackground(W, H);
    this._drawHighway(W, H);
    this._createHitZone(W, H);
    this._drawKeyLabels(W, H);
    this._drawSidePanels(W, H);
    this._createHUD(W, H);
    this._noteContainer = new PIXI.Container();
    this.container.addChild(this._noteContainer);
    this._fxContainer = new PIXI.Container();
    this.container.addChild(this._fxContainer);
    this._createCountdownText(W, H);
    this._createChicken(W, H);
    this._setupInput(W, H);
  }

  // ── Drawing helpers ──────────────────────────────────────────────────────────

  _drawBackground(W, H) {
    const g = new PIXI.Graphics();
    // dark hall
    g.beginFill(0x09041A);
    g.drawRect(0, 0, W, H);
    g.endFill();
    // upper audience section
    g.beginFill(0x100525);
    g.drawRect(0, 0, W, H * 0.42);
    g.endFill();
    // audience silhouettes
    for (let row = 0; row < 3; row++) {
      const baseY = H * 0.40 - row * 22;
      const shade = 0x180830 + row * 0x060310;
      g.beginFill(shade);
      for (let i = 0; i < 22; i++) {
        const x = (i / 22) * W + (row % 2 === 0 ? 0 : W / 44);
        g.drawCircle(x, baseY, 10);
        g.drawRect(x - 12, baseY + 9, 24, 14);
      }
      g.endFill();
    }
    // stage floor
    g.beginFill(0x180840);
    g.drawRect(0, H * 0.42, W, H * 0.58);
    g.endFill();
    // stage edge line
    g.lineStyle(2, 0x9933FF, 0.7);
    g.moveTo(0, H * 0.42); g.lineTo(W, H * 0.42);
    this.container.addChild(g);
  }

  _drawHighway(W, H) {
    const g = new PIXI.Graphics();
    // highway background
    g.beginFill(0x0C0618);
    g.drawRect(HIGHWAY_X, 0, HIGHWAY_W, H);
    g.endFill();
    // per-lane colour tint
    for (let i = 0; i < LANE_COUNT; i++) {
      g.beginFill(LANE_COLORS[i], 0.05);
      g.drawRect(HIGHWAY_X + i * LANE_W, 0, LANE_W, H);
      g.endFill();
    }
    // lane dividers
    for (let i = 0; i <= LANE_COUNT; i++) {
      const x = HIGHWAY_X + i * LANE_W;
      const thick = (i === 0 || i === LANE_COUNT) ? 2 : 1;
      const alpha = (i === 0 || i === LANE_COUNT) ? 0.8 : 0.28;
      g.lineStyle(thick, 0x5555AA, alpha);
      g.moveTo(x, 0); g.lineTo(x, H);
    }
    this.container.addChild(g);
  }

  _createHitZone(W, H) {
    const g = new PIXI.Graphics();
    this._hitZoneGfx = g;
    this.container.addChild(g);
    this._redrawHitZone();

    // invisible click targets per lane
    for (let i = 0; i < LANE_COUNT; i++) {
      const hit = new PIXI.Graphics();
      hit.beginFill(0xFFFFFF, 0.001);
      hit.drawRect(HIGHWAY_X + i * LANE_W, TARGET_Y - 60, LANE_W, 120);
      hit.endFill();
      hit.interactive = true;
      hit.cursor = 'pointer';
      hit.on('pointerdown', () => this._triggerLane(i));
      this.container.addChild(hit);
    }
  }

  _redrawHitZone() {
    const g = this._hitZoneGfx;
    g.clear();
    // guide line
    g.lineStyle(2, 0xFFFFFF, 0.45);
    g.moveTo(HIGHWAY_X, TARGET_Y);
    g.lineTo(HIGHWAY_X + HIGHWAY_W, TARGET_Y);
    g.lineStyle(0);
    // per-lane circles
    for (let i = 0; i < LANE_COUNT; i++) {
      const cx    = HIGHWAY_X + i * LANE_W + LANE_W / 2;
      const flash = Math.min(this._laneFlash[i], 1);
      const alpha = 0.28 + flash * 0.72;
      const color = flash > 0.4 ? 0xFFFFFF : LANE_COLORS[i];
      g.beginFill(color, alpha);
      g.drawCircle(cx, TARGET_Y, LANE_W * 0.34);
      g.endFill();
      g.lineStyle(2.5, LANE_COLORS[i], 0.7 + flash * 0.3);
      g.drawCircle(cx, TARGET_Y, LANE_W * 0.34);
      g.lineStyle(0);
    }
  }

  _drawKeyLabels(W, H) {
    for (let i = 0; i < LANE_COUNT; i++) {
      const cx = HIGHWAY_X + i * LANE_W + LANE_W / 2;
      const t  = new PIXI.Text(KEY_LABELS[i], {
        fontFamily: 'Arial Black, Arial',
        fontSize: 20,
        fill: LANE_COLORS[i],
        stroke: 0x000000,
        strokeThickness: 4,
        fontWeight: 'bold',
      });
      t.anchor.set(0.5);
      t.x = cx;
      t.y = TARGET_Y + 54;
      this.container.addChild(t);
    }
  }

  _drawSidePanels(W, H) {
    const g = new PIXI.Graphics();
    // left panel
    g.beginFill(0x07030D, 0.82);
    g.drawRect(0, 0, HIGHWAY_X - 4, H);
    g.endFill();
    // right panel
    g.beginFill(0x07030D, 0.82);
    g.drawRect(HIGHWAY_X + HIGHWAY_W + 4, 0, W - HIGHWAY_X - HIGHWAY_W - 4, H);
    g.endFill();
    this.container.addChild(g);
  }

  // ── HUD ──────────────────────────────────────────────────────────────────────

  _createHUD(W, H) {
    const rightX = HIGHWAY_X + HIGHWAY_W + 18;

    // Score label
    const scoreLbl = new PIXI.Text('SCORE', {
      fontFamily: 'Arial', fontSize: 13, fill: 0x8888AA, fontWeight: 'bold',
    });
    scoreLbl.x = rightX; scoreLbl.y = 24;
    this.container.addChild(scoreLbl);

    this._scoreText = new PIXI.Text('000000', {
      fontFamily: 'Arial Black, Arial', fontSize: 28,
      fill: 0xFFFFFF, stroke: 0x000000, strokeThickness: 3,
    });
    this._scoreText.x = rightX; this._scoreText.y = 40;
    this.container.addChild(this._scoreText);

    // Combo label
    const comboLbl = new PIXI.Text('COMBO', {
      fontFamily: 'Arial', fontSize: 13, fill: 0x8888AA, fontWeight: 'bold',
    });
    comboLbl.x = rightX; comboLbl.y = 88;
    this.container.addChild(comboLbl);

    this._comboText = new PIXI.Text('x0', {
      fontFamily: 'Arial Black, Arial', fontSize: 34,
      fill: 0xFFDD44, stroke: 0x000000, strokeThickness: 3,
    });
    this._comboText.x = rightX; this._comboText.y = 104;
    this.container.addChild(this._comboText);

    // Progress bar background
    const pbBg = new PIXI.Graphics();
    pbBg.beginFill(0x222233);
    pbBg.drawRoundedRect(rightX, 158, 140, 12, 6);
    pbBg.endFill();
    this.container.addChild(pbBg);

    this._progressFill = new PIXI.Graphics();
    this.container.addChild(this._progressFill);
    this._updateProgress(0, 140, rightX, 158);

    // Quit button
    const quit = new PIXI.Container();
    quit.interactive = true;
    quit.cursor = 'pointer';
    const qBg = new PIXI.Graphics();
    qBg.beginFill(0x552233);
    qBg.drawRoundedRect(0, 0, 80, 28, 8);
    qBg.endFill();
    const qLbl = new PIXI.Text('QUIT', {
      fontFamily: 'Arial', fontSize: 14, fill: 0xFFAAAA, fontWeight: 'bold',
    });
    qLbl.anchor.set(0.5);
    qLbl.x = 40; qLbl.y = 14;
    quit.addChild(qBg); quit.addChild(qLbl);
    quit.x = rightX; quit.y = H - 50;
    quit.on('pointerdown', () => this._endGame());
    quit.on('pointerover', () => { quit.alpha = 0.75; });
    quit.on('pointerout',  () => { quit.alpha = 1.0; });
    this.container.addChild(quit);
  }

  _updateProgress(ratio, barW, barX, barY) {
    const g = this._progressFill;
    g.clear();
    const fillW = Math.max(4, barW * ratio);
    g.beginFill(0xFF44AA);
    g.drawRoundedRect(barX, barY, fillW, 12, 6);
    g.endFill();
  }

  _createCountdownText(W, H) {
    this._cdText = new PIXI.Text('', {
      fontFamily: 'Impact, Arial Black',
      fontSize: 120,
      fill: 0xFFFFFF,
      stroke: 0xFF0088,
      strokeThickness: 8,
      dropShadow: true,
      dropShadowBlur: 20,
      dropShadowColor: 0xFF0088,
      dropShadowDistance: 0,
    });
    this._cdText.anchor.set(0.5);
    this._cdText.x = HIGHWAY_X + HIGHWAY_W / 2;
    this._cdText.y = H / 2;
    this.container.addChild(this._cdText);
  }

  _createChicken(W, H) {
    this._chicken = new ChickenSprite(1.0);
    const rightX = HIGHWAY_X + HIGHWAY_W + 18;
    this._chicken.x = rightX + 65;
    this._chicken._baseY = H - 190;
    this._chicken.y = this._chicken._baseY;
    this.container.addChild(this._chicken);
  }

  // ── Input ────────────────────────────────────────────────────────────────────

  _setupInput(W, H) {
    this._keyHandler = (e) => {
      const idx = KEY_CODES.indexOf(e.code);
      if (idx !== -1) this._triggerLane(idx);
    };
    window.addEventListener('keydown', this._keyHandler);
  }

  _triggerLane(lane) {
    if (this._countdown > 0) return;

    this._laneFlash[lane] = 1;

    // find nearest live note in this lane
    let best = null;
    let bestDist = Infinity;
    for (const note of this._notes) {
      if (note.lane !== lane || note.state !== 'falling') continue;
      const dist = Math.abs(note.y - TARGET_Y);
      if (dist < bestDist) { bestDist = dist; best = note; }
    }

    if (best && bestDist <= GOOD_RANGE) {
      const isPerfect = bestDist <= PERFECT_RANGE;
      best.state = 'hit';
      this._combo++;
      if (this._combo > this._maxCombo) this._maxCombo = this._combo;

      if (isPerfect) {
        this._score += 300;
        this._perfect++;
        this._showEffect('PERFECT!', 0xFFFF44, lane);
      } else {
        this._score += 100;
        this._good++;
        this._showEffect('GOOD', 0x88FF88, lane);
      }
      this._chicken.setExcited(true);
    } else {
      // key press with no note nearby
      this._showEffect('MISS', 0xFF4444, lane);
      this._combo = 0;
      this._miss++;
      this._chicken.setExcited(false);
    }
    this._refreshHUD();
  }

  // ── Effects ──────────────────────────────────────────────────────────────────

  _showEffect(label, color, lane) {
    const cx = HIGHWAY_X + lane * LANE_W + LANE_W / 2;
    const t  = new PIXI.Text(label, {
      fontFamily: 'Arial Black, Arial',
      fontSize: 22,
      fill: color,
      stroke: 0x000000,
      strokeThickness: 4,
      dropShadow: true,
      dropShadowBlur: 8,
      dropShadowColor: color,
      dropShadowDistance: 0,
    });
    t.anchor.set(0.5);
    t.x = cx;
    t.y = TARGET_Y - 50;
    t._life = 1.0;
    this._fxContainer.addChild(t);
    this._effects.push(t);
  }

  _updateEffects(delta) {
    for (let i = this._effects.length - 1; i >= 0; i--) {
      const e = this._effects[i];
      e._life -= delta * 0.035;
      e.y    -= delta * 0.8;
      e.alpha = Math.max(0, e._life);
      e.scale.set(1 + (1 - e._life) * 0.4);
      if (e._life <= 0) {
        this._fxContainer.removeChild(e);
        e.destroy();
        this._effects.splice(i, 1);
      }
    }
  }

  // ── HUD refresh ──────────────────────────────────────────────────────────────

  _refreshHUD() {
    this._scoreText.text = String(this._score).padStart(6, '0');
    this._comboText.text = `x${this._combo}`;
    this._comboText.style.fill = this._combo >= 10 ? 0xFF44FF : 0xFFDD44;
  }

  // ── Note management ──────────────────────────────────────────────────────────

  _spawnNote(laneIndex) {
    const g = new PIXI.Graphics();
    const color = LANE_COLORS[laneIndex];
    g.beginFill(color);
    g.drawRoundedRect(-NOTE_W / 2, -NOTE_H / 2, NOTE_W, NOTE_H, NOTE_H / 2);
    g.endFill();
    g.beginFill(0xFFFFFF, 0.35);
    g.drawRoundedRect(-NOTE_W / 2 + 4, -NOTE_H / 2 + 3, NOTE_W - 8, 5, 3);
    g.endFill();

    const cx = HIGHWAY_X + laneIndex * LANE_W + LANE_W / 2;
    g.x = cx;
    g.y = SPAWN_Y;

    this._noteContainer.addChild(g);
    const note = { lane: laneIndex, y: SPAWN_Y, state: 'falling', sprite: g };
    this._notes.push(note);
    return note;
  }

  _updateNotes(delta) {
    const dy = NOTE_SPEED_PF * delta;
    for (let i = this._notes.length - 1; i >= 0; i--) {
      const note = this._notes[i];
      if (note.state === 'falling') {
        note.y += dy;
        note.sprite.y = note.y;
        // auto-miss if note exits below hit window
        if (note.y > TARGET_Y + GOOD_RANGE) {
          note.state = 'miss';
          this._miss++;
          this._combo = 0;
          this._showEffect('MISS', 0xFF4444, note.lane);
          this._chicken.setExcited(false);
          this._refreshHUD();
        }
      }
      // remove notes that are off screen
      if (note.state !== 'falling' && note.y > this.sceneManager.height + 40) {
        this._noteContainer.removeChild(note.sprite);
        note.sprite.destroy();
        this._notes.splice(i, 1);
      } else if (note.state === 'hit') {
        // fade out hit notes
        note.sprite.alpha -= delta * 0.12;
        note.y += dy * 0.4;
        note.sprite.y = note.y;
        note.sprite.scale.set(1 + (1 - note.sprite.alpha) * 0.5);
        if (note.sprite.alpha <= 0) {
          this._noteContainer.removeChild(note.sprite);
          note.sprite.destroy();
          this._notes.splice(i, 1);
        }
      }
    }
  }

  // ── Main update ──────────────────────────────────────────────────────────────

  update(delta) {
    if (this._songEnded) return;

    const dt = delta / 60; // seconds

    // countdown phase
    if (this._countdown > 0) {
      this._cdPhase += dt;
      const remaining = Math.ceil(this._countdown - this._cdPhase + 1);
      this._cdText.text  = remaining > 0 ? String(remaining) : 'GO!';
      this._cdText.alpha = 0.5 + Math.sin(this._cdPhase * Math.PI * 2) * 0.5;
      this._cdText.scale.set(1.2 - this._cdPhase % 1 * 0.4);
      if (this._cdPhase >= this._countdown) {
        this._countdown = 0;
        this._cdText.text = 'GO!';
        // fade out GO
        setTimeout(() => { if (this._cdText) this._cdText.alpha = 0; }, 500);
      }
      return;
    }

    this._gameTime += dt;

    // spawn notes
    while (
      this._noteIndex < SONG_NOTES.length &&
      SONG_NOTES[this._noteIndex].spawnTime <= this._gameTime
    ) {
      this._spawnNote(SONG_NOTES[this._noteIndex].lane);
      this._noteIndex++;
    }

    this._updateNotes(delta);
    this._updateEffects(delta);

    // lane flash decay
    for (let i = 0; i < LANE_COUNT; i++) {
      if (this._laneFlash[i] > 0) this._laneFlash[i] -= delta * 0.08;
    }
    this._redrawHitZone();

    // progress bar
    const ratio = Math.min(this._gameTime / SONG_END_TIME, 1);
    const rightX = HIGHWAY_X + HIGHWAY_W + 18;
    this._updateProgress(ratio, 140, rightX, 158);

    // chicken animation
    if (this._chicken) {
      this._chicken.update(delta);
      // calm down chicken if no recent combo
      if (this._combo === 0) this._chicken.setExcited(false);
    }

    // end of song
    if (this._gameTime >= SONG_END_TIME && this._noteIndex >= SONG_NOTES.length) {
      this._endGame();
    }
  }

  _endGame() {
    if (this._songEnded) return;
    this._songEnded = true;
    this.sceneManager.setGameData({
      score:    this._score,
      maxCombo: this._maxCombo,
      perfect:  this._perfect,
      good:     this._good,
      miss:     this._miss,
      total:    TOTAL_NOTES,
    });
    import('./ResultScene.js').then(({ ResultScene }) => {
      this.sceneManager.changeScene(new ResultScene(this.sceneManager));
    });
  }

  destroy() {
    if (this._keyHandler) window.removeEventListener('keydown', this._keyHandler);
    super.destroy();
  }
}
