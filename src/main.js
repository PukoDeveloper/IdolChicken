import * as PIXI from 'pixi.js';
import { SceneManager } from './SceneManager.js';

const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 0x1a0a2e,
  antialias: true,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
});

document.body.appendChild(app.view);

window.addEventListener('resize', () => {
  app.renderer.resize(window.innerWidth, window.innerHeight);
});

const manager = new SceneManager(app);

if (manager.hasSave()) {
  import('./scenes/LoungeScene.js')
    .then(({ LoungeScene }) => manager.changeScene(new LoungeScene(manager)))
    .catch((err) => console.error('Failed to load LoungeScene:', err));
} else {
  import('./scenes/WelcomeScene.js')
    .then(({ WelcomeScene }) => manager.changeScene(new WelcomeScene(manager)))
    .catch((err) => console.error('Failed to load WelcomeScene:', err));
}
