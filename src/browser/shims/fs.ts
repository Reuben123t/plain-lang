export function existsSync(): boolean { return false; }
export function readFileSync(): never { throw new Error("The browser runtime cannot read local files."); }
export function statSync(): never { throw new Error("The browser runtime cannot inspect local files."); }
