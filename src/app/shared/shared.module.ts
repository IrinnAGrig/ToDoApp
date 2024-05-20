import { NgModule } from "@angular/core";
import { DurationPipe } from "./pipes/duration.pipe";
import { CommonModule } from "@angular/common";
import { PaginationComponent } from "./components/pagination/pagination.component";

@NgModule({
    declarations: [
        DurationPipe,
        PaginationComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [DurationPipe, CommonModule, PaginationComponent],
})
export class SharedModule {
}
