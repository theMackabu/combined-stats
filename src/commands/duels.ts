import got from 'got';
import { QuickDB } from 'quick.db';
import { EmbedBuilder } from 'discord.js';
import type { CommandInteraction, Message } from 'discord.js';
import { Discord, MetadataStorage, Slash, SlashOption } from 'discordx';

@Discord()
export class Profile {
	@Slash({
		description: 'view combined duels [overall] stats',
		name: 'duels_combined',
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
				.post(`http://155.248.207.29:5000/api/stats/Duels`, { json: { usernames: accounts } })
				.json()
				.then(async (res: any) => {
					const combined: any = {
						coins: [],
						wins: [],
						losses: [],
						kills: [],
						deaths: [],
						blocksPlaced: [],
						damageDealt: [],
						kdr: [],
						wlr: [],
					};

					const settings: any = {
						cosmeticTitle: [],
					};

					res.map((user: any) => {
						combined.coins.push(user.data.general.coins);
						combined.wins.push(user.data.general.wins);
						combined.losses.push(user.data.general.losses);
						combined.kills.push(user.data.general.kills);
						combined.deaths.push(user.data.general.deaths);
						combined.blocksPlaced.push(user.data.general.blocks_placed);
						combined.damageDealt.push(user.data.general.damage_dealt);
						settings.cosmeticTitle.push(user.data.settings.active_cosmetics.cosmetictitle);
					});

					combined.kdr.push(combined.kills.reduce((a: number, b: number) => a + b, 0) / combined.deaths.reduce((a: number, b: number) => a + b, 0));
					combined.wlr.push(combined.wins.reduce((a: number, b: number) => a + b, 0) / combined.losses.reduce((a: number, b: number) => a + b, 0));

					const embed = new EmbedBuilder()
						.setDescription(discord_id ? `***${discord_id}'s stats in Duels [overall]***` : `***Your combined stats in Duels [overall]***`)
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
						name: 'titles',
						value: JSON.stringify(settings.cosmeticTitle),
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
