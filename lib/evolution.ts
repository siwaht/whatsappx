import axios from 'axios';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

export const evolutionApi = axios.create({
    baseURL: EVOLUTION_API_URL,
    headers: {
        'apikey': EVOLUTION_API_KEY,
        'Content-Type': 'application/json',
    },
});

export const Evolution = {
    instance: {
        create: async (instanceName: string) => {
            return evolutionApi.post('/instance/create', { instanceName });
        },
        fetchInstances: async () => {
            return evolutionApi.get('/instance/fetchInstances');
        },
        connect: async (instanceName: string) => {
            return evolutionApi.get(`/instance/connect/${instanceName}`);
        },
        logout: async (instanceName: string) => {
            return evolutionApi.delete(`/instance/logout/${instanceName}`);
        },
        delete: async (instanceName: string) => {
            return evolutionApi.delete(`/instance/delete/${instanceName}`);
        },
        restart: async (instanceName: string) => {
            return evolutionApi.put(`/instance/restart/${instanceName}`);
        },
        connectionState: async (instanceName: string) => {
            return evolutionApi.get(`/instance/connectionState/${instanceName}`);
        },
    },
    message: {
        sendText: async (instanceName: string, remoteJid: string, text: string) => {
            return evolutionApi.post(`/message/sendText/${instanceName}`, {
                number: remoteJid,
                text,
            });
        },
    },
    // Add more endpoints as needed
};
