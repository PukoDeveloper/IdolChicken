import { CHICKENS } from '../data/chickens.js';

/**
 * Default starting stats for a newly acquired idol.
 * Keys map to the five stat dimensions.
 */
export const DEFAULT_STATS = {
  dance:       10, // 舞蹈
  singing:     10, // 唱歌
  eloquence:   10, // 口才
  performance: 10, // 表演
  stamina:     50, // 體力
};

/** The single idol the player owns when the game starts for the first time. */
const DEFAULT_IDOL_ID = 'xiaohuang';

/**
 * IdolManager
 *
 * Tracks which idols the player currently owns and stores per-idol stats.
 * Data is persisted via the SceneManager's save/load helpers under the
 * `idols` key in the save file.
 *
 * Shape of the persisted data:
 * {
 *   idols: {
 *     "<idolId>": { dance, singing, eloquence, performance, stamina }
 *     ...
 *   }
 * }
 *
 * Owned order is preserved by insertion order of the idols object.
 */
export class IdolManager {
  constructor(sceneManager) {
    this._sceneManager = sceneManager;
    /** @type {Record<string, { dance:number, singing:number, eloquence:number, performance:number, stamina:number }>} */
    this._idols = {};
    this._load();
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Returns an array of owned idols in roster order, each paired with their
   * current stats. Unknown ids (chicken no longer in CHICKENS registry) are
   * silently skipped.
   *
   * @returns {{ chicken: object, stats: object }[]}
   */
  get ownedIdols() {
    return Object.keys(this._idols)
      .filter(id => CHICKENS[id])
      .map(id => ({ chicken: CHICKENS[id], stats: { ...this._idols[id] } }));
  }

  /**
   * Returns the stat block for a single owned idol, or null if not owned.
   * @param {string} id
   * @returns {{ dance:number, singing:number, eloquence:number, performance:number, stamina:number }|null}
   */
  getStats(id) {
    if (!this._idols[id]) return null;
    return { ...this._idols[id] };
  }

  /**
   * Merges partial stat updates for an owned idol and persists.
   * @param {string} id
   * @param {Partial<typeof DEFAULT_STATS>} updates
   */
  setStats(id, updates) {
    if (!this._idols[id]) return;
    Object.assign(this._idols[id], updates);
    this._persist();
  }

  /**
   * Add an idol to the owned roster (no-op if already owned).
   * New idols start with DEFAULT_STATS.
   * @param {string} id  Key in CHICKENS.
   */
  addIdol(id) {
    if (!CHICKENS[id] || this._idols[id]) return;
    this._idols[id] = { ...DEFAULT_STATS };
    this._persist();
  }

  /**
   * Remove an idol from the owned roster.
   * @param {string} id
   */
  removeIdol(id) {
    if (!this._idols[id]) return;
    delete this._idols[id];
    this._persist();
  }

  // ── Private ────────────────────────────────────────────────────────────────

  _load() {
    const save = this._sceneManager.loadSave();
    if (save && save.idols && typeof save.idols === 'object') {
      // Restore only valid stat blocks for recognized chicken ids.
      for (const [id, stats] of Object.entries(save.idols)) {
        if (CHICKENS[id] && stats && typeof stats === 'object') {
          this._idols[id] = {
            dance:       Number(stats.dance)       || DEFAULT_STATS.dance,
            singing:     Number(stats.singing)     || DEFAULT_STATS.singing,
            eloquence:   Number(stats.eloquence)   || DEFAULT_STATS.eloquence,
            performance: Number(stats.performance) || DEFAULT_STATS.performance,
            stamina:     Number(stats.stamina)     || DEFAULT_STATS.stamina,
          };
        }
      }
    }

    // First-time setup: seed with one default idol.
    if (Object.keys(this._idols).length === 0) {
      this._idols[DEFAULT_IDOL_ID] = { ...DEFAULT_STATS };
      this._persist();
    }
  }

  _persist() {
    this._sceneManager.save({ idols: this._idols });
  }
}
