import {ShieldOptions} from "../models/ShieldOptions";
import {ShieldAuthOptions} from "../models/ShieldAuthOptions";
import {OpenfortAuthOptions} from "../models/OpenfortAuthOptions";
import axios, {AxiosHeaders} from "axios";
import {CustomAuthOptions} from "../models/CustomAuthOptions";
import {NoSecretFoundError} from "../errors/NoSecretFoundError";
import {SecretAlreadyExistsError} from "../errors/SecretAlreadyExistsError";

export class ShieldSDK {
    private readonly _baseURL: string;
    private readonly _apiKey: string;
    constructor({ baseURL = "https://shield.openfort.xyz", apiKey }: ShieldOptions) {
        this._apiKey = apiKey;
        this._baseURL = baseURL;
    }

    public async getSecret(auth: ShieldAuthOptions): Promise<string> {
        try {
            const res = await axios.get(`${this._baseURL}/shares`, {
                headers: this.getAuthHeaders(auth)
            });
            return res.data.secret;
        } catch (error: any) {
            if (error.response) {
                if (error.response.status === 404) {
                    throw new NoSecretFoundError("No secret found for the given auth options")
                }
                console.error(`unexpected response: ${error.response.status}: ${error.response.data}`);
            } else if (error.request) {
                console.error(`no response: ${error.request}`);
            } else {
                console.error(`unexpected error: ${error}`);
            }

            throw error
        }
    }

    public async storeSecret(secret: string, auth: ShieldAuthOptions): Promise<void> {
        try {
            const res = await axios.post(`${this._baseURL}/shares`, {
                "secret": secret
            }, {
                headers: this.getAuthHeaders(auth)
            });
            return res.data.share;
        } catch (error: any) {
            if (error.response) {
                if (error.response.status === 409) {
                    throw new SecretAlreadyExistsError("Secret already exists for the given auth options")
                }
                console.error(`unexpected response: ${error.response.status}: ${error.response.data}`);
            } else if (error.request) {
                console.error(`no response: ${error.request}`);
            } else {
                console.error(`unexpected error: ${error}`);
            }

            throw error
        }
    }

    private isOpenfortAuthOptions(options: ShieldAuthOptions): options is OpenfortAuthOptions {
        return 'openfortOAuthToken' in options;
    }


    private isCustomAuthOptions(options: ShieldAuthOptions): options is CustomAuthOptions {
        return 'customToken' in options;
    }

    private getAuthHeaders(options: ShieldAuthOptions): AxiosHeaders {
        const headers = new AxiosHeaders();
        headers.set("x-api-key", this._apiKey)
        headers.set("x-auth-provider", options.authProvider)
        headers.set("Access-Control-Allow-Origin", this._baseURL)

        if (this.isOpenfortAuthOptions(options)) {
            headers.setAuthorization(`Bearer ${options.openfortOAuthToken}`)
            if (options.openfortOAuthProvider) {
                headers.set("x-openfort-provider", options.openfortOAuthProvider)
            }

            if (options.openfortOAuthTokenType) {
                headers.set("x-openfort-token-type", options.openfortOAuthTokenType)
            }
        }

        if (this.isCustomAuthOptions(options)) {
            headers.setAuthorization(`Bearer ${options.customToken}`)
        }
        return headers
    }

}