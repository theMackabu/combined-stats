// Gamespeed LTD 2022. All Rights Reserved.
// module: skywars.ts
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
		description: 'view combined skywars stats',
		name: 'skywars_combined',
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
				.post(`${process.env.APP_URL}/api/stats/SkyWars`, { json: { uuids: uuidList } })
				.json()
				.then(async (res: any) => {
					const combined: any = {
						['Level']: [],
						['Experience']: [],
						['Coins']: [],
						['Souls']: [],
						totalHeads: [],
						wins: [],
						losses: [],
						kills: [],
						deaths: [],
						kdr: [],
						wlr: [],
					};

					res.map((user: any) => {
						combined.level.push(user.data.level);
						combined.experience.push(user.data.experience);
						combined.coins.push(user.data.coins);
						combined.souls.push(user.data.souls);
						combined.totalHeads.push(user.data.heads.total_heads);
						combined.wins.push(user.data.wins);
						combined.losses.push(user.data.losses);
						combined.kills.push(user.data.kills);
						combined.deaths.push(user.data.deaths);
					});

					combined.kdr.push(combined.kills.reduce((a: number, b: number) => a + b, 0) / combined.deaths.reduce((a: number, b: number) => a + b, 0));
					combined.wlr.push(combined.wins.reduce((a: number, b: number) => a + b, 0) / combined.losses.reduce((a: number, b: number) => a + b, 0));

					const embed = new EmbedBuilder()
						.setDescription(discord_id ? `***${discord_id}'s stats in Skywars***` : `***Your combined stats in Skywars***`)
						.setFooter({ text: `${uuidList?.length} accounts combined` });

					Object.keys(combined).map((stat: string) => {
						embed.addFields({
							name: stat,
							value: Number(combined[stat].reduce((a: number, b: number) => a + b, 0).toFixed(3)).toLocaleString('en-US'),
							inline: true,
						});
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
