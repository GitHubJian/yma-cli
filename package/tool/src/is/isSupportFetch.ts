export function isSupportFetch(win: {
    Headers: () => void;
    Request: () => void;
    Response: () => void;
}): boolean {
    if (!('fetch' in global)) {
        return false;
    }

    window.Headers

    try {
        new win.Headers();
        new win.Request();
        new win.Response();

        return true;
    } catch (e) {
        return false;
    }
}
