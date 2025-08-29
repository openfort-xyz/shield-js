import { ShieldOptions } from "../models/ShieldOptions";
import { ShieldAuthOptions } from "../models/ShieldAuthOptions";
import { OpenfortAuthOptions } from "../models/OpenfortAuthOptions";
import { CustomAuthOptions } from "../models/CustomAuthOptions";
import { NoSecretFoundError } from "../errors/NoSecretFoundError";
import { SecretAlreadyExistsError } from "../errors/SecretAlreadyExistsError";
import { Share } from "../models/Share";
import { EncryptionPartMissingError } from "../errors/EncryptionPartMissingError";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import axiosRetry from "axios-retry";

export class ShieldSDK {

    private readonly _requestRetries = 5;
    private readonly _retryDelayFunc = retryCount => 500. * Math.pow(2, retryCount);

    private readonly _baseURL: string;
    private readonly _apiKey: string;
    private readonly _requestIdHeader = "x-request-id";

    private _client: AxiosInstance;

    constructor({ baseURL = "https://shield.openfort.io", apiKey }: ShieldOptions) {
        this._apiKey = apiKey;
        this._baseURL = baseURL;
        this.initAxiosClient();
    }

    private initAxiosClient() {
        this._client = axios.create({ baseURL: this._baseURL });
        axiosRetry(this._client, {
            retries: this._requestRetries,
            retryDelay: this._retryDelayFunc,
            retryCondition: error =>
                axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500,
        });
    }

    async _post(url: string, headers: Record<string, string>, body?: object): Promise<AxiosResponse<any, any>> {
        return this._client.post(url, body, { headers: headers} );
    }

    async _get(url: string, headers: Record<string, string>): Promise<AxiosResponse<any, any>> {
        return this._client.get(url, { headers: headers });
    }

    async _put(url: string, headers: Record<string, string>, body?: object): Promise<AxiosResponse<any, any>> {
        return this._client.put(url, body, { headers: headers} );
    }

    async _delete(url: string, headers: Record<string, string>, body?: object): Promise<AxiosResponse<any, any>> {
        return this._client.delete(url, { headers: headers} );
    }

    public async keychain(auth: ShieldAuthOptions, reference?: string, requestId?: string): Promise<Share[]> {
        try {
            const url = reference ? `${this._baseURL}/keychain?reference=${reference}` : `${this._baseURL}/keychain`;

            const response = await this._get(url, this.getAuthHeaders(auth, requestId));

            const data = response.data;

            return data.shares.map((share: any) => {
                return {
                    secret: share.secret,
                    entropy: share.entropy,
                    encryptionParameters: {
                        salt: share.salt,
                        iterations: share.iterations,
                        length: share.length,
                        digest: share.digest,
                    },
                    keychainId: share.keychain_id,
                    reference: share.reference,
                };
            });
        } catch (error) {
            console.error(`unexpected error: ${error}`);
            throw error;
        }
    }

