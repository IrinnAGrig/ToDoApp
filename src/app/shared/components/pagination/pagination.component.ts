import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnChanges {
  @Input() pageSize = 10;
  @Input() listLength = 0;
  @Output() currentPage = new EventEmitter<number>();
  actualPage = 1;
  pages = new Array();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['listLength']) {
      this.actualPage = 1;
      this.currentPage.emit(this.actualPage);
    }
  }

  goToPage(pageNumber: number): void {
    const totalPages = this.totalPages;
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      this.actualPage = pageNumber;
      this.currentPage.emit(pageNumber);
    } else {
      this.actualPage = 1;
      this.currentPage.emit(1);
    }
  }

  getPageNumbers(totalPages: number): number[] {
    let pages = Array(7);


    if (totalPages <= 7) {
      pages = Array.from({ length: totalPages }, (_, index) => index + 1);
    } else {
      pages[0] = 1;
      pages[6] = totalPages;
      if (this.actualPage >= 5 && this.actualPage < totalPages - 2) {
        pages[1] = 0;
        pages[2] = this.actualPage - 1;
        pages[3] = this.actualPage;
        pages[4] = this.actualPage + 1;
        pages[5] = 0;
      } else if (this.actualPage > totalPages - 5) {
        pages[1] = 0;
        pages[2] = totalPages - 4;
        pages[3] = totalPages - 3;
        pages[4] = totalPages - 2;
        pages[5] = totalPages - 1;
      } else {
        pages[1] = 2;
        pages[2] = 3;
        pages[3] = 4;
        pages[4] = 5;
        pages[5] = 0;
      }
    }
    this.pages = pages;
    return pages;
  }

  duobleStep(step: number) {
    if (step == 1) {
      if (this.actualPage - 2 > 0) {
        this.actualPage -= 2;
        this.goToPage(this.actualPage);
      }
    } else {
      if (this.actualPage + 2 <= this.listLength) {
        this.actualPage += 2;
        this.goToPage(this.actualPage);
      }
    }
  }

  get totalPages(): number {
    return Math.ceil(this.listLength / this.pageSize);
  }
}
