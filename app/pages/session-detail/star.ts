import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'star',
  template: `<span class="star" [class.active]="active" (click)="handleRate($event)"><ion-icon name="star-outline"></ion-icon></span>`,
})
export class Star {
  @Input() active: boolean;
  @Input() position: number;
  @Output() rate = new EventEmitter();

  handleRate() {
    this.rate.emit(this.position);
  }
}
