import { PlainValue } from "../runtime/values";
export declare const automationBuiltins: {
    run_command: (cmdVal: PlainValue) => string;
    walk_directory: (dirVal?: PlainValue) => string[];
    find_files: (dirVal: PlainValue, patternVal: PlainValue) => string[];
    copy_file: (srcVal: PlainValue, destVal: PlainValue) => boolean;
    move_file: (srcVal: PlainValue, destVal: PlainValue) => boolean;
    batch_rename: (dirVal: PlainValue, findVal: PlainValue, replaceVal: PlainValue) => number;
    batch_delete: (dirVal: PlainValue, patternVal: PlainValue) => number;
    log_info: (msgVal: PlainValue) => void;
    log_warn: (msgVal: PlainValue) => void;
    log_error: (msgVal: PlainValue) => void;
    parse_env_file: (filePathVal: PlainValue) => string[];
    checksum_file: (filePathVal: PlainValue, algoVal?: PlainValue) => string;
    get_clipboard: () => string;
    set_clipboard: (textVal: PlainValue) => boolean;
    delay: (secondsVal: PlainValue) => Promise<void>;
};
//# sourceMappingURL=automation.d.ts.map