    public async getSecret(auth: ShieldAuthOptions, requestId?: string): Promise<Share> {
        let response: AxiosResponse;
        try {
            response = await this._get(`${this._baseURL}/shares`, this.getAuthHeaders(auth, requestId));
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === axios.HttpStatusCode.NotFound) {
                    throw new NoSecretFoundError("No secret found for the given auth options");
                }
                const errorContent = error.response.data;
                if (errorContent.includes("EC_MISSING")) {
                    throw new EncryptionPartMissingError("Encryption part missing");
                }
            } else {
                console.error("axios request failed", error);
                throw new Error(error);
            }
        }

        const data = await response.data;
        return {
            secret: data.secret,
            entropy: data.entropy,
            encryptionParameters: {
                salt: data.salt,
                iterations: data.iterations,
                length: data.length,
                digest: data.digest,
            },
            keychainId: data.keychain_id,
            reference: data.reference,
        };
    }

    public async updateSecret(auth: ShieldAuthOptions, share: Share, requestId?: string): Promise<void> {
        const requestBody = {
                "secret": share.secret,
                "entropy": share.entropy,
                "salt": share.encryptionParameters?.salt,
                "iterations": share.encryptionParameters?.iterations,
                "length": share.encryptionParameters?.length,
                "digest": share.encryptionParameters?.digest,
                "encryption_part": auth.encryptionPart || "",
                "encryption_session": auth.encryptionSession || "",
                "reference": share.reference || "",
                "keychain_id": share.keychainId || "",
        };

        let response: AxiosResponse;
        try {
            response = await this._put(`${this._baseURL}/shares`, this.getAuthHeaders(auth, requestId), requestBody);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.data.includes("EC_MISSING")) {
                    throw new EncryptionPartMissingError("Encryption part missing");
                }
            } else {
                console.error(error);
                throw new Error(error);
            }
        }
    }

    public async deleteSecret(auth: ShieldAuthOptions, requestId?: string, reference?: string): Promise<void> {
        let url = `${this._baseURL}/shares`;
        if (reference && reference !== null && reference !== undefined) {
            url = `${url}/${reference}`;
        }

        let response: AxiosResponse;

        try {
            response = await this._delete(url, this.getAuthHeaders(auth, requestId))
        } catch (error) {
            throw new Error(error);
        }
    }

    private async getEncryptionMethodBulk(url: string, bodyListname: string, auth: ShieldAuthOptions, keys: string[], requestId?: string): Promise<Map<string, string>> {
        // both methods (references and users) expect a similar input JSON
        // reference/bulk expects "references": string[] and user/bulk expects "user_ids": string[]
        let response: AxiosResponse;
        try {
            response = await this._post(url, this.getAuthHeaders(auth, requestId), { [bodyListname]: keys });
            const data = response.data;

            const returnValue: Map<string, string> = new Map();

            for (const key in data.encryption_types) {
                const info = data.encryption_types[key]
                // Shield returns either found or not found regardless of input references/users to avoid falling
                // in "snitchy" 403 situations, we'll only care about found occurences here though
                if (info['status'] === 'found') {
                    returnValue.set(key, info['encryption_type']);
                }
            }

            return returnValue;
        } catch (error) {
            throw new Error(error);
        }
    }

    public async getEncryptionMethodsBySignerReferences(auth: ShieldAuthOptions, signers: string[], requestId?: string): Promise<Map<string, string>> {
        return this.getEncryptionMethodBulk(`${this._baseURL}/shares/encryption/reference/bulk`, 'references', auth, signers, requestId);
    }

    public async getEncryptionMethodsByOwnerId(auth: ShieldAuthOptions, users: string[], requestId?: string): Promise<Map<string, string>> {
        return this.getEncryptionMethodBulk(`${this._baseURL}/shares/encryption/user/bulk`, 'user_ids', auth, users, requestId);
    }

    private async createSecret(path: string, share: Share, auth: ShieldAuthOptions, requestId?: string) {
        const requestBody = {
                "secret": share.secret,
                "entropy": share.entropy,
                "salt": share.encryptionParameters?.salt,
                "iterations": share.encryptionParameters?.iterations,
                "length": share.encryptionParameters?.length,
                "digest": share.encryptionParameters?.digest,
                "encryption_part": auth.encryptionPart || "",
                "encryption_session": auth.encryptionSession || "",
                "reference": share.reference || "",
                "keychain_id": share.keychainId || "",
            };
        
        let response: AxiosResponse;
        try {
            response = await this._post(`${this._baseURL}/${path}`, this.getAuthHeaders(auth, requestId), requestBody);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.data.includes("EC_MISSING")) {
                    throw new EncryptionPartMissingError("Encryption part missing")
                }
                if (error.response.status === axios.HttpStatusCode.Conflict) {
                    throw new SecretAlreadyExistsError("Secret already exists for the given auth options");
                }
            }
        }
    }

    public async preRegister(share: Share, auth: ShieldAuthOptions, requestId?: string): Promise<void> {
        await this.createSecret("admin/preregister", share, auth, requestId);
    }

    public async storeSecret(share: Share, auth: ShieldAuthOptions, requestId?: string): Promise<void> {
        await this.createSecret("shares", share, auth, requestId);
    }


    private isOpenfortAuthOptions(options: ShieldAuthOptions): options is OpenfortAuthOptions {
        return 'openfortOAuthToken' in options;
    }


    private isCustomAuthOptions(options: ShieldAuthOptions): options is CustomAuthOptions {
        return 'customToken' in options;
    }

    private getAuthHeaders(options: ShieldAuthOptions, requestId?: string): Record<string, string> {
        const headers: Record<string, string> = {
            "x-api-key": this._apiKey,
            "x-auth-provider": options.authProvider,
            "Access-Control-Allow-Origin": this._baseURL,
        };

        if (requestId) {
            headers[this._requestIdHeader] = requestId;
        }

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

        if (options.encryptionSession) {
            headers["x-encryption-session"] = options.encryptionSession;
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
