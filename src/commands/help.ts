// Gamespeed LTD 2022. All Rights Reserved.
// module: help.ts
// This file is licensed under the GPL-3 License.
// License text available at https://www.gnu.org/licenses/gpl-3.0.en.html

import { EmbedBuilder } from 'discord.js';
import { Pagination } from '@discordx/pagination';
import type { CommandInteraction } from 'discord.js';
import { Discord, MetadataStorage, Slash } from 'discordx';

@Discord()
export class Slashes {
	@Slash({
		description: 'Information about every command',
		name: 'help',
	})
	async pages(interaction: CommandInteraction): Promise<void> {
		const commands = MetadataStorage.instance.applicationCommands.map((cmd) => {
			return { description: cmd.description, name: cmd.name };
		});

		const embed = new EmbedBuilder().setTitle('**All Commands**').setFooter({ text: `${commands.length} commands loaded` });

		commands.map((cmd, i) => {
			embed.addFields({ name: cmd.name, value: cmd.description });
		});

		await interaction.reply({ embeds: [embed] });
	}
}
