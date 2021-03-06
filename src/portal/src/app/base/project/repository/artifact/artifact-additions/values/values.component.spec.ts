import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA, SecurityContext } from '@angular/core';
import { ClarityModule } from '@clr/angular';
import { FormsModule } from '@angular/forms';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { BrowserModule } from '@angular/platform-browser';
import { ValuesComponent } from "./values.component";
import { AdditionsService } from "../additions.service";
import { of } from "rxjs";
import { AdditionLink } from "../../../../../../../../ng-swagger-gen/models/addition-link";
import { ErrorHandler } from "../../../../../../shared/units/error-handler";


describe('ValuesComponent', () => {
  let component: ValuesComponent;
  let fixture: ComponentFixture<ValuesComponent>;

  const mockedValues = `
    adminserver.image.pullPolicy: IfNotPresent,
    adminserver.image.repository: vmware/harbor-adminserver,
    adminserver.image.tag: dev
    `;
  const fakedAdditionsService = {
    getDetailByLink() {
      return of(mockedValues);
    }
  };
  const mockedLink: AdditionLink = {
    absolute: false,
    href: '/test'
  };
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MarkdownModule.forRoot({ sanitize: SecurityContext.HTML }),
        ClarityModule,
        FormsModule,
        BrowserModule
      ],
      declarations: [ValuesComponent],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        TranslateService,
        ErrorHandler,
        {provide: AdditionsService, useValue: fakedAdditionsService},
        {provide: MarkedOptions, useValue: {}},
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValuesComponent);
    component = fixture.componentInstance;
    component.valueMode = true;
    component.valuesLink = mockedLink;
    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should get values  and render', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    const trs = fixture.nativeElement.getElementsByTagName('tr');
    expect(trs.length).toEqual(3);
  });
});
