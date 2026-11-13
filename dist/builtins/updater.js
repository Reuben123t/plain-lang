"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updaterBuiltins = exports.GITHUB_REPO = exports.CURRENT_PLAIN_VERSION = void 0;
exports.fetchLatestRelease = fetchLatestRelease;
exports.isVersionNewer = isVersionNewer;
exports.promptUpdateIfAvailable = promptUpdateIfAvailable;
exports.performUpdate = performUpdate;
const https = __importStar(require("https"));
exports.CURRENT_PLAIN_VERSION = "1.2.0";
exports.GITHUB_REPO = "Reuben123t/plain-lang";
async function fetchLatestRelease() {
    return new Promise((resolve) => {
        const url = `https://api.github.com/repos/${exports.GITHUB_REPO}/releases/latest`;
        const req = https.get(url, {
            headers: {
                "User-Agent": "plain-language-updater/1.2.0"
            },
            timeout: 4000
        }, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                try {
                    if (res.statusCode === 200) {
                        const release = JSON.parse(data);
                        const tagName = release.tag_name || "";
                        const latest = tagName.replace(/^v/, "").trim();
                        const updateAvailable = isVersionNewer(latest, exports.CURRENT_PLAIN_VERSION);
                        let downloadUrl = release.html_url;
                        if (Array.isArray(release.assets)) {
                            const exeAsset = release.assets.find((a) => a.name.endsWith(".exe") || a.name.endsWith(".zip"));
                            if (exeAsset)
                                downloadUrl = exeAsset.browser_download_url;
                        }
                        resolve({
                            currentVersion: exports.CURRENT_PLAIN_VERSION,
                            latestVersion: latest,
                            updateAvailable,
                            releaseUrl: release.html_url,
                            downloadUrl,
                            publishedAt: release.published_at
                        });
                        return;
                    }
                }
                catch {
                    // ignore parse errors
                }
                resolve({
                    currentVersion: exports.CURRENT_PLAIN_VERSION,
                    latestVersion: exports.CURRENT_PLAIN_VERSION,
                    updateAvailable: false,
                    releaseUrl: `https://github.com/${exports.GITHUB_REPO}`
                });
            });
        });
        req.on("error", () => {
            resolve({
                currentVersion: exports.CURRENT_PLAIN_VERSION,
                latestVersion: exports.CURRENT_PLAIN_VERSION,
                updateAvailable: false,
                releaseUrl: `https://github.com/${exports.GITHUB_REPO}`
            });
        });
        req.on("timeout", () => {
            req.destroy();
            resolve({
                currentVersion: exports.CURRENT_PLAIN_VERSION,
                latestVersion: exports.CURRENT_PLAIN_VERSION,
                updateAvailable: false,
                releaseUrl: `https://github.com/${exports.GITHUB_REPO}`
            });
        });
    });
}
function isVersionNewer(remote, current) {
    const rParts = remote.split(".").map((n) => parseInt(n, 10) || 0);
    const cParts = current.split(".").map((n) => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(rParts.length, cParts.length); i++) {
        const r = rParts[i] ?? 0;
        const c = cParts[i] ?? 0;
        if (r > c)
            return true;
        if (r < c)
            return false;
    }
    return false;
}
async function promptUpdateIfAvailable() {
    try {
        const info = await fetchLatestRelease();
        if (info.updateAvailable) {
            console.log("");
            console.log("┌──────────────────────────────────────────────────────────────┐");
            console.log(`│  🔔 NEW PLAIN UPDATE AVAILABLE: v${info.latestVersion} (Current: v${info.currentVersion})  │`);
            console.log("│  Run 'plain update' or visit:                                │");
            console.log(`│  ${info.releaseUrl.padEnd(60)}│`);
            console.log("└──────────────────────────────────────────────────────────────┘");
            console.log("");
        }
    }
    catch {
        // Non-blocking check
    }
}
async function performUpdate() {
    console.log(`Checking for updates from https://github.com/${exports.GITHUB_REPO}...`);
    const info = await fetchLatestRelease();
    if (!info.updateAvailable) {
        console.log(`PLAIN is already up-to-date! Current version: v${exports.CURRENT_PLAIN_VERSION}`);
        return;
    }
    console.log(`Found newer version: v${info.latestVersion} (currently v${exports.CURRENT_PLAIN_VERSION})`);
    console.log(`Download release: ${info.downloadUrl || info.releaseUrl}`);
    console.log("");
    console.log("To update via npm:       npm install -g plain-lang@latest");
    console.log("To download executable:  Visit https://github.com/" + exports.GITHUB_REPO + "/releases/latest");
}
exports.updaterBuiltins = {
    check_for_updates: async () => {
        const info = await fetchLatestRelease();
        return {
            current: info.currentVersion,
            latest: info.latestVersion,
            update_available: info.updateAvailable,
            url: info.releaseUrl
        };
    },
    plain_version: () => exports.CURRENT_PLAIN_VERSION,
    author_name: () => "Reuben",
    update_software: async () => {
        await performUpdate();
        return true;
    }
};
//# sourceMappingURL=updater.js.map