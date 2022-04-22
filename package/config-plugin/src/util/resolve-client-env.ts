import {ProjectOptions} from '../options';

export default function resolveClientEnv(
    options: ProjectOptions,
    raw?: boolean
): {
    [key: string]: any;
} {
    const env = {
        BASE_URL: '',
    };

    Object.keys(process.env).forEach(key => {
        if (key.startsWith('YMA_') || key === 'NODE_ENV') {
            env[key] = process.env[key];
        }
    });

    env.BASE_URL = options.publicPath;

    if (raw) {
        return env;
    }

    for (const key in env) {
        if (env[key]) {
            env[key] = JSON.stringify(env[key]);
        }
    }

    return {
        'process.env': env,
    };
}
