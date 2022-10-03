// Gamespeed LTD 2022. All Rights Reserved.
// module: overall.ts
// This file is licensed under the GPL-3 License.
// License text available at https://www.gnu.org/licenses/gpl-3.0.en.html

import got from 'got';
import { QuickDB } from 'quick.db';
import { EmbedBuilder } from 'discord.js';
import type { CommandInteraction, Message } from 'discord.js';
import { Discord, MetadataStorage, Slash, SlashOption } from 'discordx';

@Discord()
export class Profile {
	@Slash({
		description: 'view combined overall stats',
		name: 'overall_combined',
	})
	async combinedStats(
		@SlashOption({ description: 'Discord tag', name: 'tag', required: false }) discord_id: string,
		command: CommandInteraction
	): Promise<void> {
		const db = new QuickDB({ filePath: 'data.sqlite' });
		const formatted_discord_id = discord_id ? discord_id.slice(2).slice(0, -1) : null;
		const accounts: any = await db.get(`${formatted_discord_id ? formatted_discord_id : command?.user.id}.accounts`);
		const uuidList: Array<string> = Object.values(accounts);

		try {
			await got
				.post(`${process.env.APP_URL}/api/overall`, { json: { uuids: uuidList } })
				.json()
				.then(async (res: any) => {
					const combined: any = {
						['Level']: [],
						['Experience']: [],
						['Karma']: [],
						['Achievement Points']: [],
						['Quests Completed']: [],
						['Total Games Played']: [],
						['Total Kills']: [],
						['Total Wins']: [],
						['Total Coins']: [],
						['Gifts Sent']: [],
						['Gifts Received']: [],
					};

					const misc: any = {
						ranks: [],
					};

					res.map((user: any) => {
						combined['Level'].push(user.data.level);
						combined['Experience'].push(user.data.exp);
						combined['Karma'].push(parseInt(user.data.karma));
						combined['Achievement Points'].push(user.data.achievement_points);
						combined['Quests Completed'].push(user.data.quests_completed);
						combined['Total Games Played'].push(user.data.total_games_played);
						combined['Total Kills'].push(user.data.total_kills);
						combined['Total Wins'].push(user.data.total_wins);
						combined['Total Coins'].push(parseInt(user.data.total_coins));
						combined['Gifts Sent'].push(user.data.gifts_sent);
						combined['Gifts Received'].push(user.data.gifts_received);
						misc.ranks.push(user.data.rank);
					});

					const embed = new EmbedBuilder()
						.setDescription(discord_id ? `***${discord_id}'s overall stats***` : `***Your combined overall stats***`)
						.setFooter({ text: `${uuidList?.length} accounts combined` });

					Object.keys(combined).map((stat: string) => {
						embed.addFields({
							name: stat,
							value: Number(combined[stat].reduce((a: number, b: number) => a + b, 0).toFixed(3)).toLocaleString('en-US'),
							inline: true,
						});
					});

					embed.addFields({
						name: 'Estimated Cost',
						value: `$${(combined['Level'].reduce((a: number, b: number) => a + b, 0).toFixed(2) * 1.58 + misc.ranks.length * 11.3).toFixed(2)}`,
						inline: true,
					});

					embed.addFields({
						name: 'Ranks',
						value: misc.ranks.join(', '),
						inline: true,
					});

					await command.reply({ embeds: [embed] });
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
}
