import {ShieldAuthProvider} from "../enums/ShieldAuthProvider";

export interface ShieldAuthOptions {
    authProvider: ShieldAuthProvider;
    encryptionPart?: string;
}