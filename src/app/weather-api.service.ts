import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WeatherApiService {

  constructor(private http: HttpClient) { }

  fetchData(panelText:string) {
    const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${panelText}&appid=7d7bb0af43748b88ab08a9945fa1d241`;
    return this.http.get<any>(endpoint)
      .pipe(catchError(err => throwError(err)));
  }
}
