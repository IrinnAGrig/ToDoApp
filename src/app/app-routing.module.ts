import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [{ path: '', redirectTo: 'auth', pathMatch: 'full' },
{
  path: 'auth',
  loadChildren: () =>
    import('./auth/auth.module').then(m => m.AuthModule),
},
{
  path: '',
  canActivateChild: [AuthGuard],
  children: [
    {
      path: 'activities',
      loadChildren: () =>
        import('./activities/activities.module').then(m => m.ActivitiesModule),
    },
    {
      path: 'report',
      loadChildren: () =>
        import('./report-activities/report-activities.module').then(m => m.ReportActivitiesModule),
    },
    // {
    //   path: 'product',
    //   data: {
    //     role: ['Any'],
    //   },
    //   children: [
    //     {
    //       path: 'add-new-product',
    //       loadChildren: () =>
    //         import('./product/product.module').then(m => m.ProductModule),
    //     },
    //     {
    //       path: ':idProd',
    //       loadChildren: () =>
    //         import('./product/product.module').then(m => m.ProductModule),
    //     }
    //   ]
    // },
  ],
},
{
  path: '**',
  redirectTo: 'auth',
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
