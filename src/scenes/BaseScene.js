import * as PIXI from 'pixi.js';

export class BaseScene {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.container = new PIXI.Container();
  }

  /** Called once when scene becomes active. */
  init() {}

  /** Called every ticker frame. delta ≈ 1.0 at 60 fps. */
  update(_delta) {}

  /** Called before scene is removed. Clean up listeners etc. */
  destroy() {
    this.container.destroy({ children: true });
  }
}
