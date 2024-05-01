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
                entropy: data.entropy,
                encryptionParameters: {
                    salt: data.salt,
                    iterations: data.iterations,
                    length: data.length,
                    digest: data.digest,
                },
            };
        } catch (error) {
            console.error(`unexpected error: ${error}`);
            throw error;
        }
    }

    public async deleteSecret(auth: ShieldAuthOptions): Promise<void> {
        try {
            const response = await fetch(`${this._baseURL}/shares`, {
                method: 'DELETE',
                headers: new Headers(this.getAuthHeaders(auth)),
            });

            if (!response.ok) {
                const errorResponse = await response.text();
                console.error(`unexpected response: ${response.status}: ${errorResponse}`);
                throw new Error(`unexpected response: ${response.status}: ${errorResponse}`);
            }
        } catch (error) {
            console.error(`unexpected error: ${error}`);
            throw error;
        }
    }

    private async createSecret(path: string, share: Share, auth: ShieldAuthOptions) {
        try {
            const response = await fetch(`${this._baseURL}/${path}`, {
                method: 'POST',
                headers: new Headers(this.getAuthHeaders(auth)),
                body: JSON.stringify({
                    "secret": share.secret,
                    "entropy": share.entropy,
                    "salt": share.encryptionParameters?.salt,
                    "iterations": share.encryptionParameters?.iterations,
                    "length": share.encryptionParameters?.length,
                    "digest": share.encryptionParameters?.digest,
                    "encryption_part": auth.encryptionPart || "",
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
        } catch (error) {
            console.error(`unexpected error: ${error}`);
            throw error;
        }
    }

    public async preRegister(share: Share, auth: ShieldAuthOptions): Promise<void> {
        await this.createSecret("admin/preregister", share, auth);
    }

    public async storeSecret(share: Share, auth: ShieldAuthOptions): Promise<void> {
        await this.createSecret("shares", share, auth);
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
            "Access-Control-Allow-Origin": this._baseURL
        };

        if (options.externalUserId) {
            headers["x-user-id"] = options.externalUserId;
        }

        if (options.apiKey) {
            headers["x-api-key"] = options.apiKey;
        }

        if (options.apiSecret) {
            headers["x-api-secret"] = options.apiSecret;
        }

        if (options.encryptionPart) {
            headers["x-encryption-part"] = options.encryptionPart;
        }

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