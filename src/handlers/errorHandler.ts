/*
 * Copyright (c) 2026 Girls Network
 * Licensed under the GN-NCSL-1.1 Licence.
 * See LICENCE in the project root for full licence information.
 */

import { logError } from '../utils/logger';
import { CommandInteraction, Interaction } from 'discord.js';

export async function handleCommandError(error: Error | unknown, interaction: CommandInteraction): Promise<void> {
    logError(error, `Command: ${interaction.commandName}`);

    const errorMessage = 'An error occurred while executing this command.';

    try {
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: errorMessage });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    } catch (replyError) {
        logError(replyError, 'Error Handler Reply');
    }
}

export async function handleInteractionError(error: Error | unknown, interaction: Interaction): Promise<void> {
    logError(error, `Interaction: ${interaction.id}`);

    const errorMessage = 'An error occurred while processing this interaction.';

    try {
        if (interaction.isRepliable()) {
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: errorMessage });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    } catch (replyError) {
        logError(replyError, 'Error Handler Reply');
    }
}