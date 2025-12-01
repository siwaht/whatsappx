import OpenAI from 'openai';

export class AIClient {
    private client: OpenAI;

    constructor(apiKey?: string) {
        this.client = new OpenAI({
            apiKey: apiKey || process.env.OPENAI_API_KEY,
        });
    }

    async generateCompletion(
        systemPrompt: string,
        userMessage: string,
        model: string = 'gpt-4o',
        temperature: number = 0.7
    ): Promise<string | null> {
        try {
            const response = await this.client.chat.completions.create({
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage },
                ],
                temperature: temperature,
            });

            return response.choices[0]?.message?.content || null;
        } catch (error) {
            console.error('Error generating AI completion:', error);
            return null;
        }
    }
}

// Singleton instance for default usage
let aiClient: AIClient;

export function getAIClient(apiKey?: string): AIClient {
    if (apiKey) {
        return new AIClient(apiKey);
    }
    if (!aiClient) {
        aiClient = new AIClient();
    }
    return aiClient;
}
