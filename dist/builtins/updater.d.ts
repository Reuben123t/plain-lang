export declare const CURRENT_PLAIN_VERSION = "1.2.0";
export declare const GITHUB_REPO = "Reuben123t/plain-lang";
export interface UpdateInfo {
    currentVersion: string;
    latestVersion: string;
    updateAvailable: boolean;
    releaseUrl: string;
    downloadUrl?: string;
    publishedAt?: string;
}
export declare function fetchLatestRelease(): Promise<UpdateInfo>;
export declare function isVersionNewer(remote: string, current: string): boolean;
export declare function promptUpdateIfAvailable(): Promise<void>;
export declare function performUpdate(): Promise<void>;
export declare const updaterBuiltins: {
    check_for_updates: () => Promise<{
        current: string;
        latest: string;
        update_available: boolean;
        url: string;
    }>;
    plain_version: () => string;
    author_name: () => string;
    update_software: () => Promise<boolean>;
};
//# sourceMappingURL=updater.d.ts.map