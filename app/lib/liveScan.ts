import { SCAN_CONFIG } from "@/app/config/constants";
import {
  ApiRequestError,
  getScan,
  isFinishedStatus,
  type ScanAccessMode,
  type ScanResponse,
  type ScanResultItem,
  type ScanStatus,
} from "@/app/lib/api";
import { refreshSession } from "@/app/lib/session";

/**
 * Following one scan as it runs.
 *
 * The WebSocket is an accelerator, not a dependency. The REST endpoint answers
 * first, so a finished scan never opens a socket, and it keeps answering while
 * the socket is down: on a deployment whose ingress does not route /api/live,
 * during a restart, on a network that blocks WebSockets. Nothing the view shows
 * depends on which of the two delivered it.
 *
 * Contract: docs/Backend/Scans.md in backend-antiginx, "Live scan stream".
 */

type LiveTransport = "connecting" | "live" | "polling" | "closed";

export interface LiveScanState {
  scan: ScanResponse | null;
  transport: LiveTransport;
  /** Nothing new for longer than a scan normally stays quiet; it may never end. */
  stalled: boolean;
  /** Stopped watching after a long silence. Only a new session looks again. */
  gaveUp: boolean;
  /** The scan cannot be shown at all: gone, or not this visitor's. */
  error: ApiRequestError | null;
}

type LiveEvent =
  | { type: "snapshot"; scan: ScanResponse }
  | { type: "results"; results: ScanResultItem[] }
  | { type: "status"; status: ScanStatus; started_at: string | null; completed_at: string | null }
  | { type: "heartbeat" };

export const INITIAL_LIVE_STATE: LiveScanState = {
  scan: null,
  transport: "connecting",
  stalled: false,
  gaveUp: false,
  error: null,
};

/** Longer than the server's 20 second heartbeat, twice over. */
const SILENCE_LIMIT_MS = 50_000;
const CONNECT_TIMEOUT_MS = 5_000;
const RECONNECT_MIN_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;
/** The first reconnect after a planned close, spread so a restart does not bring everyone back at once. */
const PLANNED_RECONNECT_SPREAD_MS = 1_000;
/**
 * A connection that lasted this long was working. One that closes sooner is a
 * failure whatever code it closed with, so a server or proxy that accepts and
 * hangs up straight away meets the backoff, not a reconnect loop.
 */
const STABLE_AFTER_MS = 5_000;
/** The last results can land just after the end message; the server waits for them too. */
const FINAL_READ_DELAY_MS = 1_000;
const STALL_AFTER_MS = 120_000;
const GIVE_UP_AFTER_MS = 15 * 60_000;
/** Reads that may fail before anything has been shown: past this there is nothing to wait with. */
const FIRST_READ_ATTEMPTS = 3;

/** Close codes from the server: see the backend's live package. */
const CLOSE_FINISHED = 1000;
const CLOSE_RESTARTING = 1001;
const CLOSE_SESSION_EXPIRED = 4401;
const CLOSE_SCAN_GONE = 4404;
const CLOSE_LIFETIME = 4408;

/** Still marked as running long after anything could have been happening: most likely nobody is coming to end it. */
export function isAbandoned(scan: ScanResponse, now: number): boolean {
  return !isFinishedStatus(scan.status) && now - Date.parse(scan.started_at ?? scan.created_at) > GIVE_UP_AFTER_MS;
}

/** Merges by result id, so a result delivered twice across a reconnect shows once. */
function applyLiveEvent(scan: ScanResponse | null, event: LiveEvent): ScanResponse | null {
  switch (event.type) {
    case "snapshot":
      // The stream does not carry the site's icon; the one REST brought stays.
      return { ...event.scan, favicon: event.scan.favicon ?? scan?.favicon ?? null };
    case "results": {
      if (!scan) return scan;
      const current = scan.results ?? [];
      const known = new Set(current.map((result) => result.id));
      const fresh = event.results.filter((result) => !known.has(result.id));
      return fresh.length > 0 ? { ...scan, results: [...current, ...fresh] } : scan;
    }
    case "status":
      if (!scan) return scan;
      return { ...scan, status: event.status, started_at: event.started_at, completed_at: event.completed_at };
    default:
      return scan;
  }
}

