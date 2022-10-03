import got from 'got';
import type { Context } from 'koa';
import { Get, Post, Router } from '@discordx/koa';
import BodyParser from 'koa-bodyparser';
import { Readable } from 'stream';

@Router()
export class Stats {
	@Get('/api/stats/:game/:uuid')
	async getStats(ctx: Context): Promise<void> {
		const data: any = await got.get(`https://api.slothpixel.me/api/players/${ctx.params.uuid}?key=${process.env.API_KEY}`).json();
		ctx.body = data?.stats[ctx.params.game];
	}

	@Post('/api/stats/:game')
	async combineStats(ctx: Context): Promise<void> {
		if (ctx.request.body?.uuids) {
			const readStream = new Readable({
				read(size) {
					return true;
				},
			});
			const uuids: any = await ctx.request.body!.uuids;
			let sep = '';

			ctx.body = readStream;
			readStream.push('[\n');
			Promise.all(
				await uuids.map(async (uuid: any) => {
					await got
						.get(`https://api.slothpixel.me/api/players/${uuid}?key=${process.env.API_KEY}`)
						.json()
						.then((data: any) => {
							readStream.push(sep + JSON.stringify({ uuid, data: data.stats[ctx.params.game] }));
							if (!sep) sep = ',\n';
						});
				})
			).then(() => {
				console.log('done readstream');
				readStream.push('\n]');
				readStream.push(null);
			});
		} else {
			ctx.body = { err: 'validation', msg: 'uuids are required' };
		}
	}

	@Post('/api/overall')
	async overallCombined(ctx: Context): Promise<void> {
		if (ctx.request.body?.uuids) {
			const readStream = new Readable({
				read(size) {
					return true;
				},
			});
			const uuids: any = await ctx.request.body!.uuids;
			let sep = '';

			ctx.body = readStream;
			readStream.push('[\n');
			Promise.all(
				await uuids.map(async (uuid: any) => {
					await got
						.get(`https://api.slothpixel.me/api/players/${uuid}?key=${process.env.API_KEY}`)
						.json()
						.then((data: any) => {
							readStream.push(sep + JSON.stringify({ uuid, data }));
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
