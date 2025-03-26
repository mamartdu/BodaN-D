import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { GoogleDriveService } from './google-drive.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot([ // Definir rutas aquí
      { path: '', component: HomeComponent },
    ])
  ],
  providers: [GoogleDriveService],
  bootstrap: [AppComponent]
})
export class AppModule { }