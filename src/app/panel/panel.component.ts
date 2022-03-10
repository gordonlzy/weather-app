import { Component, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import { WeatherApiService } from '../weather-api.service';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})

@Injectable()
export class PanelComponent implements OnInit {
  panelText = '';
  error = '';
  time = '';

  isWaitingFirstInput = false;
  isReadyToDisplayText = false;
  hasError = false;

  background = {'sunny-background': false, 'clouds-background': false, 'rainy-background': false}

  togglePanel() {
    if (this.panelText == '') {
      this.isWaitingFirstInput = true;
    }
  }

  changeBackground(weather:string) {
    if (weather == "Clear") {
      this.background = {'sunny-background': true, 'clouds-background': false, 'rainy-background': false}
    } else if (weather == "Clouds" || weather == "Haze" || weather == "Mist" || weather == "Smoke") {
      this.background = {'sunny-background': false, 'clouds-background': true, 'rainy-background': false}
    } else if (weather == "Rain") {
      this.background = {'sunny-background': false, 'clouds-background': false, 'rainy-background': true}
    }
    return null;
  }

  async handleInput(e: Event) {
    this.isWaitingFirstInput = false;
    this.weatherAPIService
      .fetchData(this.panelText)
      .subscribe(data => {
        this.error = '';
        this.time = new Date().toLocaleTimeString();
        this.changeBackground(data["weather"][0]["main"]);
        this.hasError = false;
        this.isReadyToDisplayText = true;
      }, err => {
        this.hasError = true;
        this.isReadyToDisplayText = false;
        this.error = err.error.message;
      });
  }

  handleEdit(e: Event) {
    this.panelText = '';
    this.isWaitingFirstInput = true;
    this.isReadyToDisplayText = false;
  }

  constructor(private weatherAPIService: WeatherApiService) { }

  ngOnInit(): void {
  }

}
