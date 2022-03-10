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

  background = {'sunny-background': false, 'clouds-background': false, 'rainy-background': false}

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

  async retrivePanel(city: string) {
    return db.panel.get(city);
  }

  togglePanel() {
    if (this.panelText == '' && !this.hasError) {
      this.isWaitingFirstInput = true;
    }
  }

  changeBackground(weather:string) {
    if (weather == "Clear") {
      this.bkURL = {'background-image': 'url(/assets/sunny.jpg)'}
    } else if (weather == "Clouds" || weather == "Haze" || weather == "Mist" || weather == "Smoke") {
      this.bkURL = {'background-image': 'url(/assets/clouds.jpg)'}
    } else if (weather == "Rain") {
      this.bkURL = {'background-image': 'url(/assets/rainy.jpg)'}
    }
    return null;
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

  updatePanel() {
    this.weatherAPIService
      .fetchData(this.panelText)
      .subscribe(async data => {
        this.error = '';
        this.time = new Date().toLocaleTimeString();
        this.changeBackground(data["weather"][0]["main"]);
        this.hasError = false;
        this.isReadyToDisplayText = true;
        this.addPanelToDB({
          city: this.capitalizeCity(this.panelText),
          weather: data["weather"][0]["main"],
          time: this.time,
          image: await (await fetch(this.changeWeatherToURL(data["weather"][0]["main"]))).blob()
        })
      }, err => {
        this.hasError = true;
        this.isReadyToDisplayText = false;
        this.error = err.error.message;
      });
  }

  async handleInput(e: Event) {
    this.panelText = this.capitalizeCity(this.panelText);
    this.isWaitingFirstInput = false;
    if (this.onlineOfflineService.isOnline) {
      clearInterval(this.intervalID);
      this.updatePanel();
      this.intervalID = setInterval(() => {
        this.updatePanel();
      }, 20000);
    } else {
      const panel = await this.retrivePanel(this.panelText);
      if (panel) {
        const imageSource = window.URL.createObjectURL(panel.image);
        this.bkURL = {'background-image': `url(${imageSource})`}

        this.error = '';
        this.panelText = panel.city;
        this.time = panel.time;
        this.hasError = false;
        this.isReadyToDisplayText = true;
      } else {
        this.hasError = true;
        this.isReadyToDisplayText = false;
        this.error = 'No available data offline';
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
