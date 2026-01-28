import { Client, Collection, REST, Routes } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { log, logError } from '../utils/logger';
import chalk from 'chalk';

interface BotCommand {
    data: any;
    execute: (interaction: any, client: any) => Promise<void>;
}

interface ExtendedClient extends Client {
    commands: Collection<string, BotCommand>;
}

export async function loadCommands(client: ExtendedClient): Promise<void> {
    client.commands = new Collection();
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath).default;

        if (command && command.data && command.execute) {
            client.commands.set(command.data.name, command);
        }
    }
    
    log(chalk.cyanBright('Loading commands'));
}

export async function deployCommands(client: ExtendedClient): Promise<void> {
    const TOKEN = process.env.GAYBOT_TOKEN;
    const CLIENT_ID = process.env.GAYBOT_CLIENT_ID;
    const GUILD_ID = process.env.GAYBOT_GUILD_ID;

    if (!CLIENT_ID || !TOKEN) {
        logError(new Error('Missing CLIENT_ID or BOT_TOKEN'), 'Commands');
        return;
    }

    if (CLIENT_ID === 'Client ID' || TOKEN === 'Token' ) {
        logError(new Error('Default Values'), 'Commands')
        process.exit(1)
    }

    const rest = new REST({ version: '10' }).setToken(TOKEN);
    const commands = client.commands.map(cmd => cmd.data);

    try {
        log(chalk.yellow('Deploying commands'));
        
        // Always deploy globally
        log(chalk.yellow('Deploying globally (may take up to 1 hour to propagate)'));
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands }
        );
        log(chalk.greenBright('Global commands deployed successfully'));
        
        // Additionally deploy to test guild if specified (instant)
        if (GUILD_ID) {
            log(chalk.yellow(`Also deploying to guild ${GUILD_ID} for instant testing`));
            await rest.put(
                Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
                { body: commands }
            );
            log(chalk.greenBright('Guild commands deployed successfully'));
        }
    } catch (error) {
        logError(error, 'Commands');
    }
}