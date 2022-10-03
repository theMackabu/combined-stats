// Gamespeed LTD 2022. All Rights Reserved.
// module: profile.ts
// This file is licensed under the GPL-3 License.
// License text available at https://www.gnu.org/licenses/gpl-3.0.en.html

import got from 'got';
import { QuickDB } from 'quick.db';
import { EmbedBuilder } from 'discord.js';
import { Pagination } from '@discordx/pagination';
import type { CommandInteraction, Message } from 'discord.js';
import { Discord, MetadataStorage, Slash, SlashOption } from 'discordx';

@Discord()
export class Profile {
	@Slash({
		description: 'View your profile',
		name: 'view_profile',
	})
	async view(
		@SlashOption({ description: 'Discord tag', name: 'tag', required: false }) discord_id: string,
		command: CommandInteraction
	): Promise<void> {
		const db = new QuickDB({ filePath: 'data.sqlite' });
		const formatted_discord_id = discord_id ? discord_id.slice(2).slice(0, -1) : null;
		const accounts: any = await db.get(`${formatted_discord_id ? formatted_discord_id : command?.user.id}.accounts`);
		let accountList: any = [];
		try {
			Promise.all(
				Object.keys(accounts).map(async (username: any) => {
					accountList.push(`\`${username}\` - [${accounts[username]}](https://25karma.xyz/player/${accounts[username]})\n`);
				})
			).then(async () => {
				await command.reply({
					embeds: [
						{
							description: discord_id
								? `***${discord_id}'s linked accounts***\n\n` + accountList.join(' ')
								: '***Your linked accounts***\n\n' + accountList.join(' '),
							footer: {
								text: `${Object.keys(accounts).length} account${Object.keys(accounts).length === 1 ? ' is' : 's are'} linked to this profile.`,
							},
						},
					],
				});
			});
		} catch (err) {
			console.log(err);
			await command.reply({
				embeds: [
					{
						description: discord_id
							? `***${discord_id}'s has no linked accounts***\n` + '\nTry using `account_add` command'
							: '***You have no accounts linked***\n' + '\nTry using `account_add` command',
					},
				],
			});
		}
	}

	@Slash({
		description: 'Add usernames to profile',
		name: 'account_add',
	})
	async add(
		@SlashOption({ description: 'Seperate each account by commas', name: 'accounts' }) usernames: string,
		command: CommandInteraction
	): Promise<void> {
		let uuidList: any = [];
		let error: string = '';

		const db = new QuickDB({ filePath: 'data.sqlite' });
		const embed = new EmbedBuilder();
		const userList = usernames.trim().replace(/,\s*$/, '').split(',');

		Promise.all(
			userList.map(async (username: any) => {
				await got
					.get(`https://api.mojang.com/users/profiles/minecraft/${username}`)
					.json()
					.catch((err) => console.log(err.message))
					.then((data: any) => {
						db.push(`${command?.user.id}.accounts.${username}`, data.id);
					});
			})
		)
			.catch(async (err) => {
				error = err.message;
				await command.reply({
					embeds: [
						{
							description: `**Failed to add accounts, please try again**\n${err.message}`,
							footer: { text: 'tip: this account name may not exist' },
						},
					],
				});
			})
			.then(async () => {
				if (error == '') {
					embed.setFooter({
						text: `Added ${userList.length} account${userList.length === 1 ? '' : 's'}.`,
					});
					embed.addFields({
						name: 'Accounts successfully added to profile:',
						value: userList.join(', '),
					});

					await command.reply({ embeds: [embed] });
				}
			});
	}

	@Slash({
		description: 'Remove usernames from profile',
		name: 'account_remove',
	})
	async remove(
		@SlashOption({ description: 'Seperate each account by commas', name: 'accounts' }) usernames: string,
		command: CommandInteraction
	): Promise<void> {
		const db = new QuickDB({ filePath: 'data.sqlite' });
		const accounts: any = await db.get(`${command?.user.id}.accounts`);
		const userList = usernames.trim().replace(/,\s*$/, '').split(',');

		userList.map(async (username: any) => {
			await db.delete(`${command?.user.id}.accounts.${username}`);
		});

		const embed = new EmbedBuilder()
			.setFooter({
				text: `Removed ${usernames.trim().replace(/,\s*$/, '').split(',').length} account${
					usernames.trim().replace(/,\s*$/, '').split(',').length === 1 ? '' : 's'
				}.`,
			})
			.addFields({ name: 'Accounts successfully removed from profile:', value: usernames.trim().replace(/,\s*$/, '').split(',').join(', ') });

		await command.reply({ embeds: [embed] });
	}
}
