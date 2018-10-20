import { HttpService } from './shared/http.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { GlobalContainerService } from './shared/global-container.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  loading: Observable<boolean> = this.globalState.select(state => state.loading);

  constructor(private globalState: GlobalContainerService) { }

}