function parseEvent(data: unknown): LiveEvent | null {
  if (typeof data !== "string") return null;
  try {
    const event = JSON.parse(data) as Partial<LiveEvent> | null;
    return event && typeof event.type === "string" ? (event as LiveEvent) : null;
  } catch {
    return null;
  }
}

function liveUrl(scanId: string, mode: ScanAccessMode): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const collection = mode === "premium" ? "scans" : "freescans";
  return `${protocol}//${window.location.host}/api/live/${collection}/${encodeURIComponent(scanId)}`;
}

/** Whether a failed read says something final about the scan; the rest is worth retrying. */
function isFinalError(error: unknown): error is ApiRequestError {
  return (
    error instanceof ApiRequestError &&
    error.status !== undefined &&
    error.status >= 400 &&
    error.status < 500 &&
    error.status !== 408 &&
    error.status !== 429
  );
}

/**
 * One scan watched by one view: the socket, the polling behind it and the
 * timers around them. Reports every change through `onChange`.
 */
export class LiveScanSession {
  private state: LiveScanState = INITIAL_LIVE_STATE;
  /** The view is gone: nothing further gets reported. */
  private stopped = false;
  /** Nothing further to do, for whatever reason. A pending await must not start anything. */
  private ended = false;
  private socket: WebSocket | null = null;
  private socketLive = false;
  private liveSince = 0;
  private failures = 0;
  private failedReads = 0;
  /** The REST read on its way. Only ever one, or an older answer could land after a newer one. */
  private reading: AbortController | null = null;

  private connectTimer: number | undefined;
  private silenceTimer: number | undefined;
  private reconnectTimer: number | undefined;
  private pollTimer: number | undefined;
  private stallTimer: number | undefined;
  private giveUpTimer: number | undefined;

  constructor(
    private readonly scanId: string,
    private readonly mode: ScanAccessMode,
    private readonly onChange: (state: LiveScanState) => void,
  ) {}

  start(): void {
    window.addEventListener("online", this.onOnline);
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    this.armStallTimers();
    void this.begin();
  }

  /** The view is gone: tears everything down without reporting anything further. */
  stop(): void {
    this.stopped = true;
    this.teardown();
  }

  private async begin(): Promise<void> {
    const open = await this.read();
    if (!open || this.ended) return;
    // Opened long after it should have ended: say so now rather than in two
    // minutes. It still gets watched, since it may be stuck in a queue.
    if (this.state.scan && isAbandoned(this.state.scan, Date.now())) this.setState({ stalled: true });
    this.connect();
    this.schedulePoll();
  }

  private fetchScan(controller: AbortController): Promise<ScanResponse> {
    this.reading = controller;
    return getScan(this.scanId, { mode: this.mode, signal: controller.signal });
  }

  /** A REST read, unless one is on its way. False once there is nothing left to wait for. */
  private async read(): Promise<boolean> {
    if (this.reading) return true;

    const controller = new AbortController();
    let scan: ScanResponse;
    try {
      scan = await this.fetchScan(controller);
    } catch (error) {
      this.reading = null;
      if (this.ended) return false;
      if (controller.signal.aborted) return true;

      this.failedReads += 1;
      // Nothing on screen to keep showing, so waiting on would only be a blank page.
      if (isFinalError(error) || (this.state.scan === null && this.failedReads >= FIRST_READ_ATTEMPTS)) {
        this.fail(error instanceof ApiRequestError ? error : new ApiRequestError("Scan read failed", { cause: error }));
        return false;
      }
      // Offline or a backend restart: the next tick tries again.
      return true;
    }
    this.reading = null;
    if (this.ended) return false;
    this.failedReads = 0;

    this.accept(scan);
    if (!isFinishedStatus(scan.status)) return true;

    await this.finishAfterLastRead(scan);
    return false;
  }

