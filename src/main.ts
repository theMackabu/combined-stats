import 'dotenv/config';
import 'reflect-metadata';
import { Client } from 'discordx';
import { QuickDB } from 'quick.db';
import { Koa } from '@discordx/koa';
import { IntentsBitField, ActivityType } from 'discord.js';
import { dirname, importx } from '@discordx/importer';
import type { Interaction, Message } from 'discord.js';
import render from 'koa-ejs';
import path from 'path';

export const client = new Client({
	botGuilds: [(bot) => bot.guilds.cache.map((guild) => guild.id)],
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.GuildMessageReactions,
		IntentsBitField.Flags.GuildVoiceStates,
	],
	presence: {
		status: 'online',
		afk: false,
		activities: [{ name: `hypixel duels`, type: ActivityType.Playing }],
	},
	silent: false,
	simpleCommand: {
		prefix: '!',
	},
});

client.once('ready', async () => {
	await client.guilds.fetch();
	await client.initApplicationCommands();

	console.log('Discord bot has started');
});

client.on('interactionCreate', (interaction: Interaction) => {
	client.executeInteraction(interaction);
});

client.on('messageCreate', (message: Message) => {
	client.executeCommand(message);
});

async function run() {
	await importx(dirname(import.meta.url) + '/{events,commands,api}/**/*.{ts,js}');

	if (!process.env.BOT_TOKEN) {
		throw Error('Could not find BOT_TOKEN in your environment');
	}

	await client.login(process.env.BOT_TOKEN);
	const server = new Koa();
	await server.build();

	const port = process.env.PORT ?? 3000;
	server.listen(port, () => {
		console.log(`Started web interface at [::]:${port}`);
		console.log(`Quick reference: 'http://127.0.0.1:${port}/api'`);

		render(server, {
			root: 'src/views',
			layout: false,
			viewExt: 'html',
			cache: false,
		});
	});
}

run();
