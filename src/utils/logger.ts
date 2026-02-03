/*
 * Copyright (c) 2026 Girls Network
 * Licensed under the GN-NCSL-1.1 Licence.
 * See LICENCE in the project root for full licence information.
 */

import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

const LOG_DIR = path.join(process.cwd(), '.logs');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

function getTimestamp(): string {
    return new Date().toISOString();
}

export function log(message: string): void {
    const timestamp = getTimestamp();
    const formatted = chalk.grey(`[${timestamp}]`);
    console.log(`${formatted} ${message}`);
}

export function logError(error: Error | unknown, context?: string): void {
    const timestamp = getTimestamp();
    const formatted = chalk.grey(`[${timestamp}]`);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : '';
    
    const logContent = `${formatted} ERROR${context ? ` (${context})` : ''}: ${errorMessage}\n${stack}\n\n`;
    
    // Write to error log file
    const filename = `error-${new Date().toISOString().split('T')[0]}.log`;
    fs.appendFileSync(path.join(LOG_DIR, filename), logContent);

    console.error(chalk.redBright(`There was an error, see: ${filename}`))
}

export function logBoot(): void {
    console.log(chalk.magentaBright('\n╔════════════════════════════════════════════════════════════╗'));
    console.log(chalk.magentaBright('║  GayBot Revamped v2.1.0 - Girls Network Technologies Ltd   ║'));
    console.log(chalk.magentaBright('╚════════════════════════════════════════════════════════════╝\n'));
} 