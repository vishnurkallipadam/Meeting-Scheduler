import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[srcObject]'
})
export class AddSrcDirective {
  @Input() srcObject = null
    constructor(private el: ElementRef) { }

    ngAfterViewInit() {
        console.log("srcObject", this.srcObject)
        this.el.nativeElement.srcObject = this.srcObject
    }
}
