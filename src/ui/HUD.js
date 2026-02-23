export class HUD {
  constructor(gameState, onAction) {
    this.gameState = gameState;
    this.turnEl = document.querySelector("#turn-info");
    this.statsEl = document.querySelector("#planet-stats");
    this.logEl = document.querySelector("#log");

    document.querySelectorAll("button[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => onAction(btn.dataset.action));
    });
  }

  render() {
    const me = this.gameState.currentPlayer;
    const enemy = this.gameState.enemyPlayer;

    this.turnEl.textContent = this.gameState.winner
      ? `${this.gameState.gameOverMessage} (turno ${this.gameState.turn})`
      : `Turno ${this.gameState.turn} - ${me.label}`;

    this.statsEl.innerHTML = `
      <p><strong>${me.planet.name}</strong></p>
      <p>Recursos: ${me.planet.resources}</p>
      <p>Armas: ${me.planet.weapons}</p>
      <p>Interceptores: ${me.planet.interceptors}</p>
      <p>Vida: ${me.planet.hp}</p>
      <hr>
      <p><strong>${enemy.planet.name}</strong> Vida: ${enemy.planet.hp}</p>
    `;

    this.logEl.innerHTML = this.gameState.log.slice(0, 14).map((l) => `<p>${l}</p>`).join("");
  }
}
