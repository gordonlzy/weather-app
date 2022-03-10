import { Component, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})

@Injectable()
export class PanelComponent implements OnInit {
  panelText = '';
  error = '';

  isWaitingFirstInput = false;
  isReadyToDisplayText = false;
  hasError = false;

  background = {'sunny-background': false, 'clouds-background': false, 'rainy-background': false}

  togglePanel() {
    if (this.panelText == '') {
      this.isWaitingFirstInput = true;
    }
  }

  handleError(error: HttpErrorResponse) {
    return throwError(error.status + " " + error.statusText);
  }

  changeBackground(weather:string) {
    if (weather == "Clear") {
      this.background = {'sunny-background': true, 'clouds-background': false, 'rainy-background': false}
    } else if (weather == "Clouds") {
      this.background = {'sunny-background': false, 'clouds-background': true, 'rainy-background': false}
    } else if (weather == "Rain") {
      this.background = {'sunny-background': false, 'clouds-background': false, 'rainy-background': true}
    }
    return null;
}

  fetchData() {
    const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${this.panelText}&appid=7d7bb0af43748b88ab08a9945fa1d241`;
    const options = {
      observe: 'body',
      responseType: 'json'
    }
    const res = this.http.get<any>(endpoint)
    
    res
      .pipe(catchError(err => {
        this.hasError = true;
        this.isReadyToDisplayText = false;
        this.error = err.error.message;
        return throwError(err.status);
      }))
      .subscribe(data => {
        this.error = '';
        this.changeBackground(data["weather"][0]["main"]);
        this.hasError = false;
        this.isReadyToDisplayText = true;
      });
  }

  async handleInput(e: Event) {
    this.isWaitingFirstInput = false;
    this.fetchData()
  }

  handleEdit(e: Event) {
    this.panelText = '';
    this.isWaitingFirstInput = true;
    this.isReadyToDisplayText = false;
  }

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

}
