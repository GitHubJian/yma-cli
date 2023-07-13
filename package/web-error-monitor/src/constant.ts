export type EvtKey = keyof WindowEventMap;
export type EvtListener = (this: Window, ev: WindowEventMap[EvtKey]) => any;
type RawAddEventListener$1 = <K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
) => void;
type RawAddEventListener$2 = (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
) => void;
export type RawAddEventListener = RawAddEventListener$1 | RawAddEventListener$2;
export type AddEventListenerReplacementFn = (
    rawFn: RawAddEventListener
) => RawAddEventListener;

type RequestAnimationFrameFn = (callback: FrameRequestCallback) => number;
export type RequestAnimationFrameReplacementFn = (
    rawFn: RequestAnimationFrameFn
) => RequestAnimationFrameFn;

type XHRProtoOpen = (method: string, url: string | URL) => void;
export type XHRProtoOpenReplacementFn = (rawFn: XHRProtoOpen) => XHRProtoOpen;

type XHRProtoSend = (body?: Document | XMLHttpRequestBodyInit | null) => void;
export type XHRProtoSendReplacementFn = (rawFn: XHRProtoSend) => XHRProtoSend;

type XHRProtoOnreadystatechange = ((this: Document, ev: Event) => any) | null;
export type XHRProtoOnreadystatechangeReplacementFn = (
    rawFn: XHRProtoOnreadystatechange
) => XHRProtoOnreadystatechange;

type Fetch = (
    input: RequestInfo | URL,
    init?: RequestInit
) => Promise<Response>;
export type FetchReplacementFn = (rawFn: Fetch) => Fetch;

type HistoryPushState = (
    data: any,
    unused: string,
    url?: string | URL | null
) => void;
export type HistoryPushStateReplacementFn = (
    rawFn: HistoryPushState
) => HistoryPushState;

type HistoryReplaceState = (
    data: any,
    unused: string,
    url?: string | URL | null
) => void;
export type HistoryReplaceStateReplacementFn = (
    rawFn: HistoryReplaceState
) => HistoryReplaceState;