  /** Ends the session, first giving results that land just after the end message time to arrive. */
  private async finishAfterLastRead(scan: ScanResponse): Promise<void> {
    const finishedAt = Date.parse(scan.completed_at ?? "");
    const justFinished = Number.isNaN(finishedAt) || Date.now() - finishedAt < FINAL_READ_DELAY_MS * 10;
    if (justFinished) {
      await new Promise((resolve) => window.setTimeout(resolve, FINAL_READ_DELAY_MS));
      if (this.ended) return;
      try {
        const latest = await this.fetchScan(new AbortController());
        if (this.ended) return;
        this.accept(latest);
      } catch {
        // What arrived before the scan ended stands.
      }
      if (this.ended) return;
    }
    this.finish();
  }

  private connect(): void {
    if (this.ended || this.socket) return;
    window.clearTimeout(this.reconnectTimer);

    let socket: WebSocket;
    try {
      socket = new WebSocket(liveUrl(this.scanId, this.mode));
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.socket = socket;

    this.connectTimer = window.setTimeout(() => {
      if (socket === this.socket) this.dropSocket(socket);
    }, CONNECT_TIMEOUT_MS);

    socket.onmessage = (message) => {
      if (socket === this.socket) this.onSocketMessage(socket, message.data);
    };
    // A failed handshake reports only an error and code 1006, whatever the server
    // answered. The REST read behind it gets the real reason.
    socket.onclose = (event) => {
      if (socket === this.socket) this.onSocketClose(event.code);
    };
  }

  private onSocketMessage(socket: WebSocket, data: unknown): void {
    const event = parseEvent(data);
    if (!event) return;

    this.watchForSilence(socket);
    if (event.type === "heartbeat") return;

    if (event.type === "snapshot") {
      window.clearTimeout(this.connectTimer);
      this.cancelPoll();
      // From here the socket is the newer source.
      this.reading?.abort();
      this.socketLive = true;
      this.liveSince = Date.now();
      this.setState({ transport: "live" });
    }
    this.accept(applyLiveEvent(this.state.scan, event));
  }

  private onSocketClose(code: number): void {
    const stable = this.liveSince > 0 && Date.now() - this.liveSince >= STABLE_AFTER_MS;
    this.forgetSocket();
    if (this.ended) return;
    if (stable) this.failures = 0;

    if (code === CLOSE_FINISHED && this.state.scan && isFinishedStatus(this.state.scan.status)) {
      // A batch whose save was retried can land later than the server waits.
      void this.finishAfterLastRead(this.state.scan);
      return;
    }
    if (code === CLOSE_SCAN_GONE) {
      this.fail(new ApiRequestError("Scan not found", { status: 404, code: "HTTP_404" }));
      return;
    }

    // Keeps the view current for as long as the socket is away.
    this.schedulePoll();

    if (code === CLOSE_SESSION_EXPIRED) {
      void this.reconnectAfterRefresh(stable);
    } else if (stable && (code === CLOSE_RESTARTING || code === CLOSE_LIFETIME)) {
      this.reconnectTimer = window.setTimeout(() => this.connect(), Math.random() * PLANNED_RECONNECT_SPREAD_MS);
    } else {
      this.scheduleReconnect();
    }
  }

  private async reconnectAfterRefresh(stable: boolean): Promise<void> {
    const session = await refreshSession();
    if (this.ended) return;
    if (!session) this.fail(new ApiRequestError("Session expired", { status: 401, code: "HTTP_401" }));
    else if (stable) this.connect();
    else this.scheduleReconnect();
  }

  /** Gives up on a socket without waiting for its closing handshake, which a dead link never completes. */
  private dropSocket(socket: WebSocket): void {
    this.forgetSocket();
    socket.close();
    this.schedulePoll();
    this.scheduleReconnect();
  }

  private forgetSocket(): void {
    const socket = this.socket;
    this.socket = null;
    this.socketLive = false;
    this.liveSince = 0;
    window.clearTimeout(this.connectTimer);
    window.clearTimeout(this.silenceTimer);
    if (socket) {
      socket.onmessage = null;
      socket.onclose = null;
    }
  }

  private scheduleReconnect(): void {
    window.clearTimeout(this.reconnectTimer);
    const delay = Math.min(RECONNECT_MIN_MS * 2 ** this.failures, RECONNECT_MAX_MS);
    this.failures += 1;
    this.reconnectTimer = window.setTimeout(() => this.connect(), delay * (0.8 + Math.random() * 0.4));
  }

  private watchForSilence(socket: WebSocket): void {
    window.clearTimeout(this.silenceTimer);
    this.silenceTimer = window.setTimeout(() => {
      if (socket === this.socket) this.dropSocket(socket);
    }, SILENCE_LIMIT_MS);
  }

  /** A tick already on its way stands: moving it back with every failed socket would starve the polling. */
  private schedulePoll(): void {
    if (this.ended || this.socketLive || this.pollTimer !== undefined) return;
    this.pollTimer = window.setTimeout(() => void this.pollTick(), SCAN_CONFIG.POLL_INTERVAL);
  }

  private cancelPoll(): void {
    window.clearTimeout(this.pollTimer);
    this.pollTimer = undefined;
  }

  private async pollTick(): Promise<void> {
    this.cancelPoll();
    // A hidden tab does not keep the server busy; onVisibilityChange catches up.
    if (document.visibilityState === "visible" && !this.socketLive) {
      const open = await this.read();
      if (!open || this.ended) return;
      // "Live" or "every 2 s" would be untrue while neither is getting through.
      if (!this.socketLive) this.setState({ transport: this.failedReads > 0 ? "connecting" : "polling" });
    }
    this.schedulePoll();
  }

  private readonly onOnline = () => {
    if (this.socketLive) return;
    this.failures = 0;
    void this.pollTick();
    if (!this.socket) this.connect();
  };

  private readonly onVisibilityChange = () => {
    if (document.visibilityState === "visible" && !this.socketLive) void this.pollTick();
  };

  /** Takes a new version of the scan; a new result or a new status counts as progress. */
  private accept(scan: ScanResponse | null): void {
    if (!scan) return;
    const previous = this.state.scan;
    const progressed =
      previous === null ||
      previous.status !== scan.status ||
      (previous.results?.length ?? 0) !== (scan.results?.length ?? 0);

    if (progressed) {
      this.armStallTimers();
      this.setState({ scan, stalled: false });
    } else {
      this.setState({ scan });
    }
  }

  private armStallTimers(): void {
    if (this.ended) return;
    window.clearTimeout(this.stallTimer);
    window.clearTimeout(this.giveUpTimer);
    this.stallTimer = window.setTimeout(() => this.setState({ stalled: true }), STALL_AFTER_MS);
    this.giveUpTimer = window.setTimeout(() => this.abandon(), GIVE_UP_AFTER_MS);
  }

  private abandon(): void {
    this.teardown();
    this.setState({ transport: "closed", stalled: true, gaveUp: true });
  }

  private finish(): void {
    this.teardown();
    this.setState({ transport: "closed", stalled: false });
  }

  private fail(error: ApiRequestError): void {
    this.teardown();
    this.setState({ transport: "closed", stalled: false, error });
  }

  private teardown(): void {
    this.ended = true;
    this.reading?.abort();
    const socket = this.socket;
    this.forgetSocket();
    socket?.close();
    window.clearTimeout(this.reconnectTimer);
    this.cancelPoll();
    window.clearTimeout(this.stallTimer);
    window.clearTimeout(this.giveUpTimer);
    window.removeEventListener("online", this.onOnline);
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
  }

  private setState(change: Partial<LiveScanState>): void {
    if (this.stopped) return;
    this.state = { ...this.state, ...change };
    this.onChange(this.state);
  }
}
