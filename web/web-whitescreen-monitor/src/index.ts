enum Status {
    ERROR = 'Error',
    OK = 'OK',
}

interface WhitescreenOptions {
    xPathSelectors?: string[];
    hasSkeleton?: boolean;
    callback: ({status, st}: {status: Status; st: number | null}) => void;
}

function whitescreen(
    {xPathSelectors, hasSkeleton, callback}: WhitescreenOptions = {
        xPathSelectors: ['html', 'body', '#app'],
        hasSkeleton: false,
        callback: () => {},
    },
) {
    const current: string[] = []; // 采样结果
    const workInProgress: string[] = []; // 当前采样节点
    let _whiteLoopNum = 0;

    function timerFunc() {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(deadline => {
                if (deadline.timeRemaining() > 0) {
                    sampling();
                }
            });
        } else {
            sampling();
        }
    }

    let timer: null | number = null;
    function main(): void {
        if (timer) {
            return;
        }
        timer = window.setInterval(() => {
            if (hasSkeleton) {
                _whiteLoopNum++;
                workInProgress.length = 0;
            }

            timerFunc();
        }, 1000);
    }

    function sampling() {
        let emptyPoints = 0;
        for (let i = 1; i <= 9; i++) {
            const xElements = document.elementsFromPoint((window.innerWidth * i) / 10, window.innerHeight / 2);
            const yElements = document.elementsFromPoint(window.innerWidth / 2, (window.innerHeight * i) / 10);

            if (isContainer(xElements[0] as HTMLElement)) {
                emptyPoints++;
            }

            if (i != 5) {
                if (isContainer(yElements[0] as HTMLElement)) {
                    emptyPoints++;
                }
            }
        }

        // 页面正常渲染，停止轮训
        if (emptyPoints !== 17) {
            if (hasSkeleton) {
                if (!_whiteLoopNum) {
                    return main();
                }

                if (current.join() === workInProgress.join()) {
                    return callback({
                        st: window.__whitescreen_monitor_st__ || null,
                        status: Status.ERROR,
                    });
                }
            }

            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        } else {
            if (!timer) {
                main();
            }
        }

        // 17个点都是容器节点算作白屏
        callback({
            st: window.__whitescreen_monitor_st__ || null,
            status: emptyPoints === 17 ? Status.ERROR : Status.OK,
        });
    }

    function isContainer(el: HTMLElement) {
        const selector = getSelector(el);

        if (hasSkeleton) {
            _whiteLoopNum ? workInProgress.push(selector) : current.push(selector);
        }

        return xPathSelectors?.indexOf(selector) != -1;
    }

    function getSelector(el: HTMLElement) {
        if (el.id) {
            return '#' + el.id;
        } else if (el.className) {
            return (
                '.' +
                el.className
                    .split(' ')
                    .filter((item: string) => !!item)
                    .join('.')
            );
        }
        return el.nodeName.toLowerCase();
    }

    if (hasSkeleton) {
        if (document.readyState !== 'complete') {
            timerFunc();
        }
    } else {
        if (document.readyState === 'complete') {
            timerFunc();
        } else {
            window.addEventListener('load', timerFunc);
        }
    }
}

export default whitescreen;
