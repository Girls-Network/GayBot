import { 
    CommandInteraction, 
    EmbedBuilder,
    ApplicationCommandOptionType,
    GuildMember
} from 'discord.js';

// NOTE: Using girlsnetwork.dev API
interface ApiResponse {
    content: string;
    type: 'gender' | 'sexuality';
}

/**
 * Normalize the search term by converting to lowercase and removing plural forms
 */
function normalizeTerm(term: string): string {
    let normalized = term.toLowerCase().trim();
    
    // Remove common plural endings
    if (normalized.endsWith('ies')) {
        normalized = normalized.slice(0, -3) + 'y';
    } else if (normalized.endsWith('es')) {
        normalized = normalized.slice(0, -2);
    } else if (normalized.endsWith('s') && normalized.length > 2) {
        // Don't remove 's' from short words or words that might naturally end in 's'
        const exceptionsEndingInS = ['trans', 'nonbinary', 'genderless', 'ageless'];
        if (!exceptionsEndingInS.includes(normalized)) {
            normalized = normalized.slice(0, -1);
        }
    }
    
    return normalized;
}

async function searchLgbtqTerm(term: string): Promise<ApiResponse | null> {
    const normalizedTerm = normalizeTerm(term);
    
    // Use environment variable for API base URL, defaulting to production
    const apiBase = 'https://api.girlsnetwork.dev';
    const apiURL = `${apiBase}/api/${encodeURIComponent(normalizedTerm)}`;

    try {
        const response = await fetch(apiURL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });
        
        
        if (!response.ok) {
            // API returns 404 if not found
            if (response.status === 404) {
                console.log(`[LGBTQ Search] Term not found (404)`);
                return null;
            }
            console.log(`[LGBTQ Search] API error: ${response.status} ${response.statusText}`);
            const errorText = await response.text().catch(() => 'Unable to read error');
            console.log(`[LGBTQ Search] Error response: ${errorText}`);
            return null;
        }
        const rawText = await response.text();
        const data: ApiResponse = JSON.parse(rawText) as ApiResponse;

        return data;
    } catch (error) {
        console.error(`[LGBTQ Search] Fetch error:`, error);
        return null;
    }
}

export default {
    data: {
        name: 'lgbtqsearch',
        description: 'Search for definitions of LGBTQIA+ terms',
        options: [
            {
                type: ApplicationCommandOptionType.String,
                name: 'term',
                description: 'The term or sexuality to look up (e.g., agender, bi, nonbinary).',
                required: true
            },
            {
                type: ApplicationCommandOptionType.User,
                name: 'member',
                description: 'Optional: A member to ping with the result.',
                required: false
            }
        ],
    },

    async execute(interaction: CommandInteraction, client: any) {
        if (!interaction.isChatInputCommand()) return;

        const searchTerm = interaction.options.getString('term', true);
        const targetMember = interaction.options.getMember('member') as GuildMember | null;

        await interaction.deferReply();

        const termData = await searchLgbtqTerm(searchTerm);

        let content = '';
        let replyEmbed: EmbedBuilder;

        if (termData) {
            // Capitalize the type for display
            const categoryDisplay = termData.type.charAt(0).toUpperCase() + termData.type.slice(1);

            replyEmbed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle(`🏳️‍🌈 Term: **${searchTerm}**`)
                .setDescription(termData.content)
                .addFields(
                    { name: 'Category', value: categoryDisplay, inline: true },
                    { name: 'Source', value: 'girlsnetwork.dev', inline: true }
                )
                .setFooter({ text: `Searched term: ${searchTerm}` });

            if (targetMember) {
                content = `Hey ${targetMember}! Here is the information you requested about **${searchTerm}**.`;
            }
        } else {
            replyEmbed = new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle('Term Not Found 🔎')
                .setDescription(`Could not find a definition for **"${searchTerm}"** in the database. Missing information? Open an issue on our [github](https://github.com/Girls-Network/LGBT-API/issues)`)
                .setFooter({ text: `API Source: girlsnetwork.dev` });

            if (targetMember) {
                content = `${targetMember}, I couldn't find a definition for **${searchTerm}**.`;
            }
        }

        await interaction.editReply({ 
            content: content, 
            embeds: [replyEmbed] 
        });
    },
};