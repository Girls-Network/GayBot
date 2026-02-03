/*
 * Copyright (c) 2026 Girls Network
 * Licensed under the GN-NCSL-1.1 Licence.
 * See LICENCE in the project root for full licence information.
 */

import { 
    Interaction, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    Collection
} from 'discord.js';
import { handleCommandError, handleInteractionError } from '../handlers/errorHandler';

interface ExtendedClient {
    commands: Collection<string, any>;
}

const COMMANDS_PER_PAGE = 5;

export default {
    name: 'interactionCreate',
    async execute(interaction: Interaction) {
        const client = interaction.client as unknown as ExtendedClient;

        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction, client);
            } catch (error) {
                await handleCommandError(error, interaction);
            }
        }

        // Handle help pagination buttons
        if (interaction.isButton()) {
            const [action, currentPageStr] = interaction.customId.split(':');
            if (!action.startsWith('help_')) return;

            try {
                let page = parseInt(currentPageStr);
                if (action === 'help_next') page++;
                if (action === 'help_prev') page--;

                const commandList: string[] = [];
                client.commands.forEach((cmd) => {
                    commandList.push(`**/${cmd.data.name}**\n└ ${cmd.data.description}`);
                });

                const totalPages = Math.ceil(commandList.length / COMMANDS_PER_PAGE);

                const embed = new EmbedBuilder()
                    .setTitle('📖 Available Commands')
                    .setDescription(commandList.slice(page * COMMANDS_PER_PAGE, (page + 1) * COMMANDS_PER_PAGE).join('\n\n'))
                    .setFooter({ text: `Page ${page + 1} of ${totalPages}` })
                    .setColor(0x5865F2);

                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`help_prev:${page}`)
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId(`help_next:${page}`)
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page >= totalPages - 1)
                );

                await interaction.update({ embeds: [embed], components: [row] });
            } catch (error) {
                await handleInteractionError(error, interaction);
            }
        }
    },
};