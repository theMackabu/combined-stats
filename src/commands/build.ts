import got from 'got';
import { QuickDB } from 'quick.db';
import { EmbedBuilder } from 'discord.js';
import type { CommandInteraction, Message } from 'discord.js';
import { Discord, MetadataStorage, Slash, SlashOption } from 'discordx';

@Discord()
export class Profile {
	@Slash({
		description: 'view combined build battle stats',
		name: 'build_combined',
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
				.post(`${process.env.APP_URL}/api/stats/BuildBattle`, { json: { usernames: accounts } })
				.json()
				.then(async (res: any) => {
					const combined: any = {
						['Coins']: [],
						['Wins']: [],
						['Score']: [],
						['Correct Guesses']: [],
						['Total Votes']: [],
					};

					res.map((user: any) => {
						combined['Coins'].push(user.data.coins);
						combined['Wins'].push(user.data.wins);
						combined['Score'].push(user.data.score);
						combined['Correct Guesses'].push(user.data.correct_guesses);
						combined['Total Votes'].push(user.data.total_votes);
					});

					const embed = new EmbedBuilder()
						.setDescription(discord_id ? `***${discord_id}'s stats in Build Battle***` : `***Your combined stats in Build Battle***`)
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
