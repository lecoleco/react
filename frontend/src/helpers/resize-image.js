import imageCompression from 'browser-image-compression';

export const resizeImage = (file, maxWidthOrHeight = 250) =>
  new Promise(async (resolve) => {
    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight,
      useWebWorker: true,
    };
    resolve(imageCompression(file, options));
  });
