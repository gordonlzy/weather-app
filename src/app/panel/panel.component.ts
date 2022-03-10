import { Component, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import { WeatherApiService } from '../services/weather-api.service';
import { OnlineOfflineService } from '../services/online-offline.service';
import { DatabaseService } from '../services/database.service';
import { PanelService } from '../services/panel.service';

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

  updatePanel() {
    this.weatherAPIService
      .fetchData(this.panelText)
      .subscribe(async data => {
        const weather = data["weather"][0]["main"];
        const newPanel = await this.panelService.createNewPanel(this.panelText, weather, this.time);

        this.setTimeToCurrentTime();
        this.setReadyToDisplay(true, '');
        this.changeBackground(weather);
        this.databaseService.addPanelToDB(newPanel)
      }, err => {
        this.setReadyToDisplay(false, err.error.message);
      });
  }

  runQuery() {
    if (this.panelText != '' && !this.isWaitingFirstInput && !this.hasError) {
      clearInterval(this.intervalID);
      this.updatePanel();
      this.intervalID = setInterval(() => {
        this.updatePanel();
      }, 20000);
    }
  }

  setTimeToCurrentTime() {
    this.time = new Date().toLocaleTimeString();
  }

  async handleInput() {
    this.panelText = this.panelService.capitalizeCity(this.panelText);
    this.isWaitingFirstInput = false;
    if (this.onlineOfflineService.isOnline) {
      this.runQuery();
    } else {
      const panel = await this.databaseService.retrivePanelFromDB(this.panelText);
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

  handleEdit() {
    clearInterval(this.intervalID);
    this.panelText = '';
    this.isWaitingFirstInput = true;
    this.isReadyToDisplayText = false;
  }

  registerToEvents(onlineOfflineService: OnlineOfflineService) {
    onlineOfflineService.connectionChanged.subscribe(online => {
      if (online) {
        console.log("went online");
        this.runQuery();
      } else {
        console.log("went offline");
        clearInterval(this.intervalID);
      }
    })
  }

  constructor(private weatherAPIService: WeatherApiService, private onlineOfflineService: OnlineOfflineService, 
    private databaseService: DatabaseService, private panelService: PanelService) {
    this.registerToEvents(onlineOfflineService);
  }

  ngOnInit(): void {
  }

}
