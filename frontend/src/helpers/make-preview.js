export const makePreview = (file) => Object.assign(file, { preview: URL.createObjectURL(file) });
