import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { nextTick } from 'q';

@Injectable()
export class HttpService {

  constructor(private http: HttpClient) { }

  getAllFiis() {
    return this.http.get<any>('api/fiis')
  }

  getAllFiisList() {
    return this.http.get<any>('api/fiis/list');
  }

  getMyFiis() {
    return this.http.get<any>('api/fiis/myComplete')
  }

  getFii(fiiCod: string) {
    return this.http.get<any>(`api/fiis/${fiiCod}`)
  }

  getSegment(segment: string) {
    return this.http.get<any>(`api/fiis/segment/${segment}`)
  }

  getType(type: string) {
    return this.http.get<any>(`api/fiis/type/${type}`)
  }
}
