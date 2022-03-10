import { Injectable } from '@angular/core';
import { db, Panel } from '../db';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor() { }

  async addPanelToDB(panel: Panel) {
    db.panel
      .put(panel)
      .catch(err => {
        console.log(err);
      })
  }

  async retrivePanelFromDB(city: string) {
    return db.panel.get(city);
  }
}
