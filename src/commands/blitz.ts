import got from 'got';
import { QuickDB } from 'quick.db';
import { EmbedBuilder } from 'discord.js';
import type { CommandInteraction, Message } from 'discord.js';
import { Discord, MetadataStorage, Slash, SlashOption } from 'discordx';

@Discord()
export class Profile {
	@Slash({
		description: 'view combined blitz stats',
		name: 'blitz_combined',
	})
	async combinedStats(
		@SlashOption({ description: 'Discord tag', name: 'tag', required: false }) discord_id: string,
		command: CommandInteraction
	): Promise<void> {
		const db = new QuickDB({ filePath: 'data.sqlite' });
		const formatted_discord_id = discord_id ? discord_id.slice(2).slice(0, -1) : null;
		const accounts: Array<string> | null = await db.get(`${formatted_discord_id ? formatted_discord_id : command?.user.id}.accounts`);

		try {
			await got
				.post(`${process.env.APP_URL}/api/stats/Blitz`, { json: { usernames: accounts } })
				.json()
				.then(async (res: any) => {
					const combined: any = {
						['Coins']: [],
						['Wins']: [],
						['Play Time']: [],
						['Kills']: [],
						['Deaths']: [],
						['K/D Ratio']: [],
						['W/L Ratio']: [],
					};

					res.map((user: any) => {
						combined['Coins'].push(user.data.coins);
						combined['Wins'].push(user.data.wins + user.data.team_wins);
						combined['Play Time'].push(user.data.time_played);
						combined['Kills'].push(user.data.kills);
						combined['Deaths'].push(user.data.deaths);
					});

					combined['K/D Ratio'].push(
						combined['Kills'].reduce((a: number, b: number) => a + b, 0) / combined['Deaths'].reduce((a: number, b: number) => a + b, 0)
					);
					combined['W/L Ratio'].push(
						combined['Wins'].reduce((a: number, b: number) => a + b, 0) / combined['Deaths'].reduce((a: number, b: number) => a + b, 0)
					);

					const embed = new EmbedBuilder()
						.setDescription(discord_id ? `***${discord_id}'s stats in Blitz SG***` : `***Your combined stats in Blitz SG***`)
						.setFooter({ text: `${accounts?.length} accounts combined` });

					Object.keys(combined).map((stat: string) => {
						embed.addFields({
							name: stat,
							value: combined[stat]
								.reduce((a: number, b: number) => a + b, 0)
								.toFixed(2)
								.toString(),
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
