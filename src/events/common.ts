// Gamespeed LTD 2022. All Rights Reserved.
// module: common.ts
// This file is licensed under the GPL-3 License.
// License text available at https://www.gnu.org/licenses/gpl-3.0.en.html

import { Discord, On } from 'discordx';
import type { ArgsOf, Client } from 'discordx';

@Discord()
export class Example {
	@On()
	messageDelete([message]: ArgsOf<'messageDelete'>, client: Client): void {
		console.log('Message Deleted', client.user?.username, message.content);
	}
}
