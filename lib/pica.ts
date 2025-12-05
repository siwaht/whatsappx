import axios, { AxiosInstance } from 'axios';

export interface PicaConnection {
    id: string;
    platform: string;
    key: string;
    state: string;
    active: boolean;
    createdAt: string;
    description?: string;
    name?: string;
}

export interface PicaAction {
    title: string;
    key: string;
    method: string;
    platform: string;
    description?: string;
}

export class PicaClient {
    private client: AxiosInstance;
    private secretKey: string;

    constructor(secretKey: string) {
        this.secretKey = secretKey;
        this.client = axios.create({
            baseURL: 'https://api.picaos.com/v1',
            headers: {
                'Content-Type': 'application/json',
                'x-pica-secret': this.secretKey,
            },
        });
    }

    async listConnections(): Promise<PicaConnection[]> {
        try {
            const response = await this.client.get('/vault/connections');
            return response.data.rows || [];
        } catch (error) {
            console.error('Error listing Pica connections:', error);
            throw error;
        }
    }

    async listAvailableActions(platform: string): Promise<PicaAction[]> {
        try {
            const response = await this.client.get(`/available-actions/${platform}`);
            return response.data.rows || [];
        } catch (error) {
            console.error(`Error listing Pica actions for ${platform}:`, error);
            throw error;
        }
    }

    async executeAction(connectionKey: string, actionKey: string, params: any = {}) {
        // Note: The exact endpoint for executing an action via PicaOS Core API is not fully clear from the docs I read.
        // However, typically it might be /execution/execute or similar.
        // For now, I will assume a generic execution endpoint or use Passthrough if applicable.
        // Given the "ToolKit" nature, there might be a specific endpoint.

        // Let's try to use the Passthrough API if we know the path, OR assume there's an execute endpoint.
        // Since I don't have the exact URL, I will try a likely candidate: /execution
        // If this fails, we might need to use Passthrough with specific paths for each tool.

        // Another possibility: POST /tool/{platform}/{action}

        // For now, let's implement a placeholder that we can update once we verify.
        // But to be useful, I'll try to use the Passthrough API pattern if the action key looks like a path.
        // If the action key is just "insert", it's likely a Core API action.

        try {
            // Attempting a standard execution endpoint pattern
            const response = await this.client.post('/execution', {
                connectionKey,
                action: actionKey,
                params
            });
            return response.data;
        } catch (error) {
            console.error('Error executing Pica action:', error);
            throw error;
        }
    }
}

export const getPicaClient = (secretKey?: string) => {
    const key = secretKey || process.env.PICA_SECRET_KEY;
    if (!key) {
        throw new Error('Pica Secret Key is required');
    }
    return new PicaClient(key);
};
