import * as PIXI from 'pixi.js';
import { BaseScene } from './BaseScene.js';
import { ChickenSprite } from '../graphics/ChickenSprite.js';

const DIALOGUES = [
  { speaker: '雞翅事務所・所長', text: '嗨！你終於來了！\n歡迎來到雞翅事務所！' },
  { speaker: '雞翅事務所・所長', text: '我是這裡的所長，大家都叫我「雞長」。\n很高興認識你！' },
  { speaker: '雞翅事務所・所長', text: '從今天起，你就是我們事務所的新經紀人！\n請多關照！' },
  { speaker: '雞翅事務所・所長', text: '我們旗下目前有六位才華洋溢的偶像雞，\n她們現在都在休息室裡。' },
  { speaker: '雞翅事務所・所長', text: '先去跟大家打個招呼吧！' },
];

export class WelcomeScene extends BaseScene {
  constructor(sceneManager) {
    super(sceneManager);
    this._step = 0;
    this._time = 0;
    this._chicken = null;
    this._speakerText = null;
    this._dialogueText = null;
    this._nextIndicator = null;
    this._pageText = null;
  }

  init() {
    const W = this.sceneManager.width;
    const H = this.sceneManager.height;

    this._drawBackground(W, H);
    this._createChickenPortrait(W, H);
    this._createDialogueBox(W, H);
    this._updateDialogue();
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
    const scale = Math.min(W * 0.0048, 2.8, H * 0.003);
    this._chicken = new ChickenSprite(scale);
    this._chicken.x = W * 0.5;
    this._chicken._baseY = H * 0.4;
    this._chicken.y = this._chicken._baseY;
    this.container.addChild(this._chicken);
  }

  // ── Dialogue box ────────────────────────────────────────────────────────────
  _createDialogueBox(W, H) {
    const boxH = Math.max(140, Math.min(H * 0.30, 220));
    const boxY = H - boxH - 14;
    const pad = 16;
    const speakerFontSize = Math.min(Math.max(13, W * 0.034), 18);
    const dialogueFontSize = Math.min(Math.max(15, W * 0.04), 22);
    const hintFontSize = Math.min(Math.max(11, W * 0.028), 15);

    const box = new PIXI.Container();
    box.interactive = true;
    box.cursor = 'pointer';

    // Overlay taps on the full screen width/height for easy tap-to-advance
    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.001);
    overlay.drawRect(0, 0, W, H);
    overlay.endFill();
    overlay.interactive = true;
    overlay.cursor = 'pointer';
    overlay.on('pointerdown', () => this._nextStep());
    this.container.addChild(overlay);

    const bg = new PIXI.Graphics();
    bg.beginFill(0x0D0520, 0.90);
    bg.drawRoundedRect(10, boxY, W - 20, boxH, 14);
    bg.endFill();
    bg.lineStyle(2, 0xFF88CC, 0.85);
    bg.drawRoundedRect(10, boxY, W - 20, boxH, 14);
    box.addChild(bg);

    this._speakerText = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: speakerFontSize,
      fill: 0xFF88CC,
      fontWeight: 'bold',
    });
    this._speakerText.x = 10 + pad;
    this._speakerText.y = boxY + pad;
    box.addChild(this._speakerText);

    this._dialogueText = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: dialogueFontSize,
      fill: 0xFFFFFF,
      wordWrap: true,
      wordWrapWidth: W - 20 - pad * 2,
    });
    this._dialogueText.x = 10 + pad;
    this._dialogueText.y = boxY + pad + speakerFontSize + 8;
    box.addChild(this._dialogueText);

    this._nextIndicator = new PIXI.Text('▼ 點擊繼續', {
      fontFamily: 'Arial',
      fontSize: hintFontSize,
      fill: 0xFF88CC,
    });
    this._nextIndicator.anchor.set(1, 1);
    this._nextIndicator.x = W - 10 - pad;
    this._nextIndicator.y = boxY + boxH - pad;
    box.addChild(this._nextIndicator);

    this._pageText = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: hintFontSize,
      fill: 0xFF88CC,
    });
    this._pageText.anchor.set(0, 1);
    this._pageText.x = 10 + pad;
    this._pageText.y = boxY + boxH - pad;
    box.addChild(this._pageText);

    this.container.addChild(box);
  }

  _updateDialogue() {
    if (this._step >= DIALOGUES.length) {
      this.sceneManager.save({ initialized: true });
      import('./LoungeScene.js').then(({ LoungeScene }) => {
        this.sceneManager.changeScene(new LoungeScene(this.sceneManager));
      });
      return;
    }
    const d = DIALOGUES[this._step];
    this._speakerText.text = d.speaker;
    this._dialogueText.text = d.text;
    this._pageText.text = `${this._step + 1} / ${DIALOGUES.length}`;
    const isLast = this._step === DIALOGUES.length - 1;
    this._nextIndicator.text = isLast ? '▶ 前往休息室' : '▼ 點擊繼續';
  }

  _nextStep() {
    this._step++;
    this._updateDialogue();
  }

  // ── Update loop ─────────────────────────────────────────────────────────────
  update(delta) {
    this._time += delta * 0.04;
    if (this._chicken) this._chicken.update(delta);
    if (this._nextIndicator) {
      this._nextIndicator.alpha = 0.5 + Math.abs(Math.sin(this._time * 2.5)) * 0.5;
    }
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
