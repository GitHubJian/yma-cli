const BITS = ['bit', 'Kbit', 'Mbit', 'Gbit', 'Tbit', 'Pbit', 'Ebit', 'Zbit', 'Ybit'];
const BYTES = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

const defaults = {
    bits: false,
    base: 10,
    exponent: -1,
    output: 'string',
    pad: false,
    precision: 0,
    round: 2,
};

export default function filesize(size, options = {}) {
    let {bits, base, exponent, output, pad, precision, round} = Object.assign({}, defaults, options || {});
    let e = exponent;
    let num = Number(size);
    let result: Array<string | number> = [];
    let val = 0;
    let u;

    const ceil = base === 10 ? 1000 : 1024;
    const neg = num < 0;

    if (neg) {
        num = -num;
    }

    if (e === -1 || isNaN(e)) {
        e = Math.floor(Math.log(num) / Math.log(ceil));

        if (e < 0) {
            e = 0;
        }
    }

    if (e > 8) {
        if (precision > 0) {
            precision += 8 - e;
        }

        e = 8;
    }

    if (num === 0) {
        result[0] = 0;
        u = result[1] = (bits ? BITS : BYTES)[e];
    } else {
        val = num / (base === 2 ? Math.pow(2, e * 10) : Math.pow(1000, e));

        if (bits) {
            val = val * 8;

            if (val >= ceil && e < 8) {
                val = val / ceil;
                e++;
            }
        }

        const p = Math.pow(10, e > 0 ? round : 0);
        result[0] = Math.round(val * p) / p;

        if (result[0] === ceil && e < 8 && exponent === -1) {
            result[0] = 1;
            e++;
        }

        u = result[1] = base === 10 && e === 1 ? (bits ? 'kbit' : 'kB') : (bits ? BITS : BYTES)[e];
    }

    if (neg) {
        result[0] = -result[0];
    }

    if (precision > 0) {
        result[0] = result[0].toPrecision(precision);
    }

    if (pad && Number.isInteger(result[0]) === false && round > 0) {
        const x = '.';
        const tmp = result[0].toString().split(x);
        const s = tmp[1] || '';
        const l = s.length;
        const n = round - 1;

        result[0] = `${tmp[0]}${x}${s.padEnd(l + n, '0')}`;
    }

    const res =
        output === 'array'
            ? result
            : output === 'object'
            ? {
                  value: result[0],
                  symbol: result[1],
                  exponent: e,
                  unit: u,
              }
            : result.join(' ');

    return res;
}
