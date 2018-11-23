import { UtilsService } from './../utils.service';
import { Component, OnInit } from '@angular/core';
import { HttpService } from '../shared/http.service';
import { GlobalContainerService } from '../shared/global-container.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  lastSort

  targetPercentual: Observable<Number> = this.globalState.select(state => state.targetPercentual);

  allFiis

  pricePercentage = "10%"
  pricePercentageRest = "20%"

  constructor(private HttpService: HttpService,
    private globalState: GlobalContainerService,
    public utilsService: UtilsService) { }

  ngOnInit() {
    this.allFiisUpdate()
  }

  allFiisUpdate() {
    this.globalState.changeState({ loading: true })
    this.HttpService.getAllFiis().subscribe(allFiis => {
      this.allFiis = allFiis

      allFiis.forEach(fii => {


        let vpAsPercentage = this.utilsService.parse(fii['vp'] % 1 * 100)
        if (fii.vp >= 1) {
          fii.vpPercentage = this.utilsService.parseToPercentageString(100 - (vpAsPercentage))
          fii.vpPercentageRest = this.utilsService.parseToPercentageString(vpAsPercentage)
        } else {
          fii.pricePercentage = this.utilsService.parseToPercentageString(vpAsPercentage)
          fii.pricePercentageRest = this.utilsService.parseToPercentageString((100 - (vpAsPercentage)))
        }

      });

      this.globalState.changeState({ loading: false })
    })
  }

  sortByField(field: string) {
    let invert = false;
    if (this.lastSort == field) {
      invert = true;
      this.lastSort = undefined
    } else {
      this.lastSort = field
    }
    this.allFiis.sort((fiiA, fiiB) => {
      return invert ? fiiA[field] - fiiB[field] : fiiB[field] - fiiA[field]
    })
  }

}
