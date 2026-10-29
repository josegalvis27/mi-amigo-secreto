import { appIcon } from "@/lib/server/giftMark";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return appIcon(64, { rounded: true });
}
