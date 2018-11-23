import { GlobalContainerService } from './../shared/global-container.service';
import { Component, OnInit } from '@angular/core';
import { HttpService } from '../shared/http.service';
import { Observable } from 'rxjs/Observable';
import { UtilsService } from '../utils.service';

@Component({
  selector: 'app-my-wallet',
  templateUrl: './my-wallet.component.html',
  styleUrls: ['./my-wallet.component.css']
})
export class MyWalletComponent implements OnInit {
  myFiis
  totalValue = 0
  totalDY = 0
  sumDYAnnual = 0
  invalidAddCod
  lastSort

  targetPercentual: Observable<Number> = this.globalState.select(state => state.targetPercentual);

  constructor(private HttpService: HttpService,
    private globalState: GlobalContainerService,
    public utilsService: UtilsService) { }

  ngOnInit() {
    this.getMyFiis()
  }

  getMyFiis() {
    this.globalState.changeState({ loading: true })
    this.HttpService.getMyFiis().subscribe(myFiis => {
      this.myFiis = myFiis

      myFiis.map(fii => fii = this.updateVpRatio(fii));

      this.updateSums()
      this.globalState.changeState({ loading: false })
    })
  }

  onInputQtChange(fii, newValue: string) {
    fii.qt = newValue
    this.updateSums()
  }

  onButtonRefresh() {
    this.getMyFiis()
  }

  onButtonRemove(fiiToRemove) {
    this.myFiis = this.myFiis.filter(fii => fii != fiiToRemove)
    this.updateSums()
  }

  onButtonAdd(addCod) {
    this.invalidAddCod = undefined
    if (addCod) {
      this.globalState.changeState({ loading: true })
      this.HttpService.getFii(addCod).subscribe(fii => {
        fii.qt = 0

        fii = this.updateVpRatio(fii);

        this.myFiis.push(fii)
        this.updateSums()
        this.globalState.changeState({ loading: false })
      }, err => {
        this.invalidAddCod = addCod
        this.globalState.changeState({ loading: false })
      })
    } else {
      this.invalidAddCod = 'empty'
    }
  }

  private updateVpRatio(fii: any) {
    let vpAsPercentage = this.utilsService.parse(fii['vp'] % 1 * 100);
    if (fii.vp >= 1) {
      fii.vpPercentage = this.utilsService.parseToPercentageString(100 - (vpAsPercentage));
      fii.vpPercentageRest = this.utilsService.parseToPercentageString(vpAsPercentage);
    }
    else {
      fii.pricePercentage = this.utilsService.parseToPercentageString(vpAsPercentage);
      fii.pricePercentageRest = this.utilsService.parseToPercentageString((100 - (vpAsPercentage)));
    }
    return fii
  }

  onInputAddCodChange() {
    this.invalidAddCod = undefined
  }

  updateSums() {
    this.totalValue = 0
    this.totalDY = 0
    this.sumDYAnnual = 0
    this.myFiis.forEach(fii => {
      this.totalValue += this.parseNumber(fii.price) * this.parseNumber(fii.qt)
      this.totalDY += this.parseNumber(fii.lastDy) * this.parseNumber(fii.qt)
      this.totalValue = this.parseNumber(this.totalValue)
      this.totalDY = this.parseNumber(this.totalDY)
    });
    this.myFiis.forEach(fii => {
      let totalFii = fii.price * fii.qt
      let participation = totalFii / this.totalValue
      this.sumDYAnnual += this.parseNumber(fii.annualAverageDyPercentage) * this.parseNumber(participation)
      this.sumDYAnnual = this.parseNumber(this.sumDYAnnual)
    });

  }

  sortByField(field: string) {
    let invert = false;
    if (this.lastSort == field) {
      invert = true;
      this.lastSort = undefined
    } else {
      this.lastSort = field
    }
    this.myFiis.sort((fiiA, fiiB) => {
      return invert ? fiiA[field] - fiiB[field] : fiiB[field] - fiiA[field]
    })
  }

  private parseNumber(toParse) {
    toParse = (Math.round(toParse * 100) / 100).toString()
    return parseFloat(toParse) || 0
  }
}