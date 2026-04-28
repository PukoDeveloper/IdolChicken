import * as PIXI from 'pixi.js';
import { SceneManager } from './SceneManager.js';
import { TitleScene } from './scenes/TitleScene.js';

const app = new PIXI.Application({
  width: 800,
  height: 600,
  backgroundColor: 0x0a0a1e,
  antialias: true,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
});

document.body.appendChild(app.view);

function resize() {
  const scale = Math.min(window.innerWidth / 800, window.innerHeight / 600);
  app.view.style.width = `${800 * scale}px`;
  app.view.style.height = `${600 * scale}px`;
}
window.addEventListener('resize', resize);
resize();

const manager = new SceneManager(app);
manager.changeScene(new TitleScene(manager));
