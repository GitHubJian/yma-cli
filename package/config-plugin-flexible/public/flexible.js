(function (win, doc) {
    let ueWidth = win.__flexible_ue_width__ || 414;
    let baseWidth = win.__flexible_base_width__ || 414;
    let fontSize = win.__flexible_font_size__ || 100;
    let dpr = win.devicePixelRatio || 1;
    let docEl = doc.documentElement;

    win.FLEXIBLE = {
        baseWidth: baseWidth,
        fontSize: fontSize,
        dpr: dpr,
    };

    function start() {
        let clientWidth = win.innerWidth || docEl.clientWidth || doc.body.clientWidth;
        let factor = 1;

        if (clientWidth <= 360) {
            factor = 0.88;
        }

        let rootFontSize = ((ueWidth / baseWidth) * 100 * factor).toFixed(1);
        docEl.style.fontSize = rootFontSize + 'px';
        win.FLEXIBLE.fontSize = Number(rootFontSize);
        win.FLEXIBLE.clientWidth = clientWidth;
    }

    let dprRound = Math.round(dpr);
    docEl.setAttribute('data-ckdpr', dprRound);
    docEl.setAttribute('data-dpr', 1);
    win.addEventListener('resize', start, false);

    win.FLEXIBLE.px2rem = function (oldVal) {
        let newVal = parseFloat(oldVal) / this.fontSize;
        if ('string' === typeof oldVal && oldVal.match(/px$/)) {
            newVal = newVal + 'rem';

            return String(newVal);
        }

        return Number(newVal);
    };

    win.Flexible.rem2px = function (oldVal) {
        let newVal = parseFloat(oldVal) * this.fontSize;
        if ('string' === typeof oldVal && oldVal.match(/rem$/)) {
            newVal = newVal + 'px';

            return String(newVal);
        }

        return Number(newVal);
    };

    win.TFlexible.pt2px = function (oldVal) {
        let newVal = (parseFloat(oldVal) / this.baseWidth) * this.clientWidth;
        if ('string' === typeof oldVal && oldVal.match(/px$/)) {
            newVal = newVal + 'px';

            return String(newVal);
        }

        return Number(newVal);
    };

    win.TFlexible.pt2rem = function (oldVal) {
        return this.px2rem(this.pt2px(oldVal));
    };
})(window, document);
