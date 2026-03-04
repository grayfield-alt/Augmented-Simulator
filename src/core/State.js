/**
 * Reactive State Store for V3
 */
class Store {
    constructor() {
        this.state = {
            gameStarted: false,
            currentTurn: 'PLAYER', // 'PLAYER' | 'MONSTER'
            round: 0,
            player: {
                hp: 100,
                maxHp: 100,
                atk: 50,
                def: 0,
                ap: 0,
                parryTimer: 0,
                dashTimer: 0,
                isParrying: false
            },
            monsters: [],
            messages: [],
            visuals: {
                vignetteOpacity: 0,
                hitIcons: []
            }
        };
        this.listeners = [];
    }

    getState() {
        return this.state;
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(l => l(this.state));
    }
}

export const GameStore = new Store();
