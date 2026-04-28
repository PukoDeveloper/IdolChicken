import { IdolManager } from './systems/IdolManager.js';

export class SceneManager {
  constructor(app) {
    this.app = app;
    this.currentScene = null;
    this.gameData = {};

    this.idolManager = new IdolManager(this);

    this.app.ticker.add((delta) => {
      if (this.currentScene) {
        this.currentScene.update(delta);
      }
    });
  }

  changeScene(newScene) {
    if (this.currentScene) {
      this.app.stage.removeChild(this.currentScene.container);
      this.currentScene.destroy();
    }
    this.currentScene = newScene;
    newScene.init();
    this.app.stage.addChild(newScene.container);
  }

  setGameData(data) {
    Object.assign(this.gameData, data);
  }

  hasSave() {
    return localStorage.getItem('idolChicken_save') !== null;
  }

  save(data) {
    const existing = this.loadSave() || {};
    localStorage.setItem('idolChicken_save', JSON.stringify({ ...existing, ...data }));
  }

  loadSave() {
    try {
      const s = localStorage.getItem('idolChicken_save');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  }

  get width() { return this.app.screen.width; }
  get height() { return this.app.screen.height; }
}
