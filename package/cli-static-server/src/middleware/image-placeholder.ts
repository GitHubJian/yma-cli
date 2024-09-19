// @ts-ignore
import {createCanvas} from 'canvas';
import {pathToRegexp} from 'path-to-regexp';

function createStream(options) {
    const {width = 500, height = 300, backgroundColor = 'cccccc', color = '969696'} = options;

    const text = options.text || `${width} x ${height}`;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const fontSize = 40;
    ctx.font = `${fontSize}px Impact`;
    ctx.textAlign = 'left';

    ctx.fillStyle = '#' + backgroundColor;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#' + color;
    const {width: textWidth} = ctx.measureText(text);
    ctx.fillText(text, (width - textWidth) / 2, (height + fontSize) / 2);

    const stream = canvas.createPNGStream();

    return stream;
}

const re = pathToRegexp('/placeholder');

export default function imagePlaceholderMiddleware() {
    return async function (ctx, next) {
        const reqpath = ctx.path;

        if (re.exec(reqpath)) {
            const {width, height, backgroundColor, color, text} = ctx.query;

            const stream = createStream({
                width: +width,
                height: +height,
                backgroundColor,
                color,
                text,
            });

            ctx.set('Content-Type', 'image/png');

            ctx.body = stream;
        } else {
            await next();
        }
    };
}
