// src/app/store.ts (한글)
import { GameState, getInitialGameState } from '../core/state';

export type Subscriber = (state: GameState) => void;

export class AppStore {
    private state: GameState;
    private subscribers: Subscriber[] = [];

    constructor() {
        this.state = getInitialGameState();
    }

    getState() {
        return this.state;
    }

    subscribe(fn: Subscriber) {
        this.subscribers.push(fn);
    }

    dispatch(action: any) {
        console.log(`[ACTION] ${action.type}`, action);
        // Core 리듀서 연동 (실제 배포 시 processTurn 호출)
        // this.state = processTurn(this.state, action);
        this.notify();
    }

    private notify() {
        this.subscribers.forEach(fn => {
            try {
                fn(this.state);
            } catch (e) {
                // [SAFETY NET] UI 업데이트 실패가 코어 로직을 멈추지 않게 격리 (한글)
                console.error("UI Update blocked but core remains stable:", e);
            }
        });
    }
}

export const store = new AppStore();
