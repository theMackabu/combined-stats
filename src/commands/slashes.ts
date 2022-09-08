import { EmbedBuilder } from 'discord.js';
import { Pagination } from '@discordx/pagination';
import type { CommandInteraction } from 'discord.js';
import { Discord, MetadataStorage, Slash } from 'discordx';

@Discord()
export class Slashes {
	@Slash({
		description: 'List all slash commands',
		name: 'command_list',
	})
	async pages(interaction: CommandInteraction): Promise<void> {
		const commands = MetadataStorage.instance.applicationCommands.map((cmd) => {
			return { description: cmd.description, name: cmd.name };
		});

		const pages = commands.map((cmd, i) => {
			return new EmbedBuilder()
				.setFooter({ text: `Page ${i + 1} of ${commands.length}` })
				.setTitle('**Slash command info**')
				.addFields({ name: 'Name', value: cmd.name })
				.addFields({ name: 'Description', value: cmd.description });
		});

		const pagination = new Pagination(interaction, pages);
		await pagination.send();
	}
}
