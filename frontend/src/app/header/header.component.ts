import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import { GlobalContainerService } from '../shared/global-container.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  search(searchTerm) {
    if (searchTerm) {
      this.router.navigate(['/fii/' + searchTerm]);
    }
  }
}
