import { Injectable } from '@angular/core';
import { WeatherApiService } from '../services/weather-api.service';

@Injectable({
  providedIn: 'root'
})
export class PanelService {
  capitalizeCity(city: string) {
    var words = city.toLowerCase().split(' ');
    for (var i = 0; i < words.length; i++) {
      words[i] = words[i].charAt(0).toUpperCase() +
      words[i].substring(1);
    }
    return words.join(' ');
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

  async createNewPanel(panelText:string, weather: string, time: string) {
    return {
      city: this.capitalizeCity(panelText),
      weather: weather,
      time: time,
      image: await (await fetch(this.changeWeatherToURL(weather))).blob()
    }
  }

  constructor(private weatherAPIService: WeatherApiService) { }
}
