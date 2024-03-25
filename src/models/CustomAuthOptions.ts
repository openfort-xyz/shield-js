import {ShieldAuthOptions} from "./ShieldAuthOptions";
import {ShieldAuthProvider} from "../enums/ShieldAuthProvider";

export interface CustomAuthOptions extends ShieldAuthOptions {
    authProvider: ShieldAuthProvider.CUSTOM;
    customToken: string;
}

