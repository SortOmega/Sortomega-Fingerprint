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
  public fingerSampleImage: string = '';

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

    let base64Data = this.#fingerSamplesAcquired
      .samples[0] as unknown as string;
    this.fingerSampleImage = this.fixFormatBase64(base64Data);
    console.log(this.fingerSampleImage);
    //Convertir cadena de datos en Blob

    // let bmpData = this.#fingerSamplesAcquired.samples[0].Data;

    // //Paso 2: Convertir la cadena de datos BMP a Blob
    // let byteCharacters = atob(bmpData);
    // let byteNumbers = new Array(byteCharacters.length);
    // for (let i = 0; i < byteCharacters.length; i++) {
    //   byteNumbers[i] = byteCharacters.charCodeAt(i);
    // }
    // let byteArray = new Uint8Array(byteNumbers);
    // let blob = new Blob([byteArray], { type: 'image/bmp' });

    // // Paso 3: Crear un objeto Image y convertir el Blob a una URL de datos
    // let img = new Image();
    // let reader = new FileReader();
    // reader.onload = (event) => {
    //   // Paso 4: Asignar la URL de datos al atributo src de la etiqueta img
    //   this.fingerSampleImage = event.target!.result as string;
    //   img.src = event.target!.result as string;
    // };
    // reader.readAsDataURL(blob);
    // document.body.appendChild(img);
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
          SampleFormat.PngImage,
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

  public get acquiredFingerPrintSample() {
    return this.#fingerSamplesAcquired;
  }

  public fixFormatBase64(imgData: string) {
    let strg = imgData;
    strg = strg.replace(/_/g, '/');
    strg = strg.replace(/-/g, '+');
    return strg;
  }
  //#endregion
}
