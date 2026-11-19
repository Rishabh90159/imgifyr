import type { Finding } from "./check";
import { lumaStats, sharpness, type Pixels, type Rect } from "./metrics";

/**
 * Live photo practice: judges one camera frame against the things live-capture forms reject most often (dark or
 * back-lit face, uneven light, busy background, blur, face outside the marked area). `box` is the on-screen face
 * box as fractions of the frame.
 */

/** A portrait face box, centred, sized to the frame's shape: 80% of the height, 3.5 : 4.5 wide. */
export function faceBox(frameWidth: number, frameHeight: number): Rect {
  const height = 0.8;
  const width = Math.min(0.9, height * (frameHeight / frameWidth) * (3.5 / 4.5));
  return { x: (1 - width) / 2, y: 0.1, width, height };
}

/** A detected face, as fractions of the frame; null when a detector ran and found none. Undefined: no detector. */
export type FaceFound = Rect | null | undefined;

export function assessFrame(px: Pixels, box: Rect, face: FaceFound): Finding[] {
  const out: Finding[] = [];
  const b = { x: box.x * px.width, y: box.y * px.height, width: box.width * px.width, height: box.height * px.height };
  // The face sits in the upper-middle of the box; the background is everything left and right of the box.
  const inner = { x: b.x + b.width * 0.2, y: b.y + b.height * 0.12, width: b.width * 0.6, height: b.height * 0.5 };
  const left = lumaStats(px, [{ ...inner, width: inner.width / 2 }]).mean;
  const right = lumaStats(px, [{ ...inner, x: inner.x + inner.width / 2, width: inner.width / 2 }]).mean;
  const faceLight = lumaStats(px, [inner]).mean;
  const sides: Rect[] = [
    { x: 0, y: 0, width: b.x, height: px.height * 0.7 },
    { x: b.x + b.width, y: 0, width: px.width - b.x - b.width, height: px.height * 0.7 },
  ].filter((r) => r.width >= 2);
  const bg = sides.length ? lumaStats(px, sides) : { mean: faceLight, std: 0 };

  if (bg.mean - faceLight > 45 && bg.mean > 150) {
    out.push({ id: "backlight", label: "Light", verdict: "warn", detail: "The light is behind you, so your face is dark. Turn to face the window or lamp." });
  } else if (faceLight < 80) {
    out.push({ id: "light", label: "Light", verdict: "warn", detail: "Too dark. Move to a brighter place or face a window." });
  } else if (faceLight > 230) {
    out.push({ id: "light", label: "Light", verdict: "warn", detail: "Too bright: your face is washed out. Move away from direct light." });
  } else out.push({ id: "light", label: "Light", verdict: "pass", detail: "Good light on your face." });

  const imbalance = Math.abs(left - right) / Math.max(1, Math.max(left, right));
  if (imbalance > 0.3) out.push({ id: "even", label: "Even light", verdict: "warn", detail: "One side of your face is in shadow. Face the light directly." });
  else out.push({ id: "even", label: "Even light", verdict: "pass", detail: "Light is even on both sides." });

  if (bg.std > 45) out.push({ id: "background", label: "Background", verdict: "warn", detail: "The background is busy. Sit in front of a plain wall." });
  else out.push({ id: "background", label: "Background", verdict: "pass", detail: "Plain background." });

  if (sharpness(px, inner) < 6) out.push({ id: "sharp", label: "Sharpness", verdict: "warn", detail: "The picture looks blurry. Hold still and wipe the camera lens." });
  else out.push({ id: "sharp", label: "Sharpness", verdict: "pass", detail: "Sharp." });

  if (face === null) {
    out.push({ id: "face", label: "Face in the box", verdict: "warn", detail: "No face found. Look straight at the camera, inside the box." });
  } else if (face) {
    const cx = face.x + face.width / 2;
    const cy = face.y + face.height / 2;
    const inside = cx > box.x && cx < box.x + box.width && cy > box.y && cy < box.y + box.height * 0.7;
    const share = face.width / box.width;
    if (!inside) out.push({ id: "face", label: "Face in the box", verdict: "warn", detail: "Move so your face is inside the box." });
    else if (share < 0.35) out.push({ id: "face", label: "Face in the box", verdict: "warn", detail: "Too far: move a little closer." });
    else if (share > 0.85) out.push({ id: "face", label: "Face in the box", verdict: "warn", detail: "Too close: move back a little." });
    else out.push({ id: "face", label: "Face in the box", verdict: "pass", detail: "Your face is inside the box." });
  }
  return out;
}
