import { Component, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import { WeatherApiService } from '../weather-api.service';
import { db, Panel } from '../db';
import { OnlineOfflineService } from '../online-offline.service';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})

@Injectable()
export class PanelComponent implements OnInit {
  bkURL = {};

  panelText = '';
  error = '';
  time = '';
  intervalID: any;

  isWaitingFirstInput = false;
  isReadyToDisplayText = false;
  hasError = false;

  capitalizeCity(city: string) {
    var words = city.toLowerCase().split(' ');
    for (var i = 0; i < words.length; i++) {
      words[i] = words[i].charAt(0).toUpperCase() +
      words[i].substring(1);
    }
    return words.join(' ');
  }

  async addPanelToDB(panel: Panel) {
    db.panel
      .put(panel)
      .then(async () => {
        const allItems: Panel[] = await db.panel.toArray();
        console.log("saved", allItems);
      })
      .catch(err => {
        console.log(err);
      })
  }

  async retrivePanelFromDB(city: string) {
    return db.panel.get(city);
  }

  togglePanel() {
    if (this.panelText == '' && !this.hasError) {
      this.isWaitingFirstInput = true;
    }
  }

  updateBackgroundImage(url: string) {
    this.bkURL = {'background-image': `url(${url})`}
  }

  setReadyToDisplay(ready: boolean, errorMessage: string) {
    if (ready) {
      this.error = '';
      this.hasError = false;
      this.isReadyToDisplayText = true;
    } else {
      this.error = errorMessage;
      this.hasError = true;
      this.isReadyToDisplayText = false;
    }
  }

  changeBackground(weather:string) {
    if (weather == "Clear") {
      this.updateBackgroundImage('/assets/sunny.jpg');
    } else if (weather == "Clouds" || weather == "Haze" || weather == "Mist" || weather == "Smoke") {
      this.updateBackgroundImage('/assets/clouds.jpg');
    } else if (weather == "Rain") {
      this.updateBackgroundImage('/assets/rainy.jpg');
    }
  }

  changeWeatherToURL(weather: string) {
    if (weather == "Clear") {
      return "/assets/sunny.jpg";
    } else if (weather == "Clouds" || weather == "Haze" || weather == "Mist" || weather == "Smoke") {
      return "/assets/clouds.jpg";
    } else if (weather == "Rain") {
      return "/assets/rainy.jpg";
    }
    return "";
  }

  runQuery() {
    clearInterval(this.intervalID);
    this.updatePanel();
    this.intervalID = setInterval(() => {
      this.updatePanel();
    }, 20000);
  }

  setTimeToCurrentTime() {
    this.time = new Date().toLocaleTimeString();
  }

  async createNewPanel(weather: string) {
    return {
      city: this.capitalizeCity(this.panelText),
      weather: weather,
      time: this.time,
      image: await (await fetch(this.changeWeatherToURL(weather))).blob()
    }
  }

  updatePanel() {
    this.weatherAPIService
      .fetchData(this.panelText)
      .subscribe(async data => {
        const weather = data["weather"][0]["main"];
        const newPanel = await this.createNewPanel(weather);

        this.setTimeToCurrentTime();
        this.setReadyToDisplay(true, '');
        this.changeBackground(weather);
        this.addPanelToDB(newPanel)
      }, err => {
        this.setReadyToDisplay(false, err.error.message);
      });
  }

  async handleInput(e: Event) {
    this.panelText = this.capitalizeCity(this.panelText);
    this.isWaitingFirstInput = false;
    if (this.onlineOfflineService.isOnline) {
      this.runQuery();
    } else {
      const panel = await this.retrivePanelFromDB(this.panelText);
      if (panel) {
        const imageSource = window.URL.createObjectURL(panel.image);
        this.updateBackgroundImage(imageSource)
        this.setReadyToDisplay(true, '');
        this.panelText = panel.city;
        this.time = panel.time;
      } else {
        this.setReadyToDisplay(false, 'No available data offline');
      }
    }
  }

  handleEdit(e: Event) {
    this.panelText = '';
    this.isWaitingFirstInput = true;
    this.isReadyToDisplayText = false;
  }

  registerToEvents(onlineOfflineService: OnlineOfflineService) {
    onlineOfflineService.connectionChanged.subscribe(online => {
      if (online) {
        console.log("went online");
        if (this.panelText != '') {
          this.updatePanel();
          this.intervalID = setInterval(() => {
            this.updatePanel();
          }, 20000);
        }
      } else {
        console.log("went offline");
        clearInterval(this.intervalID);
      }
    })
  }

  constructor(private weatherAPIService: WeatherApiService, private onlineOfflineService: OnlineOfflineService) {
    this.registerToEvents(onlineOfflineService);
  }

  ngOnInit(): void {
  }

}
