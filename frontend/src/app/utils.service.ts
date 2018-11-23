import { Injectable } from '@angular/core';

@Injectable()
export class UtilsService {

  constructor() { }

  parseToPercentageString(toParse: number) {
    return this.parse(toParse) + '%'
  }

  parse(toParse: number) {
    return Math.round(toParse * 100) / 100
  }

}
