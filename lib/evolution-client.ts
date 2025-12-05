import { prisma } from '@/lib/prisma';
import { getEvolutionAPI, EvolutionAPIClient } from '@/lib/evolution-api';

export async function getEvolutionClientForUser(userId: number): Promise<EvolutionAPIClient> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { evolutionApiUrl: true, evolutionApiKey: true }
    });

    if (user?.evolutionApiUrl && user?.evolutionApiKey) {
        return new EvolutionAPIClient(user.evolutionApiUrl, user.evolutionApiKey);
    }

    return getEvolutionAPI();
}

export async function getEvolutionClientForInstance(instanceName: string): Promise<EvolutionAPIClient> {
    const config = await prisma.instanceConfig.findUnique({
        where: { instanceName },
        include: { user: true }
    });

    if (config?.user?.evolutionApiUrl && config?.user?.evolutionApiKey) {
        return new EvolutionAPIClient(config.user.evolutionApiUrl, config.user.evolutionApiKey);
    }

    return getEvolutionAPI();
}
