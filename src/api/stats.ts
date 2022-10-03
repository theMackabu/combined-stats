import got from 'got';
import type { Context } from 'koa';
import { Get, Post, Router } from '@discordx/koa';
import BodyParser from 'koa-bodyparser';
import { Readable } from 'stream';

@Router()
export class Stats {
	@Get('/api/stats/:game/:username')
	async getStats(ctx: Context): Promise<void> {
		const data: any = await got.get(`https://api.slothpixel.me/api/players/${ctx.params.username}?key=${process.env.API_KEY}`).json();
		ctx.body = data?.player.stats[ctx.params.game];
	}

	@Post('/api/stats/:game')
	async combineStats(ctx: Context): Promise<void> {
		if (ctx.request.body?.usernames) {
			const readStream = new Readable({
				read(size) {
					return true;
				},
			});
			const usernames: any = await ctx.request.body!.usernames;
			let sep = '';

			ctx.body = readStream;
			readStream.push('[\n');
			Promise.all(
				await usernames.map(async (username: any) => {
					await got
						.get(`https://api.slothpixel.me/api/players/${username}?key=${process.env.API_KEY}`)
						.json()
						.then((data: any) => {
							readStream.push(sep + JSON.stringify({ username: username, data: data.stats[ctx.params.game] }));
							if (!sep) sep = ',\n';
						});
				})
			).then(() => {
				console.log('done readstream');
				readStream.push('\n]');
				readStream.push(null);
			});
		} else {
			ctx.body = { err: 'validation', msg: 'uuid are required' };
		}
	}

	@Post('/api/overall')
	async overallCombined(ctx: Context): Promise<void> {
		if (ctx.request.body?.usernames) {
			const readStream = new Readable({
				read(size) {
					return true;
				},
			});
			const usernames: any = await ctx.request.body!.usernames;
			let sep = '';

			ctx.body = readStream;
			readStream.push('[\n');
			Promise.all(
				await usernames.map(async (username: any) => {
					await got
						.get(`https://api.slothpixel.me/api/players/${username}?key=${process.env.API_KEY}`)
						.json()
						.then((data: any) => {
							readStream.push(sep + JSON.stringify({ username: username, data }));
							if (!sep) sep = ',\n';
						});
				})
			).then(() => {
				console.log('done readstream');
				readStream.push('\n]');
				readStream.push(null);
			});
		} else {
			ctx.body = { err: 'validation', msg: 'uuid are required' };
		}
	}
}
