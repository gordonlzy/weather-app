import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  items = Array.apply(null, Array(9)).map(_ => {city: ""});
  title = 'Weather App';
}
