import { Vector3 } from "three";
import { Planet, OrbitalProjectile } from "./entities.js";

export class GameState {
  constructor() {
    this.turn = 1;
    this.currentPlayerIndex = 0;
    this.winner = null;

    this.players = [
      {
        id: "p1",
        label: "Jugador 1 (Tierra)",
        planet: new Planet({
          id: "earth",
          name: "Tierra",
          color: 0x2b84ff,
          orbitRadius: 10,
          orbitSpeed: 0.09,
          size: 1.3,
          angle: 0,
        }),
      },
      {
        id: "p2",
        label: "Jugador 2 (Marte)",
        planet: new Planet({
          id: "mars",
          name: "Marte",
          color: 0xd45d32,
          orbitRadius: 15.5,
          orbitSpeed: 0.065,
          size: 1.05,
          angle: Math.PI,
        }),
      },
    ];

    this.projectiles = [];
    this.log = ["Simulacion inicializada: Tierra vs Marte."];
    this.gameOverMessage = "";
  }

  get currentPlayer() { return this.players[this.currentPlayerIndex]; }
  get enemyPlayer() { return this.players[(this.currentPlayerIndex + 1) % 2]; }

  updateOrbits(dt) {
    for (const p of this.players) p.planet.angle += p.planet.orbitSpeed * dt;
  }

  getPlanetPosition(planetId) {
    const p = this.players.find((pl) => pl.planet.id === planetId).planet;
    return new Vector3(Math.cos(p.angle) * p.orbitRadius, 0, Math.sin(p.angle) * p.orbitRadius);
  }

  mine() {
    const gain = this.currentPlayer.planet.mine();
    this.log.unshift(`${this.currentPlayer.label} mino +${gain} recursos.`);
  }

  buildWeapon() {
    const ok = this.currentPlayer.planet.buildWeapon();
    this.log.unshift(ok ? `${this.currentPlayer.label} construyo un arma orbital.` : "No hay recursos suficientes para arma orbital.");
  }

  buildInterceptor() {
    const ok = this.currentPlayer.planet.buildInterceptor();
    this.log.unshift(ok ? `${this.currentPlayer.label} desplego un interceptor.` : "No hay recursos suficientes para interceptor.");
  }

  launch(kind) {
    const attacker = this.currentPlayer.planet;
    const target = this.enemyPlayer.planet;
    if (attacker.weapons <= 0) {
      this.log.unshift("No hay armas listas para lanzar.");
      return;
    }

    attacker.weapons -= 1;
    this.projectiles.push(
      new OrbitalProjectile({
        kind,
        fromId: attacker.id,
        toId: target.id,
        start: this.getPlanetPosition(attacker.id),
        end: this.getPlanetPosition(target.id),
      })
    );
    this.log.unshift(`${this.currentPlayer.label} lanzo ${kind === "asteroid" ? "mini asteroide" : "misil"}.`);
  }

  endTurnAndCollectDefenses() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 2;
    if (this.currentPlayerIndex === 0) this.turn += 1;

    this.projectiles.forEach((p) => {
      p.turnsToImpact -= 1;
      p.progress = Math.max(p.progress, Math.min(0.98, 1 - Math.max(0, p.turnsToImpact) * 0.45));
    });

    const defenderId = this.currentPlayer.planet.id;
    return this.projectiles.filter((p) => p.toId === defenderId && p.turnsToImpact <= 0 && !p.completed);
  }

  createMathChallenge() {
    const a = Math.floor(Math.random() * 41) + 10;
    const b = Math.floor(Math.random() * 31) + 5;
    const useAdd = Math.random() < 0.5;
    const op = useAdd ? "+" : "-";
    const answer = useAdd ? a + b : a - b;
    return { text: `${a} ${op} ${b}`, answer };
  }

  resolveDefense(shot, wasCorrect, outOfTime) {
    if (this.winner || shot.completed) return;

    const target = this.players.find((pl) => pl.planet.id === shot.toId).planet;
    shot.completed = true;

    if (wasCorrect && !outOfTime) {
      this.log.unshift(`${target.name} resolvio la operacion a tiempo y bloqueo el ataque.`);
      return;
    }

    target.hp = Math.max(0, target.hp - shot.damage);
    this.log.unshift(`${target.name} fallo la defensa y recibio ${shot.damage} de dano.`);

    if (target.hp <= 0) {
      this.winner = this.players.find((pl) => pl.planet.id !== target.id).label;
      this.gameOverMessage = `FIN DEL JUEGO: ${target.name} fue destruido. Gana ${this.winner}.`;
      this.log.unshift(this.gameOverMessage);
    }
  }

  clearCompletedProjectiles() {
    this.projectiles = this.projectiles.filter((p) => !p.completed);
  }
}
