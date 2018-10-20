import { Component, OnInit } from '@angular/core';
import { HttpService } from '../shared/http.service';
import { GlobalContainerService } from '../shared/global-container.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  targetPercentual: Number = 8;
  allFiis

  constructor(private HttpService: HttpService,
    private globalState: GlobalContainerService) { }

  ngOnInit() {
    this.allFiisUpdate()
  }

  allFiisUpdate() {
    this.globalState.changeState({ loading: true })
    this.HttpService.getAllFiis().subscribe(allFiis => {
      this.allFiis = allFiis
      this.globalState.changeState({ loading: false })
    })
  }

  sort(invert) {
    this.allFiis.sort((fiiA, fiiB) => {
      return invert ? fiiA.lastDyPercentageAnnualy - fiiB.lastDyPercentageAnnualy : fiiB.lastDyPercentageAnnualy - fiiA.lastDyPercentageAnnualy
    })
  }

}
