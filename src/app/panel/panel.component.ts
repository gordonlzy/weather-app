import { Component, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  isWaitingInput = false;
  isReadyForDisplay = false;
  weather: any;

  togglePanel() {
    if (this.panelText == '') {
      this.isWaitingInput = true;
    }
  }

  fetchData() {
    const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${this.panelText}&appid=7d7bb0af43748b88ab08a9945fa1d241`;
    const options = {
      observe: 'body',
      responseType: 'json'
    }
    return this.http.get(endpoint).subscribe(
      data => {
        this.weather = data;
        console.log(this.weather["weather"][0]["main"]);
      }
    );
  }

  async handleInput(e: Event) {
    this.isWaitingInput = false;
    this.isReadyForDisplay = true;
    this.fetchData()
  }

  handleEdit(e: Event) {
    this.panelText = '';
    this.isWaitingInput = true;
    this.isReadyForDisplay = false;
  }

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

}
