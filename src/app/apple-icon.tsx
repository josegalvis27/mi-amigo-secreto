import { appIcon } from "@/lib/server/giftMark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS redondea las esquinas por su cuenta
export default function AppleIcon() {
  return appIcon(180);
}
