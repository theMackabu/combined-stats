import { QuickDB } from 'quick.db';
import { client } from '../main.js';
import type { Context } from 'koa';
import { Get, Router } from '@discordx/koa';

const db = new QuickDB({ filePath: 'data.sqlite' });

@Router()
export class Guilds {
	@Get('/api/profiles')
	async profiles(ctx: Context): Promise<void> {
		const query = await db.all();

		ctx.body = {
			profiles: query.map((data) => {
				return { [data.id]: data.value };
			}),
		};
	}

	@Get('/api/profile/:id')
	async profile(ctx: Context): Promise<void> {
		ctx.body = { [ctx.params.id]: { accounts: await db.get(`${ctx.params.id}.accounts`) } };
	}
}
