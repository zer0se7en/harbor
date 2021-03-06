import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClarityModule } from '@clr/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GroupService } from "../group.service";
import { MessageHandlerService } from "../../../../shared/services/message-handler.service";
import { SessionService } from "../../../../shared/services/session.service";
import { AppConfigService } from "../../../../services/app-config.service";
import { AddGroupModalComponent } from './add-group-modal.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AddGroupModalComponent', () => {
  let component: AddGroupModalComponent;
  let fixture: ComponentFixture<AddGroupModalComponent>;
  let fakeSessionService = {
    getCurrentUser: function () {
      return { has_admin_role: true };
    }
  };
  let fakeGroupService = null;
  let fakeAppConfigService = {
    isLdapMode: function () {
      return true;
    },
    isHttpAuthMode: function () {
      return false;
    },
    isOidcMode: function () {
      return false;
    }
  };
  let fakeMessageHandlerService = null;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AddGroupModalComponent],
      imports: [
        ClarityModule,
        FormsModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot()
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        ChangeDetectorRef,
        { provide: MessageHandlerService, useValue: fakeMessageHandlerService },
        { provide: SessionService, useValue: fakeSessionService },
        { provide: AppConfigService, useValue: fakeAppConfigService },
        { provide: GroupService, useValue: fakeGroupService },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGroupModalComponent);
    component = fixture.componentInstance;
    component.open();
    fixture.autoDetectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
