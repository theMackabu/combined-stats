import { client } from '../main.js';
import type { Context } from 'koa';
import { Get, Router } from '@discordx/koa';

@Router()
export class Guilds {
	@Get('/api/guilds')
	async guilds(ctx: Context): Promise<void> {
		await ctx.render('guilds', { id: client.guilds.cache.map((g) => g.id), name: client.guilds.cache.map((g) => g.name) });
	}

	@Get('/api/guilds/:id')
	guildsJson(ctx: Context) {
		ctx.body = { json: client.guilds.cache.filter((g) => g.id === ctx.params.id) };
	}
}
