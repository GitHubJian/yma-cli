import joi from 'joi';

const schema = joi.array().items(
    joi
        .object()
        .keys({
            name: joi.string().required(),
            version: joi.string().required(),
        })
        .unknown(true),
);

export default function validate(options: any) {
    const {error} = schema.validate(options);

    if (error) {
        console.error('[ExpectedDependencyWebpackPlugin]: invalid config');

        process.exit(1);
    }
}
