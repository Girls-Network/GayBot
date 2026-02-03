/*
 * Copyright (c) 2026 Girls Network
 * Licensed under the GN-NCSL-1.1 Licence.
 * See LICENCE in the project root for full licence information.
 */

import { Message, PartialMessage } from 'discord.js';
import emojiConfigData from '../configs/emoji-config.json';
import chalk from 'chalk';

interface EmojiConfig {
    emoji: string;
    title: string;
    keywords: string[];
}

interface ReactionQueueEntry {
    message: Message | PartialMessage;
    emoji: string;
}

// Load emoji configuration
const emojis: EmojiConfig[] = emojiConfigData as EmojiConfig[];

// Keyword Checker
export class KeywordChecker {
    private emojiMap: EmojiConfig[];

    constructor() {
        this.emojiMap = emojis;
    }

    public getMatchingEmojis(messageContent: string): string[] {
        if (!messageContent || typeof messageContent !== 'string') {
            return [];
        }

        const lowerMessage = messageContent.toLowerCase();
        const foundEmojis = new Set<string>();

        this.emojiMap.forEach(item => {
            const matchFound = item.keywords.some(keyword => {
                const lowerKeyword = keyword.toLowerCase();

                // Check if keyword is a Discord mention
                if (lowerKeyword.startsWith('<@') && lowerKeyword.endsWith('>')) {
                    // For mentions, do exact string matching (case-insensitive)
                    return lowerMessage.includes(lowerKeyword);
                }

                // For regular keywords, use word boundary regex
                const escapedKeyword = lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const pluralization = '(s|es)?';
                const regex = new RegExp(`\\b${escapedKeyword}${pluralization}\\b`);
                return regex.test(lowerMessage);
            });

            if (matchFound) {
                foundEmojis.add(item.emoji);
            }
        });

        return Array.from(foundEmojis);
    }
}

// Reaction Queue Processor
let isProcessing = false;

export async function processReactionQueue(queue: ReactionQueueEntry[]): Promise<void> {
    if (isProcessing || queue.length === 0) {
        return;
    }

    isProcessing = true;

    const entry = queue.shift();
    if (entry) {
        try {
            const message = await entry.message.fetch();
            await message.react(entry.emoji);
        } catch (error) {
            console.error(chalk.redBright`Failed to react with ${entry.emoji}:`, error);
        }
    }

    isProcessing = false;

    // Continue processing if queue has more items
    if (queue.length > 0) {
        setTimeout(() => processReactionQueue(queue), 500);
    }
}
