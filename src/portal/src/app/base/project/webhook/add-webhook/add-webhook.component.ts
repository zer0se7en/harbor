import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter,
} from "@angular/core";
import { AddWebhookFormComponent } from "../add-webhook-form/add-webhook-form.component";
import { WebhookPolicy } from "../../../../../../ng-swagger-gen/models/webhook-policy";

@Component({
  selector: 'add-webhook',
  templateUrl: './add-webhook.component.html',
  styleUrls: ['./add-webhook.component.scss']
})
export class AddWebhookComponent implements OnInit {
  isEdit: boolean;
  isOpen: boolean = false;
  closable: boolean = false;
  staticBackdrop: boolean = true;

  @Input() projectId: number;
   webhook: WebhookPolicy;
  @Input()
  metadata: any;
  @ViewChild(AddWebhookFormComponent)
  addWebhookFormComponent: AddWebhookFormComponent;
  @Output() notify = new EventEmitter<WebhookPolicy>();

  constructor() { }

  ngOnInit() {
  }

  openAddWebhookModal() {
    this.isOpen = true;
  }

  onCancel() {
    this.isOpen = false;
  }
  notifySuccess() {
    this.isOpen = false;
    this.notify.emit();
  }
  closeModal() {
    this.isOpen = false;
  }
}
