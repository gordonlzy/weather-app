import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})
export class PanelComponent implements OnInit {
  isWaitingInput = false;

  updatePanel() {
    this.isWaitingInput = !this.isWaitingInput;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
