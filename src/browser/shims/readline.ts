export function createInterface(): { question: (_prompt: string, callback: (answer: string) => void) => void; close: () => void } {
  return { question: (_prompt, callback) => callback(""), close: () => undefined };
}
