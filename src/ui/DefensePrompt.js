export class DefensePrompt {
  constructor() {
    this.modal = document.querySelector("#defensa-modal");
    this.planetEl = document.querySelector("#defensa-planeta");
    this.questionEl = document.querySelector("#defensa-pregunta");
    this.timeEl = document.querySelector("#defensa-tiempo");
    this.input = document.querySelector("#defensa-respuesta");
    this.button = document.querySelector("#defensa-enviar");
  }

  ask({ planetName, question, seconds = 6 }) {
    return new Promise((resolve) => {
      let remaining = seconds;
      let done = false;
      let timer = null;

      const finish = (value, outOfTime) => {
        if (done) return;
        done = true;
        clearInterval(timer);
        this.button.removeEventListener("click", onSubmit);
        this.input.removeEventListener("keydown", onEnter);
        this.hide();
        resolve({ value, outOfTime });
      };

      const tick = () => {
        this.timeEl.textContent = `Tiempo restante: ${remaining}s`;
        if (remaining <= 0) {
          finish(null, true);
          return;
        }
        remaining -= 1;
      };

      const onSubmit = () => {
        const value = Number.parseInt(this.input.value, 10);
        if (Number.isNaN(value)) return;
        finish(value, false);
      };

      const onEnter = (event) => {
        if (event.key === "Enter") onSubmit();
      };

      this.planetEl.textContent = `Planeta en defensa: ${planetName}`;
      this.questionEl.textContent = question;
      this.input.value = "";
      this.show();
      this.input.focus();

      this.button.addEventListener("click", onSubmit);
      this.input.addEventListener("keydown", onEnter);

      tick();
      timer = setInterval(tick, 1000);
    });
  }

  show() {
    this.modal.classList.remove("oculto");
  }

  hide() {
    this.modal.classList.add("oculto");
  }
}
