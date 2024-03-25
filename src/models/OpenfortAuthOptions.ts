import {ShieldAuthOptions} from "./ShieldAuthOptions";
import {OpenfortOAuthProvider} from "../enums/OpenfortOAuthProvider";
import {OpenfortOAuthTokenType} from "../enums/OpenfortOAuthTokenType";
import {ShieldAuthProvider} from "../enums/ShieldAuthProvider";

export interface OpenfortAuthOptions extends ShieldAuthOptions {
    authProvider: ShieldAuthProvider.OPENFORT;
    openfortOAuthProvider?: OpenfortOAuthProvider;
    openfortOAuthToken: string;
    openfortOAuthTokenType?: OpenfortOAuthTokenType;
}