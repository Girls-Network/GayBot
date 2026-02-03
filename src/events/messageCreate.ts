/*
 * Copyright (c) 2026 Girls Network
 * Licensed under the GN-NCSL-1.1 Licence.
 * See LICENCE in the project root for full licence information.
 */

import { Message } from 'discord.js';
import { KeywordChecker } from '../utils/reactionSystem';

interface ReactionQueueEntry {
    message: Message;
    emoji: string;
}

interface ExtendedClient {
    reactionQueue: ReactionQueueEntry[];
}

const keywordChecker = new KeywordChecker();

export default {
    name: 'messageCreate',
    async execute(message: Message) {
        // Ignore bot messages
        if (message.author.bot) return;
        if (!message.content) return;

        const client = message.client as unknown as ExtendedClient;
        const matchingEmojis = keywordChecker.getMatchingEmojis(message.content);

        if (matchingEmojis.length > 0) {
            for (const emoji of matchingEmojis) {
                client.reactionQueue.push({
                    message: message,
                    emoji: emoji
                });
            }
        }
    },
};