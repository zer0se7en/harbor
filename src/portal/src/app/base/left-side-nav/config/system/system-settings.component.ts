import {
    Component,
    Input,
    OnInit,
    Output,
    EventEmitter,
    ViewChild,
    OnChanges,
    SimpleChanges,
    ElementRef
} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Configuration, StringValueItem} from '../config';
import { clone, isEmpty, getChanges, compareValue, CURRENT_BASE_HREF } from '../../../../shared/units/utils';
import {ErrorHandler} from '../../../../shared/units/error-handler';
import {ConfirmationMessage} from '../../../global-confirmation-dialog/confirmation-message';
import {ConfirmationDialogComponent} from '../../../../shared/components/confirmation-dialog';
import {ConfirmationState, ConfirmationTargets} from '../../../../shared/entities/shared.const';
import {ConfirmationAcknowledgement} from '../../../global-confirmation-dialog/confirmation-state-message';
import { SystemCVEAllowlist, SystemInfo, SystemInfoService,
} from '../../../../shared/services';
import {forkJoin} from "rxjs";
import { ConfigurationService } from "../../../../services/config.service";

const fakePass = 'aWpLOSYkIzJTTU4wMDkx';
const ONE_THOUSAND: number = 1000;
const CVE_DETAIL_PRE_URL = `https://nvd.nist.gov/vuln/detail/`;
const TARGET_BLANK = "_blank";

@Component({
    selector: 'system-settings',
    templateUrl: './system-settings.component.html',
    styleUrls: ['./system-settings.component.scss']
})
export class SystemSettingsComponent implements OnChanges, OnInit {
    config: Configuration = new Configuration();
    onGoing = false;
    private originalConfig: Configuration;
    downloadLink: string;
    robotTokenExpiration: string;
    systemAllowlist: SystemCVEAllowlist;
    systemAllowlistOrigin: SystemCVEAllowlist;
    cveIds: string;
    showAddModal: boolean = false;
    systemInfo: SystemInfo;
    @Output() configChange: EventEmitter<Configuration> = new EventEmitter<Configuration>();
    @Output() readOnlyChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() reloadSystemConfig: EventEmitter<any> = new EventEmitter<any>();

    @Input()
    get systemSettings(): Configuration {
        return this.config;
    }

    set systemSettings(cfg: Configuration) {
        this.config = cfg;
        this.configChange.emit(this.config);
    }

    @Input() showSubTitle: boolean = false;
    @Input() hasAdminRole: boolean = false;
    @Input() hasCAFile: boolean = false;
    @Input() withAdmiral = false;

    @ViewChild("systemConfigFrom") systemSettingsForm: NgForm;
    @ViewChild("cfgConfirmationDialog") confirmationDlg: ConfirmationDialogComponent;
    @ViewChild('dateInput') dateInput: ElementRef;

    get editable(): boolean {
        return this.systemSettings &&
            this.systemSettings.token_expiration &&
            this.systemSettings.token_expiration.editable;
    }

    get robotExpirationEditable(): boolean {
        return this.systemSettings &&
            this.systemSettings.robot_token_duration &&
            this.systemSettings.robot_token_duration.editable;
    }

    get tokenExpirationValue() {
        return this.systemSettings.token_expiration.value;
    }
    set tokenExpirationValue(v) {
        // convert string to number
        this.systemSettings.token_expiration.value = +v;
    }
    get robotTokenExpirationValue() {
        return this.systemSettings.robot_token_duration.value;
    }
    set robotTokenExpirationValue(v) {
        // convert string to number
        this.systemSettings.robot_token_duration.value = +v;
    }
    robotNamePrefixEditable(): boolean {
        return this.systemSettings &&
            this.systemSettings.robot_name_prefix &&
            this.systemSettings.robot_name_prefix.editable;
    }

    public isValid(): boolean {
        return this.systemSettingsForm && this.systemSettingsForm.valid;
    }

    public hasChanges(): boolean {
        return !isEmpty(this.getChanges());
    }

