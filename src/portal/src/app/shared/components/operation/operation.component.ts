import {Component, OnInit, OnDestroy, HostListener} from '@angular/core';
import {OperationService} from "./operation.service";
import {Subscription} from "rxjs";
import {OperateInfo, OperationState} from "./operate";
import {SlideInOutAnimation} from "../../_animations/slide-in-out.animation";
import {TranslateService} from "@ngx-translate/core";


@Component({
  selector: 'hbr-operation-model',
  templateUrl: './operation.component.html',
  styleUrls: ['./operation.component.css'],
  animations: [SlideInOutAnimation],
})
export class OperationComponent implements OnInit, OnDestroy {
  batchInfoSubscription: Subscription;
  resultLists: OperateInfo[] = [];
  animationState = "out";
  private _newMessageCount: number = 0;
  private _timeoutInterval;

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHander(event) {
    // storage to localStorage
    let timp = new Date().getTime();
    localStorage.setItem('operaion', JSON.stringify({timp: timp,  data: this.resultLists}));
    localStorage.setItem('newMessageCount', this._newMessageCount.toString());
  }

  constructor(
    private operationService: OperationService,
    private translate: TranslateService) {

    this.batchInfoSubscription = operationService.operationInfo$.subscribe(data => {
      if (this.animationState === 'out') {
        this._newMessageCount += 1;
      }
      if (data) {
        if (this.resultLists.length >= 50) {
          this.resultLists.splice(49, this.resultLists.length - 49);
        }
        this.resultLists.unshift(data);
      }
    });
  }

  getNewMessageCountStr(): string {
    if (this._newMessageCount) {
      if (this._newMessageCount > 50) {
        return 50 + '+';
      }
      return this._newMessageCount.toString();
    }
    return '';
  }
  resetNewMessageCount() {
    this._newMessageCount = 0;
  }
  mouseover() {
    if (this._timeoutInterval) {
      clearInterval(this._timeoutInterval);
      this._timeoutInterval = null;
    }
  }
  mouseleave() {
    if (!this._timeoutInterval) {
      this._timeoutInterval = setTimeout(() => {
          this.animationState = 'out';
      }, 5000);
    }
  }
  public get runningLists(): OperateInfo[] {
    let runningList: OperateInfo[] = [];
    this.resultLists.forEach(data => {
      if (data.state === 'progressing') {
        runningList.push(data);
      }
    });
    return runningList;
  }

  public get failLists(): OperateInfo[] {
    let failedList: OperateInfo[] = [];
    this.resultLists.forEach(data => {
      if (data.state === 'failure') {
        failedList.push(data);
      }
    });
    return failedList;
  }

  ngOnInit() {
    this._newMessageCount = +localStorage.getItem('newMessageCount');
    let requestCookie = localStorage.getItem('operaion');
    if (requestCookie) {
      let operInfors: any = JSON.parse(requestCookie);
      if (operInfors) {
        if ((new Date().getTime() - operInfors.timp) > 1000 * 60 * 60 * 24) {
          localStorage.removeItem('operaion');
        } else {
          if (operInfors.data) {
            operInfors.data.forEach(operInfo => {
              if (operInfo.state === OperationState.progressing) {
                operInfo.state = OperationState.interrupt;
                operInfo.data.errorInf = 'operation been interrupted';
              }
            });
            this.resultLists = operInfors.data;
          }
        }
      }

    }
  }
  ngOnDestroy(): void {
    if (this.batchInfoSubscription) {
      this.batchInfoSubscription.unsubscribe();
    }
    if (this._timeoutInterval) {
      clearInterval(this._timeoutInterval);
      this._timeoutInterval = null;
    }
  }

  toggleTitle(errorSpan: any) {
    errorSpan.style.display = (errorSpan.style.display === 'block') ? 'none' : 'block';
  }

  slideOut(): void {
    this.animationState = this.animationState === 'out' ? 'in' : 'out';
    if (this.animationState === 'in') {
      this.resetNewMessageCount();
      // refresh when open
      this.TabEvent();
    }
  }

  openSlide(): void {
    this.animationState = 'in';
    this.resetNewMessageCount();
  }


  TabEvent(): void {
    let timp: any;
    this.resultLists.forEach(data => {
       timp = new Date().getTime() - +data.timeStamp;
       data.timeDiff = this.calculateTime(timp);
    });
  }

  calculateTime(timp: number) {
    let dist = Math.floor(timp / 1000 / 60);  // change to minute;
    if (dist > 0 && dist < 60) {
      return Math.floor(dist) + ' minute(s) ago';
    } else if (dist >= 60 && Math.floor(dist / 60) < 24) {
      return Math.floor(dist / 60) + ' hour(s) ago';
    } else if (Math.floor(dist / 60) >= 24)  {
      return Math.floor(dist / 60 / 24) + ' day(s) ago';
    } else {
      return 'less than 1 minute';
    }

  }

  /*calculateTime(timp: number) {
    let dist = Math.floor(timp / 1000 / 60);  // change to minute;
    if (dist > 0 && dist < 60) {
       return this.translateTime('OPERATION.MINUTE_AGO', Math.floor(dist));
    }else if (dist > 60 && Math.floor(dist / 60) < 24) {
      return this.translateTime('OPERATION.HOUR_AGO', Math.floor(dist / 60));
    } else if (Math.floor(dist / 60) >= 24 && Math.floor(dist / 60) <= 48)  {
      return this.translateTime('OPERATION.DAY_AGO', Math.floor(dist / 60 / 24));
    } else {
      return this.translateTime('OPERATION.SECOND_AGO');
    }
  }*/

  translateTime(tim: string, param?: number) {
    this.translate.get(tim, { 'param': param }).subscribe((res: string) => {
      return res;
    });
  }
}
