import { 
    CommandInteraction, 
    EmbedBuilder,
    ApplicationCommandOptionType
} from 'discord.js';

// Override map for specific user IDs
const gaynessOverrides = new Map<string, number>([
    ['652597508027187240', 101],
    ['1025770042245251122', 69],
]);

function calculateGayness(userId: string): number {
    // Check for override first
    if (gaynessOverrides.has(userId)) {
        return gaynessOverrides.get(userId)!;
    }
    
    // Weekly seeded randomness
    const weekSeed = Math.floor(Date.now() / 604800000);
    const seededInput = userId + weekSeed;
    let hash = 0;
    for (let i = 0; i < seededInput.length; i++) {
        hash = seededInput.charCodeAt(i) + ((hash << 5) - hash);
        hash |= 0;
    }
    return Math.abs(hash % 101);
}

export default {
    data: {
        name: 'gaycounter',
        description: 'Find out how gay a user is!',
        options: [
            {
                type: ApplicationCommandOptionType.User,
                name: 'target',
                description: 'The user to check.',
                required: false // Changed to false
            }
        ],
    },
    async execute(interaction: CommandInteraction, client: any) {
        if (!interaction.isChatInputCommand()) return;

        // Get target user or default to command user
        const targetUser = interaction.options.getUser('target') || interaction.user;

        await interaction.deferReply();

        const gayness = calculateGayness(targetUser.id);

        let message = '';
        if (gayness < 20) {
            message = `**${targetUser.username}** is **${gayness}% gay**! Keep shining! 🌈`;
        } else if (gayness <= 80) {
            message = `**${targetUser.username}** is **${gayness}% gay**! That's a good spectrum position! 😉`;
        } else {
            message = `**${targetUser.username}** is **${gayness}% gay**! Congratulations, that's max gay energy! ✨`;
        }

        const embed = new EmbedBuilder()
            .setTitle('🏳️‍🌈 Gayness Percentage Calculator')
            .setDescription(message)
            .setColor(0x8e44ad);

        await interaction.editReply({ embeds: [embed] });
    },
};
