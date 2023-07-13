import {isArray} from './is';

export function safeJoin(input: any[], delimiter?: string) {
    if (!isArray(input)) return '';

    let output: string[] = [];

    for (var i = 0; i < input.length; i++) {
        try {
            output.push(String(input[i]));
        } catch (e) {
            output.push('[value cannot be serialized]');
        }
    }

    return output.join(delimiter);
}
