import * as https from "https";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export const CURRENT_PLAIN_VERSION = "1.1.0";
export const GITHUB_REPO = "Reuben123t/plain-lang";

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  releaseUrl: string;
  downloadUrl?: string;
  publishedAt?: string;
}

export async function fetchLatestRelease(): Promise<UpdateInfo> {
  return new Promise((resolve) => {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": "plain-language-updater/1.1.0"
        },
        timeout: 4000
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            if (res.statusCode === 200) {
              const release = JSON.parse(data);
              const tagName: string = release.tag_name || "";
              const latest = tagName.replace(/^v/, "").trim();
              const updateAvailable = isVersionNewer(latest, CURRENT_PLAIN_VERSION);

              let downloadUrl = release.html_url;
              if (Array.isArray(release.assets)) {
                const exeAsset = release.assets.find((a: any) =>
                  a.name.endsWith(".exe") || a.name.endsWith(".zip")
                );
                if (exeAsset) downloadUrl = exeAsset.browser_download_url;
              }

              resolve({
                currentVersion: CURRENT_PLAIN_VERSION,
                latestVersion: latest,
                updateAvailable,
                releaseUrl: release.html_url,
                downloadUrl,
                publishedAt: release.published_at
              });
              return;
            }
          } catch {
            // ignore parse errors
          }
          resolve({
            currentVersion: CURRENT_PLAIN_VERSION,
            latestVersion: CURRENT_PLAIN_VERSION,
            updateAvailable: false,
            releaseUrl: `https://github.com/${GITHUB_REPO}`
          });
        });
      }
    );

    req.on("error", () => {
      resolve({
        currentVersion: CURRENT_PLAIN_VERSION,
        latestVersion: CURRENT_PLAIN_VERSION,
        updateAvailable: false,
        releaseUrl: `https://github.com/${GITHUB_REPO}`
      });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({
        currentVersion: CURRENT_PLAIN_VERSION,
        latestVersion: CURRENT_PLAIN_VERSION,
        updateAvailable: false,
        releaseUrl: `https://github.com/${GITHUB_REPO}`
      });
    });
  });
}

export function isVersionNewer(remote: string, current: string): boolean {
  const rParts = remote.split(".").map((n) => parseInt(n, 10) || 0);
  const cParts = current.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(rParts.length, cParts.length); i++) {
    const r = rParts[i] ?? 0;
    const c = cParts[i] ?? 0;
    if (r > c) return true;
    if (r < c) return false;
  }
  return false;
}

export async function promptUpdateIfAvailable(): Promise<void> {
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
  } catch {
    // Non-blocking check
  }
}

export async function performUpdate(): Promise<void> {
  console.log(`Checking for updates from https://github.com/${GITHUB_REPO}...`);
  const info = await fetchLatestRelease();
  if (!info.updateAvailable) {
    console.log(`PLAIN is already up-to-date! Current version: v${CURRENT_PLAIN_VERSION}`);
    return;
  }

  console.log(`Found newer version: v${info.latestVersion} (currently v${CURRENT_PLAIN_VERSION})`);
  console.log(`Download release: ${info.downloadUrl || info.releaseUrl}`);
  console.log("");
  console.log("To update via npm:       npm install -g plain-lang@latest");
  console.log("To download executable:  Visit https://github.com/" + GITHUB_REPO + "/releases/latest");
}

export const updaterBuiltins = {
  check_for_updates: async () => {
    const info = await fetchLatestRelease();
    return {
      current: info.currentVersion,
      latest: info.latestVersion,
      update_available: info.updateAvailable,
      url: info.releaseUrl
    };
  },
  plain_version: () => CURRENT_PLAIN_VERSION,
  author_name: () => "Reuben",
  update_software: async () => {
    await performUpdate();
    return true;
  }
};
