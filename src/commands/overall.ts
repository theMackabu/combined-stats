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
		const accounts: Array<string> | null = await db.get(`${formatted_discord_id ? formatted_discord_id : command?.user.id}.accounts`);

		try {
			await got
				.post(`http://155.248.207.29:5000/api/overall`, { json: { usernames: accounts } })
				.json()
				.then(async (res: any) => {
					const combined: any = {
						level: [],
						exp: [],
						karma: [],
						achievementPoints: [],
						questsCompleted: [],
						totalGamesPlayed: [],
						totalKills: [],
						totalWins: [],
						totalCoins: [],
						giftsSent: [],
						giftsReceived: [],
					};

					const misc: any = {
						ranks: [],
					};

					res.map((user: any) => {
						combined.level.push(user.data.level);
						combined.exp.push(user.data.exp);
						combined.karma.push(parseInt(user.data.karma));
						combined.achievementPoints.push(user.data.achievement_points);
						combined.questsCompleted.push(user.data.quests_completed);
						combined.totalGamesPlayed.push(user.data.total_games_played);
						combined.totalKills.push(user.data.total_kills);
						combined.totalWins.push(user.data.total_wins);
						combined.totalCoins.push(parseInt(user.data.total_coins));
						combined.giftsSent.push(user.data.gifts_sent);
						combined.giftsReceived.push(user.data.gifts_received);
						misc.ranks.push(user.data.rank);
					});

					const embed = new EmbedBuilder()
						.setDescription(discord_id ? `***${discord_id}'s overall stats***` : `***Your combined overall stats***`)
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

					embed.addFields({
						name: 'estimatedCost',
						value: `$${(combined.level.reduce((a: number, b: number) => a + b, 0).toFixed(2) * 1.58 + misc.ranks.length * 11.3).toFixed(2)}`,
						inline: true,
					});

					embed.addFields({
						name: 'ranks',
						value: JSON.stringify(misc.ranks),
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
