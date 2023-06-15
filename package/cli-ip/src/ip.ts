import address from 'address';
import defaultGateway from 'default-gateway';

export default function (): string | null {
    const result = defaultGateway.v4.sync();
    let hostname = address.ip(result && result.interface);
    if (hostname) {
        if (/^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(hostname)) {
            return hostname;
        }
        return null;
    }

    return null;
}
