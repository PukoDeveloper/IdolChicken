import * as PIXI from 'pixi.js';

/**
 * Reusable PIXI dialogue box component.
 *
 * Emits an 'advance' event when the user taps / clicks anywhere on screen.
 * Call update(delta) each frame to animate the blinking next-indicator.
 */
export class DialogueBox extends PIXI.Container {
  constructor(W, H) {
    super();
    this._W    = W;
    this._H    = H;
    this._time = 0;
    this._build();
  }

  _build() {
    const W = this._W;
    const H = this._H;

    const boxH = Math.max(140, Math.min(H * 0.30, 220));
    const boxY = H - boxH - 14;
    const pad  = 16;

    const speakerFontSize   = Math.min(Math.max(13, W * 0.034), 18);
    const dialogueFontSize  = Math.min(Math.max(15, W * 0.04),  22);
    const hintFontSize      = Math.min(Math.max(11, W * 0.028), 15);

    this._boxH = boxH;
    this._boxY = boxY;
    this._pad  = pad;

    // Invisible full-screen tap area for easy advance
    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.001);
    overlay.drawRect(0, 0, W, H);
    overlay.endFill();
    overlay.interactive = true;
    overlay.cursor = 'pointer';
    overlay.on('pointerdown', () => this.emit('advance'));
    this.addChild(overlay);

    // Translucent box background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x0D0520, 0.90);
    bg.drawRoundedRect(10, boxY, W - 20, boxH, 14);
    bg.endFill();
    bg.lineStyle(2, 0xFF88CC, 0.85);
    bg.drawRoundedRect(10, boxY, W - 20, boxH, 14);
    this.addChild(bg);

    // Speaker name
    this._speakerText = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize:   speakerFontSize,
      fill:       0xFF88CC,
      fontWeight: 'bold',
    });
    this._speakerText.x = 10 + pad;
    this._speakerText.y = boxY + pad;
    this.addChild(this._speakerText);

    // Dialogue body
    this._dialogueText = new PIXI.Text('', {
      fontFamily:    'Arial',
      fontSize:      dialogueFontSize,
      fill:          0xFFFFFF,
      wordWrap:      true,
      wordWrapWidth: W - 20 - pad * 2,
    });
    this._dialogueText.x = 10 + pad;
    this._dialogueText.y = boxY + pad + speakerFontSize + 8;
    this.addChild(this._dialogueText);

    // Next / last-step indicator (bottom-right)
    this._nextIndicator = new PIXI.Text('▼ 點擊繼續', {
      fontFamily: 'Arial',
      fontSize:   hintFontSize,
      fill:       0xFF88CC,
    });
    this._nextIndicator.anchor.set(1, 1);
    this._nextIndicator.x = W - 10 - pad;
    this._nextIndicator.y = boxY + boxH - pad;
    this.addChild(this._nextIndicator);

    // Page counter (bottom-left)
    this._pageText = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize:   hintFontSize,
      fill:       0xFF88CC,
    });
    this._pageText.anchor.set(0, 1);
    this._pageText.x = 10 + pad;
    this._pageText.y = boxY + boxH - pad;
    this.addChild(this._pageText);
  }

  /**
   * Populate the box with a dialogue entry.
   * @param {object} opts
   * @param {string}  opts.speakerName  Display name of the speaker.
   * @param {string}  opts.text         Dialogue body text.
   * @param {number}  opts.step         1-based current step index.
   * @param {number}  opts.total        Total number of steps.
   * @param {string}  opts.nextLabel    Label for the next-indicator on the last step.
   */
  show({ speakerName, text, step, total, nextLabel }) {
    this._speakerText.text    = speakerName;
    this._dialogueText.text   = text;
    this._pageText.text       = `${step} / ${total}`;
    const isLast              = step === total;
    this._nextIndicator.text  = isLast ? (nextLabel || '▶ 前往下一幕') : '▼ 點擊繼續';
  }

  /** Animate the blinking next-indicator. Call each frame with ticker delta. */
  update(delta) {
    this._time += delta * 0.04;
    this._nextIndicator.alpha = 0.5 + Math.abs(Math.sin(this._time * 2.5)) * 0.5;
  }
}
