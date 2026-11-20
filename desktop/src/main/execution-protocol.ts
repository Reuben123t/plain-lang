import type { RunSnapshot } from "../shared/contracts";
export interface ChildJob {
  code: string; filename: string; baseDir: string; args: string[]; maxOutputBytes: number; maxInputBytes: number;
}
export type ParentMessage = { type: "start"; job: ChildJob } | { type: "input"; id: number; value: string };
export type ChildMessage =
  | { type: "output"; text: string }
  | { type: "clear" }
  | { type: "input"; id: number; prompt: string }
  | { type: "done"; error?: RunSnapshot["error"] };
