import { PlainValue, PlainFunction } from "../runtime/values";
export interface WebContext {
    invokeFunction?: (fn: PlainFunction, args: PlainValue[]) => Promise<PlainValue>;
}
export declare function createWebBuiltins(context?: WebContext): {
    start_server: (portVal: PlainValue, handlerVal: PlainValue) => Promise<string>;
    stop_server: () => string;
    serve_static_files: (portVal: PlainValue, folderVal: PlainValue) => Promise<string>;
    http_get: (urlVal: PlainValue, headersVal?: PlainValue) => Promise<string>;
    http_post: (urlVal: PlainValue, bodyVal: PlainValue, headersVal?: PlainValue) => Promise<string>;
    html_page: (titleVal: PlainValue, bodyVal: PlainValue) => string;
    html_tag: (tagVal: PlainValue, contentVal?: PlainValue, attrsVal?: PlainValue) => string;
    html_table: (headersVal: PlainValue, rowsVal: PlainValue) => string;
    render_template: (templateVal: PlainValue, dataVal: PlainValue) => string;
    parse_query_string: (queryVal: PlainValue) => string[];
    send_webhook: (urlVal: PlainValue, payloadVal: PlainValue) => Promise<string>;
};
//# sourceMappingURL=web.d.ts.map