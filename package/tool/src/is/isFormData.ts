export function isFormData(v) {
    return typeof FormData !== 'undefined' && v instanceof FormData;
};
