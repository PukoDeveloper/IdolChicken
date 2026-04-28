import { CHICKENS } from '../data/chickens.js';
import { DialogueBox } from '../graphics/DialogueBox.js';

/**
 * Extensible dialogue system.
 *
 * Plays through an array of dialogue entries where each entry can independently
 * specify a speaker character, a background key, and a text line.
 *
 * Dialogue entry shape:
 *   { speaker: string, background?: string, text: string }
 *
 *   speaker    – key in CHICKENS or a plain display string used as-is.
 *   background – optional key passed to `onBackgroundChange` when it changes.
 *   text       – the spoken line.
 *
 * Usage:
 *   const ds = new DialogueSystem(container, entries, W, H, {
 *     onBackgroundChange: (bgKey) => { ... },
 *     onComplete:         ()      => { ... },
 *     lastLabel:          '▶ 繼續',   // optional label on the final step
 *   });
 *   ds.start();
 *   // in scene update loop:
 *   ds.update(delta);
 */
export class DialogueSystem {
  constructor(container, dialogues, W, H, options = {}) {
    this._container           = container;
    this._dialogues           = dialogues;
    this._W                   = W;
    this._H                   = H;
    this._onBackgroundChange  = options.onBackgroundChange || (() => {});
    this._onComplete          = options.onComplete         || (() => {});
    this._lastLabel           = options.lastLabel          || '▶ 前往下一幕';
    this._step                = 0;
    this._currentBg           = null;
    this._box                 = null;
  }

  /** Mount the dialogue box and show the first entry. */
  start() {
    this._box = new DialogueBox(this._W, this._H);
    this._box.on('advance', () => this._advance());
    this._container.addChild(this._box);
    this._show();
  }

  /** Animate the dialogue box. Call each frame with ticker delta. */
  update(delta) {
    if (this._box) this._box.update(delta);
  }

  /** Remove and destroy the dialogue box. */
  destroy() {
    if (this._box) {
      this._container.removeChild(this._box);
      this._box.destroy({ children: true });
      this._box = null;
    }
  }

  // ── Private ───────────────────────────────────────────────────────────────

  _show() {
    if (this._step >= this._dialogues.length) {
      this._onComplete();
      return;
    }

    const entry = this._dialogues[this._step];

    // Resolve speaker display name from the chicken repository or fall back to
    // the raw string if the key is not found (supports plain name overrides).
    const chicken     = CHICKENS[entry.speaker];
    const speakerName = chicken ? chicken.name : (entry.speaker || '');

    // Notify background change only when the key actually differs.
    if (entry.background && entry.background !== this._currentBg) {
      this._currentBg = entry.background;
      this._onBackgroundChange(entry.background);
    }

    this._box.show({
      speakerName,
      text:      entry.text,
      step:      this._step + 1,
      total:     this._dialogues.length,
      nextLabel: this._lastLabel,
    });
  }

  _advance() {
    this._step++;
    this._show();
  }
}
