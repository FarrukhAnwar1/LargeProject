export interface TokenData {
    accessToken: string;
}
export function storeToken(tok: TokenData) {
    try {
        localStorage.setItem('token_data', tok.accessToken);
    }
    catch (e) {
        console.log(e);
    }
}
export function retrieveToken(): string | null | undefined {
    let ud;
    try {
        ud = localStorage.getItem('token_data');
    }
    catch (e) {
        console.log(e);
    }
    return ud;
}