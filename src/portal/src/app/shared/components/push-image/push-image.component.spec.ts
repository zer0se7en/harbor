import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { PushImageButtonComponent } from './push-image.component';
import { CopyInputComponent } from './copy-input.component';
import { InlineAlertComponent } from '../inline-alert/inline-alert.component';
import { ErrorHandler } from '../../units/error-handler';
import { SharedTestingModule } from "../../shared.module";

describe('PushImageButtonComponent (inline template)', () => {
  let component: PushImageButtonComponent;
  let fixture: ComponentFixture<PushImageButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedTestingModule
      ],
      declarations: [InlineAlertComponent, CopyInputComponent, PushImageButtonComponent],
      providers: [
        ErrorHandler
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PushImageButtonComponent);
    component = fixture.componentInstance;
    component.projectName = 'testing';
    component.registryUrl = 'https://testing.harbor.com';
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should open the drop-down panel', () => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      let el: HTMLElement = fixture.nativeElement.querySelector('button');
      expect(el).not.toBeNull();
      el.click();

      fixture.detectChanges();
      let copyInputs: HTMLInputElement[] = fixture.nativeElement.querySelectorAll('.command-input');
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(copyInputs.length).toEqual(5);
        expect(copyInputs[0].value.trim())
        .toEqual(`docker tag SOURCE_IMAGE[:TAG] ${component.registryUrl}/${component.projectName}/REPOSITORY[:TAG]`);
        expect(copyInputs[1].value.trim()).toEqual(`docker push ${component.registryUrl}/${component.projectName}/REPOSITORY[:TAG]`);
      });
    });
  });

});
