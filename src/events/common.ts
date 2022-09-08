import { Discord, On } from 'discordx';
import type { ArgsOf, Client } from 'discordx';

@Discord()
export class Example {
	@On()
	messageDelete([message]: ArgsOf<'messageDelete'>, client: Client): void {
		console.log('Message Deleted', client.user?.username, message.content);
	}
}
