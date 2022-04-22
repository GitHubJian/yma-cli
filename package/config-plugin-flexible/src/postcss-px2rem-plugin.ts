/**
 * @file: postcss-px2rem.js
 * @description 基于 postcss 开发的 process
 */

function toFixed(value: number, precision: number): number {
    const multiplier = Math.pow(10, precision + 1);
    const wholeNumber = Math.floor(value * multiplier);

    return (Math.round(wholeNumber / 10) * 10) / multiplier;
}

function createReplaceFn(
    baseUnit,
    unitPrecision
): (raw: string, $1: string) => string {
    return function (raw, $1) {
        if (!$1) {
            return raw;
        }

        const pixels = parseFloat($1);
        const fixedVal = toFixed(pixels / baseUnit, unitPrecision);

        return `${fixedVal}rem`;
    };
}

interface CreatorOptions {
    baseUnit?: number;
    unitPrecision?: number;
}

function creator(options?: CreatorOptions): {
    postcssPlugin: string;
    Once: (root) => void;
} {
    options = Object.assign(
        {},
        {
            baseUnit: 100,
            unitPrecision: 6,
        },
        options || {}
    );

    const replacement = createReplaceFn(
        options.baseUnit,
        options.unitPrecision
    );

    const unit = 'px';
    const unitRE = new RegExp(
        `"[^"]+"|'[^']+'|url\\([^\\)]+\\)|(\\d*\\.?\\d+)(${unit})`,
        'ig'
    );
    // 由于到 postcss 的时候已经成css片段了，就没有注释了，只能用比较 hack 的手法，自定义单位 tx 会被转成 px
    const customUnit = 'tx';
    const customUnitRE = new RegExp(
        `"[^"]+"|'[^']+'|url\\([^\\)]+\\)|(\\d*\\.?\\d+)(${customUnit})`,
        'ig'
    );

    return {
        postcssPlugin: 'postcss-px2rem',
        Once: root => {
            root.walkDecls(decl => {
                if (decl.value.indexOf(unit) > -1) {
                    decl.value = decl.value.replace(unitRE, replacement);
                }

                if (decl.value.indexOf(customUnit) > -1) {
                    decl.value = decl.value.replace(
                        customUnitRE,
                        function (raw, $1) {
                            if (!$1) {
                                return raw;
                            }

                            return `${$1}px`;
                        }
                    );
                }
            });

            root.walkAtRules('media', rule => {
                if (rule.params.indexOf(unit) > -1) {
                    rule.params = rule.params.replace(unitRE, replacement);
                }

                if (rule.params.indexOf(customUnit) > -1) {
                    rule.params = rule.params.replace(
                        customUnitRE,
                        function (raw, $1) {
                            if (!$1) {
                                return raw;
                            }

                            return `${$1}px`;
                        }
                    );
                }
            });
        },
    };
}

creator.postcss = true;

export default creator;
