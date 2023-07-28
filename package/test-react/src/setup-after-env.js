import '@testing-library/jest-dom';
import {toHaveNoViolations} from 'jest-axe';
import format, {plugins} from 'pretty-format';

function formatHTML(nodes) {
    const htmlContent = format(nodes, {
        plugins: [plugins.DOMCollection, plugins.DOMElement],
    });

    const filtered = htmlContent
        .split(/[\n\r]+/)
        .filter(line => line.trim())
        .map(line => line.replace(/\s+$/, ''))
        .join('\n');

    return filtered;
}

expect.addSnapshotSerializer({
    test: element => {
        return (
            typeof HTMLElement !== 'undefined'
            && (element instanceof HTMLElement
                || element instanceof DocumentFragment
                || element instanceof HTMLCollection
                || (Array.isArray(element) && element[0] instanceof HTMLElement))
        );
    },
    print: element => {
        return formatHTML(element);
    },
});

expect.extend(toHaveNoViolations);
