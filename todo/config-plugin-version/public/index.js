!(function () {
    // window.__version__ = '202403151430';

    function on(el, event, handler) {
        if (document.addEventListener) {
            el.addEventListener(event, handler, false);
        } else {
            el.attachEvent('on' + event, handler);
        }
    }

    function Heartbeat(fn, interval = 5 * 1000) {
        this.fn = fn;
        this.interval = interval;

        this.timer = null;
        this.count = 0;
    }

    Heartbeat.prototype.start = function start() {
        const that = this;
        that.stop();

        that.timer = window.setInterval(function () {
            that.fn(that);
            that.count++;
        }, that.interval);
    };

    Heartbeat.prototype.stop = function stop() {
        window.clearInterval(this.timer);

        this.timer = null;
        this.count = 0;
    };

    Heartbeat.prototype.setInterval = function setInterval(interval) {
        const that = this;
        that.interval = interval;

        if (that.timer) {
            that.start();
        }
    };

    function fetch(callback) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/version.json');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    var res = JSON.parse(xhr.responseText);

                    callback && callback(res);
                } catch (err) {}
            }
        };

        xhr.send();
    }

    function createToast() {
        const div = document.createElement('div');
        const style = document.createElement('style');

        div.innerHTML = `
        <div class="yma-version">
        <i class="yma-version__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="none">
                <desc>警告</desc>
                <path
                    opacity="0.4"
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M59.3374 17.4937C55.032 10.5802 44.968 10.5802 40.6626 17.4937L8.47157 69.1851C3.90856 76.5122 9.17715 86 17.809 86H82.1911C90.8229 86 96.0915 76.5122 91.5285 69.1851L59.3374 17.4937ZM53.3712 23.7785C51.7984 21.3158 48.2017 21.3158 46.6289 23.7785L15.9297 71.847C14.2292 74.5096 16.1415 78 19.3008 78H80.6992C83.8585 78 85.7709 74.5096 84.0704 71.847L53.3712 23.7785Z"
                    fill="#e6a23c"
                />
                <path
                    opacity="0.4"
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M53.3712 23.7785C51.7984 21.3158 48.2017 21.3159 46.6289 23.7785L15.9297 71.847C14.2292 74.5096 16.1415 78 19.3008 78H80.6992C83.8585 78 85.7709 74.5096 84.0704 71.847L53.3712 23.7785ZM53.057 37.0415H48.1061C46.5798 37.0415 45.37 37.9139 45.4652 38.9459L47.7805 58.4545C47.8676 59.3993 49.0241 60.1353 50.4213 60.1353H50.7417C52.139 60.1353 53.2954 59.3993 53.3826 58.4545L55.6978 38.9459C55.793 37.9139 54.5833 37.0415 53.057 37.0415ZM54.5861 66.9098C54.5861 69.1727 52.7517 71.0071 50.4889 71.0071C48.226 71.0071 46.3916 69.1727 46.3916 66.9098C46.3916 64.6469 48.226 62.8125 50.4889 62.8125C52.7517 62.8125 54.5861 64.6469 54.5861 66.9098Z"
                    fill="#e6a23c"
                />
                <path
                    opacity="0.9"
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M48.1061 37.0415H53.057C54.5833 37.0415 55.793 37.9139 55.6978 38.9459L53.3826 58.4545C53.2954 59.3993 52.139 60.1353 50.7417 60.1353H50.4213C49.0241 60.1353 47.8676 59.3993 47.7805 58.4545L45.4652 38.9459C45.37 37.9139 46.5798 37.0415 48.1061 37.0415ZM50.4889 71.0071C52.7517 71.0071 54.5861 69.1726 54.5861 66.9098C54.5861 64.6469 52.7517 62.8125 50.4889 62.8125C48.226 62.8125 46.3916 64.6469 46.3916 66.9098C46.3916 69.1726 48.226 71.0071 50.4889 71.0071Z"
                    fill="white"
                />
            </svg>
        </i>

        <span class="yma-version__content">服务更新了，即将刷新页面</span>
    </div>
`;

        style.innerHTML = `.yma-version {
            position: fixed;
            top: 20px;
            left: 50%;
            display: flex;
            align-items: center;
            overflow: hidden;
            box-sizing: border-box;
            min-width: 380px;
            padding: 15px 15px 15px 20px;
            border-width: 1px;
            border-style: solid;
            border-color: #faecd8;
            border-radius: 4px;
            background-color: #fdf6ec;
            color: #e6a23c;
            transition: opacity .3s, transform .4s, top .4s;
            transform: translateX(-50%);
        }
        
        .yma-version__icon {
            display: inline-block;
            vertical-align: middle;
            width: 20px;
            height: 20px;
            margin-right: 10px;
        }
        
        .yma-version__icon svg {
            width: 100%;
            height: 100%;
        }
        
        .yma-version__content {
            vertical-align: middle;
        }
`;

        document.body.appendChild(style);
        document.body.appendChild(div);
    }

    const heartbeat = new Heartbeat(function (hb) {
        fetch(function (res) {
            const newVersion = res.version;
            const oldVersion = window.__version__;
            if (newVersion !== oldVersion) {
                createToast();

                setTimeout(function () {
                    window.location.reload(true);
                }, 3000);
            }
        });
    });

    if (document && 'complete' === document.readyState) {
        heartbeat.start();
    } else {
        on(window, 'load', function () {
            heartbeat.start();
        });
    }
})();
