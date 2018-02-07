import { Injectable } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera';
@Injectable()
export class ImageProvider {
  cameraImage: string
  cameraOptions: CameraOptions = {
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
    destinationType: this.camera.DestinationType.DATA_URL,
    allowEdit: true,
    quality: 100,
    targetWidth: 170,
    targetHeight: 170,
    encodingType: this.camera.EncodingType.JPEG,
    correctOrientation: true
  };
  constructor(private camera: Camera) {

  }

  selectImage(sourceType: string): Promise<any> {
    if (sourceType === 'lib') {
      this.cameraOptions.sourceType = this.camera.PictureSourceType.PHOTOLIBRARY;
    }
    if (sourceType === 'cam') {
      this.cameraOptions.sourceType = this.camera.PictureSourceType.CAMERA;
    }
    return new Promise(resolve => {
      this.camera.getPicture(this.cameraOptions)
        .then((data) => {
          if (data) {
            this.cameraImage = "data:image/jpeg;base64," + data;
            resolve(this.cameraImage);
          }
        }).catch(error => {
          console.log(error);
        });
    });
  }
}