    public getChanges() {
        let allChanges = getChanges(this.originalConfig, this.config);
        if (allChanges) {
            return this.getSystemChanges(allChanges);
        }
        return null;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes && changes["systemSettings"]) {
            this.originalConfig = clone(this.config);
        }
    }

    public getSystemChanges(allChanges: any) {
        let changes = {};
        for (let prop in allChanges) {
            if (prop === 'token_expiration' || prop === 'read_only' || prop === 'project_creation_restriction'
                || prop === 'robot_token_duration' || prop === 'notification_enable' || prop === 'robot_name_prefix') {
                changes[prop] = allChanges[prop];
            }
        }
        return changes;
    }

    setRepoReadOnlyValue($event: any) {
        this.systemSettings.read_only.value = $event;
    }

    setWebhookNotificationEnabledValue($event: any) {
        this.systemSettings.notification_enable.value = $event;
    }

    disabled(prop: any): boolean {
        return !(prop && prop.editable);
    }

    get canDownloadCert(): boolean {
        return this.hasAdminRole && this.hasCAFile;
    }

    /**
     *
     * Save the changed values
     *
     * @memberOf ConfigurationComponent
     */
    public save(): void {
        let changes = this.getChanges();
        if (!isEmpty(changes) || !compareValue(this.systemAllowlistOrigin, this.systemAllowlist)) {
            this.onGoing = true;
            let observables = [];
            if (!isEmpty(changes)) {
                observables.push(this.configService.saveConfiguration(changes));
            }
            if (!compareValue(this.systemAllowlistOrigin, this.systemAllowlist)) {
                observables.push(this.systemInfoService.updateSystemAllowlist(this.systemAllowlist));
            }
            forkJoin(observables).subscribe(result => {
                this.onGoing = false;
                if (!isEmpty(changes)) {
                    // API should return the updated configurations here
                    // Unfortunately API does not do that
                    // To refresh the view, we can clone the original data copy
                    // or force refresh by calling service.
                    // HERE we choose force way
                    this.retrieveConfig();
                    if ('read_only' in changes) {
                        this.readOnlyChange.emit(changes['read_only']);
                    }

                    this.reloadSystemConfig.emit();
                }
                if (!compareValue(this.systemAllowlistOrigin, this.systemAllowlist)) {
                    this.systemAllowlistOrigin = clone(this.systemAllowlist);
                }
                this.errorHandler.info('CONFIG.SAVE_SUCCESS');
            }, error => {
                this.onGoing = false;
                this.errorHandler.error(error);
            });
        } else {
            // Inprop situation, should not come here
            console.error('Save abort because nothing changed');
        }
    }

    retrieveConfig(): void {
        this.onGoing = true;
        this.configService.getConfiguration()
            .subscribe((configurations: Configuration) => {
                this.onGoing = false;
                // Add two password fields
                configurations.email_password = new StringValueItem(fakePass, true);
                this.config = configurations;
                // Keep the original copy of the data
                this.originalConfig = clone(configurations);
            }, error => {
                this.onGoing = false;
                this.errorHandler.error(error);
            });
    }

    reset(changes: any): void {
        if (!isEmpty(changes)) {
            for (let prop in changes) {
                if (this.originalConfig[prop]) {
                    this.config[prop] = clone(this.originalConfig[prop]);
                }
            }
        } else {
            // force reset
            this.retrieveConfig();
        }
    }

    confirmCancel(ack: ConfirmationAcknowledgement): void {
        if (ack && ack.source === ConfirmationTargets.CONFIG &&
            ack.state === ConfirmationState.CONFIRMED) {
            let changes = this.getChanges();
            this.reset(changes);
            if (!compareValue(this.systemAllowlistOrigin, this.systemAllowlist)) {
                this.systemAllowlist = clone(this.systemAllowlistOrigin);
            }
        }
    }


    public get inProgress(): boolean {
        return this.onGoing;
    }

    /**
     *
     * Discard current changes if have and reset
     *
     * @memberOf ConfigurationComponent
     */
    public cancel(): void {
        let changes = this.getChanges();
        if (!isEmpty(changes) || !compareValue(this.systemAllowlistOrigin, this.systemAllowlist)) {
            let msg = new ConfirmationMessage(
                'CONFIG.CONFIRM_TITLE',
                'CONFIG.CONFIRM_SUMMARY',
                '',
                {},
                ConfirmationTargets.CONFIG
            );
            this.confirmationDlg.open(msg);
        } else {
            // Invalid situation, should not come here
            console.error('Nothing changed');
        }
    }

    constructor(
                private configService: ConfigurationService,
                private errorHandler: ErrorHandler,
                private systemInfoService: SystemInfoService) {
        this.downloadLink = CURRENT_BASE_HREF + "/systeminfo/getcert";
    }

    ngOnInit() {
        this.getSystemAllowlist();
        this.getSystemInfo();
    }

    getSystemInfo() {
        this.systemInfoService.getSystemInfo()
            .subscribe(systemInfo => this.systemInfo = systemInfo
                , error => this.errorHandler.error(error));
    }
    getSystemAllowlist() {
        this.onGoing = true;
        this.systemInfoService.getSystemAllowlist()
            .subscribe((systemAllowlist) => {
                    this.onGoing = false;
                    if (!systemAllowlist.items) {
                        systemAllowlist.items = [];
                    }
                    if (!systemAllowlist.expires_at) {
                        systemAllowlist.expires_at = null;
                    }
                    this.systemAllowlist = systemAllowlist;
                    this.systemAllowlistOrigin = clone(systemAllowlist);
                }, error => {
                    this.onGoing = false;
                    console.error('An error occurred during getting systemAllowlist');
                    // this.errorHandler.error(error);
                }
            );
    }
    deleteItem(index: number) {
        this.systemAllowlist.items.splice(index, 1);
    }

    addToSystemAllowlist() {
        // remove duplication and add to systemAllowlist
        let map = {};
        this.systemAllowlist.items.forEach(item => {
            map[item.cve_id] = true;
        });
        this.cveIds.split(/[\n,]+/).forEach(id => {
            let cveObj: any = {};
            cveObj.cve_id = id.trim();
            if (!map[cveObj.cve_id]) {
                map[cveObj.cve_id] = true;
                this.systemAllowlist.items.push(cveObj);
            }
        });
        // clear modal and close modal
        this.cveIds = null;
        this.showAddModal = false;
    }

    get hasAllowlistChanged(): boolean {
        return !compareValue(this.systemAllowlistOrigin, this.systemAllowlist);
    }

    isDisabled(): boolean {
        let str = this.cveIds;
        return !(str && str.trim());
    }

    get expiresDate() {
        if (this.systemAllowlist && this.systemAllowlist.expires_at) {
            return new Date(this.systemAllowlist.expires_at * ONE_THOUSAND);
        }
        return null;
    }

    set expiresDate(date) {
        if (this.systemAllowlist && date) {
            this.systemAllowlist.expires_at = Math.floor(date.getTime() / ONE_THOUSAND);
        }
    }

    get neverExpires(): boolean {
        return !(this.systemAllowlist && this.systemAllowlist.expires_at);
    }

    set neverExpires(flag) {
        if (flag) {
            this.systemAllowlist.expires_at = null;
            this.systemInfoService.resetDateInput(this.dateInput);
        } else {
            this.systemAllowlist.expires_at = Math.floor(new Date().getTime() / ONE_THOUSAND);
        }
    }

    get hasExpired(): boolean {
        if (this.systemAllowlistOrigin && this.systemAllowlistOrigin.expires_at) {
            return new Date().getTime() > this.systemAllowlistOrigin.expires_at * ONE_THOUSAND;
        }
        return false;
    }

    goToDetail(cveId) {
        window.open(CVE_DETAIL_PRE_URL + `${cveId}`, TARGET_BLANK);
    }
}
