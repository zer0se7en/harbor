import { SystemInfoService } from '../../../../shared/services';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorHandler } from '../../../../shared/units/error-handler';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog';
import { ProjectPolicyConfigComponent } from './project-policy-config.component';
import { ProjectService } from '../../../../shared/services';
import {SystemCVEAllowlist, SystemInfo} from '../../../../shared/services';
import { Project } from './project';
import { UserPermissionService } from '../../../../shared/services';
import { of } from 'rxjs';
import { CURRENT_BASE_HREF } from "../../../../shared/units/utils";
import { SharedTestingModule } from "../../../../shared/shared.module";

const mockSystemInfo: SystemInfo[] = [
  {
    'with_trivy': true,
    'with_notary': true,
    'with_admiral': false,
    'admiral_endpoint': 'NA',
    'auth_mode': 'db_auth',
    'registry_url': '10.112.122.56',
    'project_creation_restriction': 'everyone',
    'self_registration': true,
    'has_ca_root': false,
    'harbor_version': 'v1.1.1-rc1-160-g565110d'
  },
  {
    'with_trivy': false,
    'with_notary': false,
    'with_admiral': false,
    'admiral_endpoint': 'NA',
    'auth_mode': 'db_auth',
    'registry_url': '10.112.122.56',
    'project_creation_restriction': 'everyone',
    'self_registration': true,
    'has_ca_root': false,
    'harbor_version': 'v1.1.1-rc1-160-g565110d'
  }
];
const mockProjectPolicies: Project[] | any[] = [
  {
    'project_id': 1,
    'owner_id': 1,
    'name': 'library',
    'creation_time': '2017-11-03T02:37:24Z',
    'update_time': '2017-11-03T02:37:24Z',
    'deleted': 0,
    'owner_name': '',
    'togglable': false,
    'current_user_role_id': 0,
    'repo_count': 0,
    'metadata': {
      'public': 'true'
    }
  },
  {
    'project_id': 2,
    'owner_id': 1,
    'name': 'test',
    'creation_time': '2017-11-03T02:37:24Z',
    'update_time': '2017-11-03T02:37:24Z',
    'deleted': 0,
    'owner_name': '',
    'togglable': false,
    'current_user_role_id': 0,
    'repo_count': 0,
    'metadata': {
      'auto_scan': 'true',
      'enable_content_trust': 'true',
      'prevent_vul': 'true',
      'public': 'true',
      'severity': 'low'
    }
  }
];
const mockSystemAllowlist: SystemCVEAllowlist = {
  "expires_at": 1561996800,
  "id": 1,
  "items": [],
  "project_id": 0
};
const projectService = {
  getProject() {
    return of(mockProjectPolicies[1]);
  }
};

const systemInfoService = {
  getSystemInfo() {
    return of(mockSystemInfo[0]);
  },
  getSystemAllowlist() {
    return of(mockSystemAllowlist);
  }
};

const userPermissionService = {
  getPermission() {
     return of(true);
  }
};
describe('ProjectPolicyConfigComponent', () => {
  let fixture: ComponentFixture<ProjectPolicyConfigComponent>,
      component: ProjectPolicyConfigComponent;
  function createComponent() {
    fixture = TestBed.createComponent(ProjectPolicyConfigComponent);
    component = fixture.componentInstance;
    component.projectId = 1;
    fixture.detectChanges();
  }
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
      declarations: [
        ProjectPolicyConfigComponent,
        ConfirmationDialogComponent,
        ConfirmationDialogComponent,
      ],
      providers: [
        ErrorHandler,
        { provide: ProjectService, useValue: projectService },
        { provide: SystemInfoService, useValue: systemInfoService},
        { provide: UserPermissionService, useValue: userPermissionService},
      ]
    })
    .compileComponents()
    .then(() => {
      createComponent();
    });
  }));
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should get systemInfo', () => {
    expect(component.systemInfo).toBeTruthy();
  });
  it('should get projectPolicy', () => {
    expect(component.projectPolicy).toBeTruthy();
    expect(component.projectPolicy.ScanImgOnPush).toBeTruthy();
  });
  it('should get hasChangeConfigRole', () => {
    expect(component.hasChangeConfigRole).toBeTruthy();
  });
});
