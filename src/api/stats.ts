import got from 'got';
import type { Context } from 'koa';
import { Get, Router } from '@discordx/koa';

@Router()
export class Stats {
	@Get('/api/stats/:game/:uuid')
	async getStats(ctx: Context): Promise<void> {
		const data: any = await got.get(`https://api.hypixel.net/player?key=${process.env.API_KEY}&uuid=${ctx.params.uuid}`).json();
		ctx.body = data?.player.stats[ctx.params.game];
	}
}
