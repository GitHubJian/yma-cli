declare global {
    interface Window {
        Headers: () => void;
        Request: () => void;
        Response: () => void;
    }
}

export function isSupportFetch(win: Window): boolean {
    if (!('fetch' in global)) {
        return false;
    }

    try {
        new win.Headers();
        new win.Request();
        new win.Response();

        return true;
    } catch (e) {
        return false;
    }
}
