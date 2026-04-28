export class SceneManager {
  constructor(app) {
    this.app = app;
    this.currentScene = null;
    this.gameData = { score: 0, maxCombo: 0, perfect: 0, good: 0, miss: 0 };

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

  get width() { return this.app.screen.width; }
  get height() { return this.app.screen.height; }
}
