/*
 * Copyright (c) 2026 Girls Network
 * Licensed under the GN-NCSL-1.1 Licence.
 * See LICENCE in the project root for full licence information.
 */

import { 
    CommandInteraction, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    Client,
    Collection
} from 'discord.js';

interface BotCommand {
    data: any;
    execute: (interaction: CommandInteraction, client: any) => Promise<void>;
}

const COMMANDS_PER_PAGE = 5;

export default {
    data: {
        name: 'help',
        description: 'View all available commands and their details.',
    },

    async execute(interaction: CommandInteraction, client: any) {
        if (!interaction.isChatInputCommand()) return;

        const commandList: string[] = [];
        
        client.commands.forEach((cmd: BotCommand) => {
            const data = cmd.data;
            commandList.push(`**/${data.name}**\n└ ${data.description}`);
        });

        const totalPages = Math.ceil(commandList.length / COMMANDS_PER_PAGE);
        const page = 0;

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
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId(`help_next:${page}`)
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(totalPages <= 1)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};