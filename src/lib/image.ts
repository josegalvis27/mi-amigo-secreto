export function loadImage(src: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo leer la foto"));
    img.src = typeof src === "string" ? src : URL.createObjectURL(src);
  });
}

/** Recorta un cuadrado de la imagen (en píxeles de la imagen) y lo comprime. */
export function cropToDataUrl(img: HTMLImageElement, sx: number, sy: number, side: number, size = 400, quality = 0.8) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", quality);
}

/** Congela el cuadro actual de la cámara (en espejo si es la frontal, como se ve en pantalla). */
export function snapshot(video: HTMLVideoElement, mirror: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d")!;
  if (mirror) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0);
  return loadImage(canvas.toDataURL("image/jpeg", 0.92));
}
