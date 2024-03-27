import {ShieldOptions} from "../models/ShieldOptions";
import {ShieldAuthOptions} from "../models/ShieldAuthOptions";
import {OpenfortAuthOptions} from "../models/OpenfortAuthOptions";
import {CustomAuthOptions} from "../models/CustomAuthOptions";
import {NoSecretFoundError} from "../errors/NoSecretFoundError";
import {SecretAlreadyExistsError} from "../errors/SecretAlreadyExistsError";
import {Share} from "../models/Share";

export class ShieldSDK {
    private readonly _baseURL: string;
    private readonly _apiKey: string;
    constructor({ baseURL = "https://shield.openfort.xyz", apiKey }: ShieldOptions) {
        this._apiKey = apiKey;
        this._baseURL = baseURL;
    }

    public async getSecret(auth: ShieldAuthOptions): Promise<Share> {
        try {
            const response = await fetch(`${this._baseURL}/shares`, {
                method: 'GET',
                headers: new Headers(this.getAuthHeaders(auth)),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new NoSecretFoundError("No secret found for the given auth options");
                }
                const errorResponse = await response.text();
                console.error(`unexpected response: ${response.status}: ${errorResponse}`);
                throw new Error(`unexpected response: ${response.status}: ${errorResponse}`);
            }

            const data = await response.json();
            return {
                secret: data.secret,
                userEntropy: data.user_entropy,
                encryptionParameters: data.encryption_parameters,
            };
        } catch (error) {
            console.error(`unexpected error: ${error}`);
            throw error;
        }
    }


    public async storeSecret(share: Share, auth: ShieldAuthOptions): Promise<void> {
        try {
            const response = await fetch(`${this._baseURL}/shares`, {
                method: 'POST',
                headers: new Headers(this.getAuthHeaders(auth)),
                body: JSON.stringify({
                    "secret": share.secret,
                    "user_entropy": share.userEntropy,
                    "encryption_parameters": share.encryptionParameters,
                }),
            });

            if (!response.ok) {
                if (response.status === 409) {
                    throw new SecretAlreadyExistsError("Secret already exists for the given auth options");
                }
                const errorResponse = await response.text();
                console.error(`unexpected response: ${response.status}: ${errorResponse}`);
                throw new Error(`unexpected response: ${response.status}: ${errorResponse}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`unexpected error: ${error}`);
            throw error;
        }
    }


    private isOpenfortAuthOptions(options: ShieldAuthOptions): options is OpenfortAuthOptions {
        return 'openfortOAuthToken' in options;
    }


    private isCustomAuthOptions(options: ShieldAuthOptions): options is CustomAuthOptions {
        return 'customToken' in options;
    }

    private getAuthHeaders(options: ShieldAuthOptions): HeadersInit {
        const headers: HeadersInit = {
            "x-api-key": this._apiKey,
            "x-auth-provider": options.authProvider,
        };

        if (this.isOpenfortAuthOptions(options)) {
            headers["Authorization"] = `Bearer ${options.openfortOAuthToken}`;
            if (options.openfortOAuthProvider) {
                headers["x-openfort-provider"] = options.openfortOAuthProvider;
            }
            if (options.openfortOAuthTokenType) {
                headers["x-openfort-token-type"] = options.openfortOAuthTokenType;
            }
        }

        if (this.isCustomAuthOptions(options)) {
            headers["Authorization"] = `Bearer ${options.customToken}`;
        }

        return headers;
    }
}