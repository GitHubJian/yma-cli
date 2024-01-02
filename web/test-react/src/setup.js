const emotion = require('@emotion/css');
const sinon = require('sinon');

jest.mock('@emotion/styled', () => {
    return {
        div: function (...args) {
            let styles = [];

            if (args[0] == null || args[0].raw === undefined) {
                styles.push.apply(styles, args);
            } else {
                styles.push(args[0][0]);
                let len = args.length;
                let i = 1;

                for (; i < len; i++) {
                    styles.push(args[i], args[0][i]);
                }
            }

            let Styled = {
                __emotion_styles: styles,
            };

            return Styled;
        },
    };
});

sinon.replace(emotion, 'css', function (...args) {
    // 本身是个数组，我们只关注内容
    return args[0][0];
});
