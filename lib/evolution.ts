import axios, { AxiosError } from 'axios';
import type {
  EvolutionInstance,
  EvolutionMessage,
  EvolutionContact,
  SendMessageRequest,
  InstanceSettings,
  WebhookConfig,
  ApiResponse
} from './types';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

export const evolutionApi = axios.create({
    baseURL: EVOLUTION_API_URL,
    headers: {
        'apikey': EVOLUTION_API_KEY,
        'Content-Type': 'application/json',
    },
});

const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.message ||
      'An error occurred while communicating with Evolution API'
    );
  }
  throw error;
};

export const Evolution = {
    instance: {
        create: async (instanceName: string): Promise<ApiResponse<EvolutionInstance>> => {
            try {
                const response = await evolutionApi.post('/instance/create', { instanceName });
                return { success: true, data: response.data };
            } catch (error) {
                return {
                    success: false,
                    error: { message: handleApiError(error) }
                };
            }
        },
        fetchInstances: async (): Promise<ApiResponse<EvolutionInstance[]>> => {
            try {
                const response = await evolutionApi.get('/instance/fetchInstances');
                return { success: true, data: response.data };
            } catch (error) {
                return {
                    success: false,
                    error: { message: handleApiError(error) }
                };
            }
        },
        connect: async (instanceName: string): Promise<ApiResponse<{ qrcode?: string }>> => {
            try {
                const response = await evolutionApi.get(`/instance/connect/${instanceName}`);
                return { success: true, data: response.data };
            } catch (error) {
                return {
                    success: false,
                    error: { message: handleApiError(error) }
                };
            }
        },
        logout: async (instanceName: string): Promise<ApiResponse<void>> => {
            try {
                await evolutionApi.delete(`/instance/logout/${instanceName}`);
                return { success: true };
            } catch (error) {
                return {
                    success: false,
                    error: { message: handleApiError(error) }
                };
            }
        },
        delete: async (instanceName: string): Promise<ApiResponse<void>> => {
            try {
                await evolutionApi.delete(`/instance/delete/${instanceName}`);
                return { success: true };
            } catch (error) {
                return {
                    success: false,
                    error: { message: handleApiError(error) }
                };
            }
        },
        restart: async (instanceName: string): Promise<ApiResponse<void>> => {
            try {
                await evolutionApi.put(`/instance/restart/${instanceName}`);
                return { success: true };
            } catch (error) {
                return {
                    success: false,
                    error: { message: handleApiError(error) }
                };
            }
        },
        connectionState: async (instanceName: string): Promise<ApiResponse<{ state: string }>> => {
            try {
                const response = await evolutionApi.get(`/instance/connectionState/${instanceName}`);
                return { success: true, data: response.data };
            } catch (error) {
                return {
                    success: false,
                    error: { message: handleApiError(error) }
                };
            }
        },
        setSettings: async (instanceName: string, settings: InstanceSettings): Promise<ApiResponse<void>> => {
            try {
                await evolutionApi.post(`/settings/set/${instanceName}`, settings);
                return { success: true };
            } catch (error) {
                return {
                    success: false,
                    error: { message: handleApiError(error) }
                };
            }
        },
    },
    message: {
        sendText: async (instanceName: string, data: SendMessageRequest): Promise<ApiResponse<EvolutionMessage>> => {
            try {
                const response = await evolutionApi.post(`/message/sendText/${instanceName}`, data);
                return { success: true, data: response.data };
            } catch (error) {
                return {
                    success: false,
                    error: { message: handleApiError(error) }
                };
            }
        },
        sendMedia: async (instanceName: string, data: SendMessageRequest): Promise<ApiResponse<EvolutionMessage>> => {
            try {
                const response = await evolutionApi.post(`/message/sendMedia/${instanceName}`, data);
                return { success: true, data: response.data };
            } catch (error) {
                return {
                    success: false,
                    error: { message: handleApiError(error) }
                };
            }
        },
    },
    contact: {
        fetchContacts: async (instanceName: string): Promise<ApiResponse<EvolutionContact[]>> => {
            try {
                const response = await evolutionApi.get(`/chat/fetchContacts/${instanceName}`);
                return { success: true, data: response.data };
            } catch (error) {
                return {
                    success: false,
                    error: { message: handleApiError(error) }
                };
            }
        },
    },
    webhook: {
        setWebhook: async (instanceName: string, config: WebhookConfig): Promise<ApiResponse<void>> => {
            try {
                await evolutionApi.post(`/webhook/set/${instanceName}`, config);
                return { success: true };
            } catch (error) {
                return {
                    success: false,
                    error: { message: handleApiError(error) }
                };
            }
        },
        getWebhook: async (instanceName: string): Promise<ApiResponse<WebhookConfig>> => {
            try {
                const response = await evolutionApi.get(`/webhook/find/${instanceName}`);
                return { success: true, data: response.data };
            } catch (error) {
                return {
                    success: false,
                    error: { message: handleApiError(error) }
                };
            }
        },
    },
};
