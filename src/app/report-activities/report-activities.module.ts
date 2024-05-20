import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';

import { ReportActivitiesRoutingModule } from './report-activities-routing.module';
import { ReportActivitiesComponent } from './report-activities.component';
import { SharedModule } from '../shared/shared.module';

PlotlyModule.plotlyjs = PlotlyJS;

@NgModule({
  declarations: [
    ReportActivitiesComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReportActivitiesRoutingModule,
    PlotlyModule
  ]
})
export class ReportActivitiesModule { }
