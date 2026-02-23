export class Planet {
  constructor({ id, name, color, orbitRadius, orbitSpeed, size, angle }) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.orbitRadius = orbitRadius;
    this.orbitSpeed = orbitSpeed;
    this.size = size;
    this.angle = angle;

    this.resources = 100;
    this.weapons = 1;
    this.interceptors = 1;
    this.hp = 100;
  }

  mine() {
    const gain = 20;
    this.resources += gain;
    return gain;
  }

  buildWeapon() {
    const cost = 35;
    if (this.resources < cost) return false;
    this.resources -= cost;
    this.weapons += 1;
    return true;
  }

  buildInterceptor() {
    const cost = 25;
    if (this.resources < cost) return false;
    this.resources -= cost;
    this.interceptors += 1;
    return true;
  }
}

export class OrbitalProjectile {
  constructor({ kind, fromId, toId, start, end }) {
    this.kind = kind;
    this.fromId = fromId;
    this.toId = toId;
    this.start = start.clone();
    this.end = end.clone();
    this.progress = 0;
    this.completed = false;

    this.speed = kind === "asteroid" ? 0.13 : 0.2;
    this.damage = kind === "asteroid" ? 30 : 18;
    this.color = kind === "asteroid" ? 0x6d4c41 : 0x1f2937;
    this.arc = kind === "asteroid" ? 3.0 : 1.8;
    this.turnsToImpact = kind === "asteroid" ? 2 : 1;
  }

  update(dt) {
    if (this.completed) return;
    const maxProgress = Math.max(0.2, 1 - this.turnsToImpact * 0.45);
    this.progress = Math.min(maxProgress, this.progress + this.speed * dt);
  }
}
