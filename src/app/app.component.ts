import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

import {
  FingerprintReader,
  SampleFormat,
  DeviceConnected,
  DeviceDisconnected,
  SamplesAcquired,
  AcquisitionStarted,
  AcquisitionStopped,
  DeviceInfo,
} from '@digitalpersona/devices';

import './core/modules/WebSdk';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  //#region Components Lifecycle
  constructor() {
    this.#reader = new FingerprintReader();
  }

  public ngOnInit(): void {
    this.#reader.on('DeviceConnected', this.onDeviceConnected);
    this.#reader.on('DeviceDisconnected', this.onDeviceDisconnected);
    this.#reader.on('AcquisitionStarted', this.onAcquisitionStarted);
    this.#reader.on('AcquisitionStopped', this.onAcquisitionStopped);
    this.#reader.on('SamplesAcquired', this.onSamplesAcquired);
    this.getFingerPrintDevicesInfo();
  }

  public ngAfterViewInit(): void {}

  public ngOnDestroy(): void {
    this.#reader.off('DeviceConnected', this.onDeviceConnected);
    this.#reader.off('DeviceDisconnected', this.onDeviceDisconnected);
    this.#reader.off('AcquisitionStarted', this.onAcquisitionStarted);
    this.#reader.off('AcquisitionStopped', this.onAcquisitionStopped);
    this.#reader.off('SamplesAcquired', this.onSamplesAcquired);
  }
  //#endregion

  //#region Properties
  public title = 'Sortomega-Fingerprint';
  #reader: FingerprintReader;
  #fingerPrintDevices: DeviceInfo[] = [];
  #selectedFingerprintDevice: DeviceInfo | null = null;
  #fingerSamplesAcquired: SamplesAcquired | null = null;

  public get getSelectedFingerprintDevice() {
    return this.#selectedFingerprintDevice;
  }
  //#endregion

  //#region Fingerprint Events Definition
  private onDeviceConnected = (event: DeviceConnected) => {};
  private onDeviceDisconnected = (event: DeviceDisconnected) => {};

  private onAcquisitionStarted = (event: AcquisitionStarted) => {
    console.log('En el evento: onAdquisitionStarted');
    console.log(event);
  };
  private onAcquisitionStopped = (event: AcquisitionStopped) => {
    console.log('En el evento: onAdquisitionStopped');
    console.log(event);
  };
  private onSamplesAcquired = (event: SamplesAcquired) => {
    console.log('En el evento: onSampleAdquired');
    console.log(event);
    this.#fingerSamplesAcquired = event;
  };
  //#endregion

  //#FingerPrint Actions

  public getFingerPrintDevicesInfo() {
    this.#reader.enumerateDevices().then((result) => {
      console.log('**Showing Fingerprint Devices Available');
      this.#fingerPrintDevices.splice(0, this.#fingerPrintDevices.length);
      for (let deviceId of result) {
        this.#reader.getDeviceInfo(deviceId).then((device) => {
          if (device !== null) {
            this.#fingerPrintDevices.push(device);
            // Temporal, solo obtenemos el primer lector conectado
            this.#selectedFingerprintDevice = device;
          }
          console.log(device);
        });
      }
    });
  }

  public startFingerPrintCapture() {
    if (this.#selectedFingerprintDevice !== null)
      this.#reader
        .startAcquisition(
          SampleFormat.Raw,
          this.#selectedFingerprintDevice.DeviceID
        )
        .then((response) => {
          console.log('Se ha inicializado el Capturador!', response);
        })
        .catch((error) => console.log(error));
  }

  public finishFingerprintCapture() {
    if (this.#selectedFingerprintDevice !== null)
      this.#reader
        .stopAcquisition(this.#selectedFingerprintDevice.DeviceID)
        .then((response) => {
          if (this.#selectedFingerprintDevice !== null)
            console.log(
              `Se ha finalizado el Capturador de huellas en el dispositivo ${
                this.#selectedFingerprintDevice.DeviceID
              } !`,
              response
            );
        })
        .catch((error) => console.log(error));
  }

  //#endregion
}
