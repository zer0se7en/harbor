import {Injectable} from "@angular/core";
import {Scanner} from "./scanner";
import { forkJoin, Observable, throwError as observableThrowError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { ScannerMetadata } from "./scanner-metadata";
import { CURRENT_BASE_HREF } from "../../../../shared/units/utils";

export const SCANNERS_DOC: string = "https://goharbor.io/blog/harbor-1.10-release/#vulnerability-scanning-with-pluggable-scanners";

@Injectable({
    providedIn: 'root',
})
export class ConfigScannerService {

    constructor( private http: HttpClient) {}
    getScannersByName(name: string): Observable<Scanner[]> {
        name = encodeURIComponent(name);
            return this.http.get(`${ CURRENT_BASE_HREF }/scanners?ex_name=${name}`)
                .pipe(catchError(error => observableThrowError(error)))
                .pipe(map(response => response as Scanner[]));
    }
    getScannersByEndpointUrl(endpointUrl: string): Observable<Scanner[]> {
        endpointUrl = encodeURIComponent(endpointUrl);
        return this.http.get(`${ CURRENT_BASE_HREF }/scanners?ex_url=${endpointUrl}`)
            .pipe(catchError(error => observableThrowError(error)))
            .pipe(map(response => response as Scanner[]));
    }
    testEndpointUrl(testValue: any): Observable<any> {
        return this.http.post(`${ CURRENT_BASE_HREF }/scanners/ping`, testValue)
            .pipe(catchError(error => observableThrowError(error)));
    }
    addScanner(scanner: Scanner): Observable<any> {
        return this.http.post(CURRENT_BASE_HREF + '/scanners', scanner )
                .pipe(catchError(error => observableThrowError(error)));
    }
    getScanners(): Observable<Scanner[]> {
        return this.http.get(CURRENT_BASE_HREF + '/scanners')
            .pipe(map(response => response as Scanner[]))
            .pipe(catchError(error => observableThrowError(error)));
    }
    updateScanner(scanner: Scanner): Observable<any> {
        return this.http.put(`${ CURRENT_BASE_HREF }/scanners/${scanner.uuid}`, scanner )
            .pipe(catchError(error => observableThrowError(error)));
    }
    deleteScanner(scanner: Scanner): Observable<any> {
        return this.http.delete(`${ CURRENT_BASE_HREF }/scanners/${scanner.uuid}`)
            .pipe(catchError(error => observableThrowError(error)));
    }
    deleteScanners(scanners: Scanner[]): Observable<any> {
        let observableLists: any[] = [];
        if (scanners && scanners.length > 0) {
            scanners.forEach(scanner => {
                observableLists.push(this.deleteScanner(scanner));
            });
            return forkJoin(...observableLists);
        }
    }
    getProjectScanner(projectId: number): Observable<Scanner>  {
        return this.http.get(`${ CURRENT_BASE_HREF }/projects/${projectId}/scanner`)
            .pipe(map(response => response as Scanner))
            .pipe(catchError(error => observableThrowError(error)));
    }
    updateProjectScanner(projectId: number , uid: string): Observable<any>  {
        return this.http.put(`${ CURRENT_BASE_HREF }/projects/${projectId}/scanner` , {uuid: uid})
            .pipe(catchError(error => observableThrowError(error)));
    }
    getScannerMetadata(uid: string): Observable<ScannerMetadata> {
        return this.http.get(`${ CURRENT_BASE_HREF }/scanners/${uid}/metadata`)
            .pipe(map(response => response as ScannerMetadata))
            .pipe(catchError(error => observableThrowError(error)));
    }
    setAsDefault(uid: string): Observable<any> {
        return this.http.patch(`${ CURRENT_BASE_HREF }/scanners/${uid}`, {is_default: true} )
            .pipe(catchError(error => observableThrowError(error)));
    }
    getProjectScanners(projectId: number) {
        return this.http.get(`${ CURRENT_BASE_HREF }/projects/${projectId}/scanner/candidates`)
            .pipe(map(response => response as Scanner[]))
            .pipe(catchError(error => observableThrowError(error)));
    }
}
