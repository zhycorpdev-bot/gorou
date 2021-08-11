const pattern = /^https?:\/\/((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-zA-Z\d%_.~+]*)*(\?[;&a-zA-Z\d%_.~+=-]*)?(#[-a-zA-Z\d_]*)?$/;

export function parseURL(url: string): { valid: boolean; matched: string[] } {
    const matched = [...pattern.exec(url) ?? []];
    return {
        valid: Boolean(matched.length),
        matched
    };
}
