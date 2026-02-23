# Orbital Duel v1

3D browser game (HTML/CSS/JavaScript + Three.js) for 2 players, turn based: Earth vs Mars.

## Included in v1
- Sun + Earth + Mars rendered in 3D.
- Visible orbital trajectories with different radii/speeds.
- Turn-based controls for each player.
- Mining resources from home planet.
- Build orbital weapons and interceptors.
- Transfer projectiles: missile and mini asteroid.
- Camera focus switches to active planet each turn (close-up feeling).

## Structure
- `index.html`
- `src/styles.css`
- `src/main.js`
- `src/logic/entities.js`
- `src/logic/GameState.js`
- `src/rendering/SceneRenderer.js`
- `src/ui/HUD.js`

## Run local
```bash
cd /Users/santiagovelascocobo/Documents/pro2
python3 -m http.server 4173
```
Open `http://localhost:4173`
