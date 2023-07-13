export default class WebError extends Error {
    name: string;
    message: string;

    constructor(message) {
        super();
        this.name = 'WebError';
        this.message = message;
    }
}
