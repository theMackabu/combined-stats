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
				accounts.map(async (account: any) => {
					const uuid: any = await got
						.get(`https://api.mojang.com/users/profiles/minecraft/${account}`)
						.json()
						.catch((err) => console.log(err));
					accountList.push(`\`${account}\` - [${uuid ? uuid.id : '__invalid player__'}](${uuid ? 'https://25karma.xyz/player/' + uuid.id : ''})\n`);
				})
			).then(async () => {
				await command.reply({
					embeds: [
						{
							description: discord_id
								? `***${discord_id}'s linked accounts***\n\n` + accountList.join(' ')
								: '***Your linked accounts***\n\n' + accountList.join(' '),
							footer: {
								text: `${accounts.length} account${accounts.length === 1 ? ' is' : 's are'} linked to this profile.`,
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
		const db = new QuickDB({ filePath: 'data.sqlite' });
		await db.push(`${command?.user.id}.accounts`, usernames.trim().replace(/,\s*$/, '').split(','));

		const embed = new EmbedBuilder()
			.setFooter({
				text: `Added ${usernames.trim().replace(/,\s*$/, '').split(',').length} account${
					usernames.trim().replace(/,\s*$/, '').split(',').length === 1 ? '' : 's'
				}.`,
			})
			.addFields({ name: 'Accounts successfully added to profile:', value: usernames.trim().replace(/,\s*$/, '').split(',').join(', ') });

		await command.reply({ embeds: [embed] });
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

		await db.set(`${command?.user.id}`, {
			accounts: usernames
				.trim()
				.replace(/,\s*$/, '')
				.split(',')
				.map((username) => {
					return accounts.filter((account: any) => account !== username);
				})
				.flat(),
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
