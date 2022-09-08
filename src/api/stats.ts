import got from 'got';
import type { Context } from 'koa';
import { Get, Post, Router } from '@discordx/koa';
import BodyParser from 'koa-bodyparser';

@Router()
export class Stats {
	@Get('/api/stats/:game/:uuid')
	async getStats(ctx: Context): Promise<void> {
		const data: any = await got.get(`https://api.hypixel.net/player?key=${process.env.API_KEY}&uuid=${ctx.params.uuid}`).json();
		ctx.body = data?.player.stats[ctx.params.game];
	}

	@Post('/api/stats/:game')
	async combineStats(ctx: Context): Promise<void> {
		// const data: any = await got.get(`https://api.hypixel.net/player?key=${process.env.API_KEY}&uuid=${ctx.params.uuid}`).json();
		ctx.body = { gamemode: ctx.params.game, data: ctx.request.body };
	}
}
