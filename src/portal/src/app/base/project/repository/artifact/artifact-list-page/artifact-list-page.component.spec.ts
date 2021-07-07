import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ArtifactListPageComponent } from './artifact-list-page.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from "../../../../../shared/services/session.service";
import { AppConfigService } from "../../../../../services/app-config.service";
import { ArtifactService } from "../../../../../../../ng-swagger-gen/services/artifact.service";
import { ArtifactDefaultService } from "../artifact.service";

describe('ArtifactListPageComponent', () => {
    let component: ArtifactListPageComponent;
    let fixture: ComponentFixture<ArtifactListPageComponent>;
    const mockSessionService = {
        getCurrentUser: () => { }
    };
    const mockAppConfigService = {
        getConfig: () => {
            return {
                project_creation_restriction: "",
                with_chartmuseum: "",
                with_notary: "",
                with_trivy: "",
                with_admiral: "",
                registry_url: "",
            };
        }
    };
    const mockRouter = {
        navigate: () => { }
    };
    const mockArtifactService = {
        triggerUploadArtifact: {
            next: () => {}
        }
    };
    const mockActivatedRoute = {
        RouterparamMap: of({ get: (key) => 'value' }),
        snapshot: {
            params: {
                id: 1,
            },
            parent: {
                params: { id: 1 },

            },
            data: {
                projectResolver: {
                    has_project_admin_role: true,
                    current_user_role_id: 3,
                }
            }
        },
        data: of({
            projectResolver: {
                ismember: true,
                role_name: 'maintainer',
            }
        }),
        params: {
            subscribe: () => {
                return of(null);
            }
        }
    };
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ],
            imports: [
                BrowserAnimationsModule,
                ClarityModule,
                TranslateModule.forRoot(),
                FormsModule,
                NoopAnimationsModule,
                HttpClientTestingModule
            ],
            declarations: [ArtifactListPageComponent],
            providers: [
                TranslateService,
                ArtifactDefaultService,
                { provide: SessionService, useValue: mockSessionService },
                { provide: AppConfigService, useValue: mockAppConfigService },
                { provide: Router, useValue: mockRouter },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: ArtifactService, useValue: mockArtifactService },
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ArtifactListPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
