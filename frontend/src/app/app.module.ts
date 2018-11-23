import { RouterModule, Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HttpService } from './shared/http.service';
import { LoadingModule, ANIMATION_TYPES } from 'ngx-loading';
import { HeaderComponent } from './header/header.component';
import { MainComponent } from './main/main.component';
import { MyWalletComponent } from './my-wallet/my-wallet.component';
import { FiiDetailComponent } from './fii-detail/fii-detail.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

import { TinyStateModule } from '@tinystate/core';
import { GlobalContainerService } from './shared/global-container.service';
import { UtilsService } from './utils.service';
import { ConfigurationComponent } from './configuration/configuration.component';

const appRoutes: Routes = [
  {
    path: 'my-wallet', component: MyWalletComponent
  },
  {
    path: 'config', component: ConfigurationComponent
  },
  {
    path: 'main', component: MainComponent
  },
  {
    path: 'fii/:id', component: FiiDetailComponent
  },
  {
    path: '',
    redirectTo: '/main',
    pathMatch: 'full'
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MainComponent,
    MyWalletComponent,
    FiiDetailComponent,
    PageNotFoundComponent,
    ConfigurationComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    LoadingModule.forRoot({
      animationType: ANIMATION_TYPES.cubeGrid,
      backdropBackgroundColour: 'rgba(0,0,0,0)',
      backdropBorderRadius: '0px',
      primaryColour: '#007bff',
      secondaryColour: '#ffffff',
      tertiaryColour: '#00ffff'
    }),
    TinyStateModule.forRoot(),
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    )
  ],
  providers: [HttpService, GlobalContainerService, UtilsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
