import { MonsterTemplate } from '../data/monsters';

export class PersistenceManager {
  static saveMonsterLibrary(lib: MonsterTemplate[]) {
    localStorage.setItem('monster_library', JSON.stringify(lib));
  }

  static loadMonsterLibrary(): MonsterTemplate[] | null {
    const data = localStorage.getItem('monster_library');
    return data ? JSON.parse(data) : null;
  }

  static saveCustomStages(stages: Record<number, string[]>) {
    localStorage.setItem('custom_stages', JSON.stringify(stages));
  }

  static loadCustomStages(): Record<number, string[]> | null {
    const data = localStorage.getItem('custom_stages');
    return data ? JSON.parse(data) : null;
  }
}
