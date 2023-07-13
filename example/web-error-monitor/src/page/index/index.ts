// import(/* webpackChunkName: "error-minotor" */ '@ErrorMinotor');
// import /* webpackChunkName: "error-minotor" */ '@ErrorMinotor';

import * as Sentry from '@sentry/browser';
// import {Integrations} from '@sentry/browser'
debugger;
Sentry.init({
    // integrations: [new Integrations.BrowserTracing()],
});

// window.addEventListener(
//     'error',
//     function (e) {
//         return true;
//     },
//     true
// );

setTimeout(function () {
    throw new Error('1111');
}, 0);

debugger;

try {
    throw new Error('1');
} catch (e) {
    EM.captureException(e);
}

new Promise((resolve, reject) => {
    reject();
});
