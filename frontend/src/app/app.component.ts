import { HttpService } from './shared/http.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  myFiis
  totalValue = 0
  totalDY = 0

  constructor(private HttpService: HttpService) { }

  ngOnInit() {
    this.getMyFiis()
  }

  getMyFiis() {
    this.HttpService.getMyFiis().subscribe(myFiis => {
      this.myFiis = myFiis
      this.updateSums()
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
    this.HttpService.getFii(addCod).subscribe(fii => {
      fii.qt = 0
      this.myFiis.push(fii)
      this.updateSums()
    })
  }

  updateSums() {
    this.totalValue = 0
    this.totalDY = 0
    this.myFiis.forEach(fii => {
      this.totalValue += this.parseNumber(fii.price) * this.parseNumber(fii.qt)
      this.totalDY += this.parseNumber(fii.lastDy) * this.parseNumber(fii.qt)
      this.totalValue = this.parseNumber(this.totalValue)
      this.totalDY = this.parseNumber(this.totalDY)
    });
  }

  private parseNumber(toParse) {
    toParse = (Math.round(toParse * 100) / 100).toString()
    return parseFloat(toParse) || 0
  }
}
