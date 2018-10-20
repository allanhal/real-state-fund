import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FiiDetailComponent } from './fii-detail.component';

describe('FiiDetailComponent', () => {
  let component: FiiDetailComponent;
  let fixture: ComponentFixture<FiiDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FiiDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FiiDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
