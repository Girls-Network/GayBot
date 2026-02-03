/*
 * Copyright (c) 2026 Girls Network
 * Licensed under the GN-NCSL-1.1 Licence.
 * See LICENCE in the project root for full licence information.
 */

import { 
    CommandInteraction, 
    EmbedBuilder,
    MessageFlags
} from 'discord.js';

export default {
    data: {
        name: 'ping',
        description: 'Replies with Pong and displays latencies.',
    },

    async execute(interaction: CommandInteraction, client: any) {
        if (!interaction.isChatInputCommand()) return;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const sent = await interaction.editReply({ content: 'Pinging...' });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = client.ws.ping;

        const embed = new EmbedBuilder()
            .setTitle('🌐 Latency Check Complete')
            .setDescription(
                `Pong! 🏓\n**Command Latency**: **${latency}ms**\n**API Latency**: **${apiLatency}ms**`
            )
            .setColor(0x2ecc71);

        await interaction.editReply({ content: '', embeds: [embed] });
    },
};