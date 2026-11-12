import { PlainValue } from "../runtime/values";
export declare const networkBuiltins: {
    fetch_text: (urlVal: PlainValue) => Promise<string>;
    fetch_json: (urlVal: PlainValue) => Promise<PlainValue>;
    url_encode: (textVal: PlainValue) => string;
    url_decode: (textVal: PlainValue) => string;
    is_valid_url: (urlVal: PlainValue) => boolean;
};
//# sourceMappingURL=network.d.ts.map