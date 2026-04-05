export interface LatencyTestURL {
    name: string;
    url: string;
}

export const DEFAULT_LATENCY_TEST_URLS: LatencyTestURL[] = [
    { name: "GitHub", url: "https://www.github.com" },
    { name: "Google", url: "https://www.google.com" },
    { name: "Cloudflare", url: "https://www.cloudflare.com" }
];

export const LATENCY_TEST_TIMEOUT = 5000;