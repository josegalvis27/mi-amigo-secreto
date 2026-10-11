export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo leer la foto"));
    img.src = URL.createObjectURL(file);
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
