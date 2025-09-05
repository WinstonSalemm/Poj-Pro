// Type definitions for Lighthouse CI configuration
declare module '@lhci/cli' {
  export interface LHCI {
    ci: {
      collect: {
        startServerCommand?: string;
        startServerReadyPattern?: string;
        url: string | string[];
        numberOfRuns?: number;
        settings?: {
          emulatedFormFactor?: 'desktop' | 'mobile' | 'none';
          throttling?: {
            rttMs: number;
            throughputKbps: number;
            cpuSlowdownMultiplier: number;
            requestLatencyMs?: number;
            downloadThroughputKbps?: number;
            uploadThroughputKbps?: number;
          };
          onlyCategories?: string[];
          skipAudits?: string[];
          extraHeaders?: Record<string, string>;
        };
      };
      assert?: {
        assertions?: Record<string, string | [string, Record<string, unknown>]>;
      };
      upload?: {
        target: 'filesystem' | 'lhci' | 'temporary-public-storage' | 'filesystem';
        outputDir?: string;
        reportFilenamePattern?: string;
        token?: string;
        serverBaseUrl?: string;
        basicAuth?: {
          username: string;
          password: string;
        };
      };
    };
  }

  export interface Config {
    ci: LHCI['ci'];
  }
}
