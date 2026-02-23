import { Clock } from "three";
import { GameState } from "./logic/GameState.js";
import { SceneRenderer } from "./rendering/SceneRenderer.js";
import { HUD } from "./ui/HUD.js";
import { DefensePrompt } from "./ui/DefensePrompt.js";

const state = new GameState();
const renderer = new SceneRenderer(document.querySelector("#viewport"));
const hud = new HUD(state, handleAction);
const defensePrompt = new DefensePrompt();
const clock = new Clock();

let processingDefense = false;

state.players.forEach((p) => renderer.addPlanet(p.planet));
renderer.syncPlanets(state);
renderer.setTurnFocus(state);
hud.render();

async function resolveDefenseQueue(shots) {
  processingDefense = true;

  for (const shot of shots) {
    if (state.winner) break;

    const defender = state.players.find((p) => p.planet.id === shot.toId).planet;
    const challenge = state.createMathChallenge();
    const result = await defensePrompt.ask({
      planetName: defender.name,
      question: challenge.text,
      seconds: 6,
    });

    const ok = result.value === challenge.answer;
    state.resolveDefense(shot, ok, result.outOfTime);
    state.clearCompletedProjectiles();
    hud.render();
  }

  processingDefense = false;
}

function handleAction(action) {
  if (state.winner || processingDefense) return;

  if (action === "mine") state.mine();
  if (action === "buildWeapon") state.buildWeapon();
  if (action === "buildInterceptor") state.buildInterceptor();
  if (action === "fireMissile") state.launch("missile");
  if (action === "fireAsteroid") state.launch("asteroid");
  if (action === "endTurn") {
    const shots = state.endTurnAndCollectDefenses();
    renderer.setTurnFocus(state);
    if (shots.length > 0) {
      resolveDefenseQueue(shots);
    }
  }

  hud.render();
}

function animate() {
  const dt = clock.getDelta();

  if (!state.winner) {
    state.updateOrbits(dt);
    state.projectiles.forEach((p) => p.update(dt));
  }

  renderer.syncPlanets(state);
  renderer.syncProjectiles(state);
  renderer.render();
  hud.render();

  requestAnimationFrame(animate);
}

animate();
