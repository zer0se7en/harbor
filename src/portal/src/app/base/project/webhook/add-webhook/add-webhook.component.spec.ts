import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AddWebhookComponent } from './add-webhook.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('AddWebhookComponent', () => {
    let component: AddWebhookComponent;
    let fixture: ComponentFixture<AddWebhookComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA,
                NO_ERRORS_SCHEMA
            ],
            imports: [
                BrowserAnimationsModule,
                ClarityModule,
                TranslateModule.forRoot(),
                FormsModule,
                RouterTestingModule,
                NoopAnimationsModule,
                HttpClientTestingModule
            ],
            declarations: [AddWebhookComponent],
            providers: [
                TranslateService
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AddWebhookComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should open modal and should be edit model', async () => {
        component.isEdit = true;
        component.isOpen = true;
        fixture.detectChanges();
        await fixture.whenStable();
        const body: HTMLElement = fixture.nativeElement.querySelector(".modal-body");
        expect(body).toBeTruthy();
        const title: HTMLElement = fixture.nativeElement.querySelector(".modal-title");
        expect(title.innerText).toEqual('WEBHOOK.EDIT_WEBHOOK');
    });
});
