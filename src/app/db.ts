import Dexie, {Table} from 'dexie';

export interface Panel {
    city: string,
    weather: string,
    time: string,
    image: Blob;
}

export class AppDB extends Dexie {
    panel!: Table<Panel, string>;

    constructor() {
        super('ngdexieliveQuery');
        this.version(1).stores({
            panel: 'city, weather, time, image'
        });
    }
}

export const db = new AppDB();
