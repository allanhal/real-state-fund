import { GlobalContainerService } from './../shared/global-container.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {

  targetPercentual: Observable<Number> = this.globalState.select(state => state.targetPercentual);

  constructor(public globalState: GlobalContainerService) { }

  ngOnInit() {
  }

  onButtonSave(targetYield: string) {
    this.globalState.changeState({ targetPercentual: targetYield })
  }

}
