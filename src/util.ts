export const trimUrlTrailingSlash = (url: string): string =>
    url.endsWith('/') ? url.slice(0, -1) : url;

export const toBase64 = (str: string): string => Buffer.from(str).toString("base64");
