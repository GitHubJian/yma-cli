import ErrorMonitor from './monitor';

var win =
    typeof window !== 'undefined'
        ? window
        : typeof global !== 'undefined'
        ? global
        : typeof self !== 'undefined'
        ? self
        : {};

var em = (win['EM'] = new ErrorMonitor());
em.install();

// var queue = win['__em_queue__'];

// window.onerror = queue.rawOnerror;
// window.onunhandledrejection = queue.rawOnunhandledrejection;

// var data = queue.data;
// debugger;

// if (data.length) {
//     for (var i = 0; i < data.length; i++) {
//         em.captureException(data[i].p);
//     }
// }

// export default em;
