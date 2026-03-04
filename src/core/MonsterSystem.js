/**
 * Monster behavioral system
 */
export class Monster {
    constructor(id, data) {
        this.id = id;
        this.name = data.name || "Unknown";
        this.maxHp = data.hp || 100;
        this.hp = this.maxHp;
        this.atk = data.atk || 10;
        this.patterns = data.patterns || ["NORMAL"];

        this.state = "IDLE"; // IDLE, TELEGRAPH, ATTACK, POST_DELAY
        this.timer = 0;
        this.x = 0;
        this.y = 0;

        this.config = {
            telegraphTime: (data.telegraph || 1.0) * 60,
            postDelay: (data.postdelay || 1.0) * 60,
            hitStop: data.hitstop || 3
        };
    }

    update() {
        if (this.timer > 0) this.timer--;

        switch (this.state) {
            case "TELEGRAPH":
                if (this.timer <= 0) {
                    this.state = "ATTACK";
                    this.timer = this.config.hitStop;
                }
                break;
            case "ATTACK":
                if (this.timer <= 0) {
                    this.state = "POST_DELAY";
                    this.timer = this.config.postDelay;
                }
                break;
            case "POST_DELAY":
                if (this.timer <= 0) {
                    this.state = "IDLE";
                }
                break;
        }
    }

    startAttack() {
        this.state = "TELEGRAPH";
        this.timer = this.config.telegraphTime;
    }
}
