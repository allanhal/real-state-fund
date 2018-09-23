import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class HttpService {

  constructor(private http: HttpClient) { }

  getMyFiis() {
    return this.http.get<any>('api/fiis/myComplete');
  }
  getFii(fiiCod: string) {
    return this.http.get<any>(`api/fiis/${fiiCod}`);
  }
}
