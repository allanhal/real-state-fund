import { UtilsService } from './../utils.service';
import { GlobalContainerService } from './../shared/global-container.service';
import { HttpService } from '../shared/http.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-fii-detail',
  templateUrl: './fii-detail.component.html',
  styleUrls: ['./fii-detail.component.css']
})
export class FiiDetailComponent implements OnInit {

  isInvalid: string = `Loading...`

  fii = {}
  fiiKeys = []

  price: Number = 0

  targetPercentual: Observable<Number> = this.globalState.select(state => state.targetPercentual);

  pricePercentage: string = `0%`
  pricePercentageRest: string = `0%`

  vp: Number = 0
  vpPercentage: string = `0%`
  vpPercentageRest: string = `0%`

  lastDyPercentageAnnualy
  annualAverageDyPercentage

  otherFromSameSegment = []
  otherFromSameType = []

  constructor(private HttpService: HttpService,
    private route: ActivatedRoute,
    private globalState: GlobalContainerService,
    public utilsService: UtilsService) { }

  ngOnInit() {
    this.fiiUpdate()
  }

  fiiUpdate() {
    this.route.params.subscribe(params => {
      this.globalState.changeState({ loading: true })
      this.HttpService.getFii(params.id).subscribe(fii => {
        Object.keys(fii).forEach(key => {
          this.fiiKeys.push(key)
        })
        this.fii = fii

        this.vp = fii['vp']

        this.setDefaultValues()

        let vpAsPercentage = this.utilsService.parse(fii['vp'] % 1 * 100)
        if (this.vp >= 1) {
          this.vpPercentage = this.utilsService.parseToPercentageString(100 - (vpAsPercentage))
          this.vpPercentageRest = this.utilsService.parseToPercentageString(vpAsPercentage)
        } else {
          this.pricePercentage = this.utilsService.parseToPercentageString(vpAsPercentage)
          this.pricePercentageRest = this.utilsService.parseToPercentageString((100 - (vpAsPercentage)))
        }

        this.lastDyPercentageAnnualy = this.utilsService.parseToPercentageString(fii.lastDyPercentageAnnualy)
        this.annualAverageDyPercentage = this.utilsService.parseToPercentageString(fii.annualAverageDyPercentage)

        this.HttpService.getSegment(fii.segment).subscribe(segmentResult => {
          this.otherFromSameSegment = segmentResult
        })

        this.HttpService.getType(fii.type).subscribe(typeResult => {
          this.otherFromSameType = typeResult
        })
        this.globalState.changeState({ loading: false })
        this.isInvalid = undefined
      }, err => {
        this.isInvalid = err.message
        this.globalState.changeState({ loading: false })
      })
    })
  }

  private setDefaultValues() {
    this.pricePercentage = `100%`
    this.pricePercentageRest = ``

    this.vpPercentage = `100%`
    this.vpPercentageRest = ``
  }

}
