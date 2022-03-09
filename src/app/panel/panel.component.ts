import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})
export class PanelComponent implements OnInit {
  panelText = '';
  isWaitingInput = false;
  isReadyForDisplay = false;

  togglePanel() {
    if (this.panelText == '') {
      this.isWaitingInput = true;
    }
  }

  handleInput(e: Event) {
    this.isWaitingInput = false;
    this.isReadyForDisplay = true;
  }

  handleEdit(e: Event) {
    this.panelText = '';
    this.isWaitingInput = true;
    this.isReadyForDisplay = false;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
