import { QuickDB } from 'quick.db';
import { client } from '../main.js';
import type { Context } from 'koa';
import { Get, Router } from '@discordx/koa';

const db = new QuickDB({ filePath: 'data.sqlite' });

@Router()
export class Guilds {
	@Get('/api/profiles')
	async profiles(ctx: Context): Promise<void> {
		ctx.body = { profiles: await db.all() };
	}

	@Get('/api/profile/:id')
	async profile(ctx: Context): Promise<void> {
		ctx.body = { profile: await db.get(`${ctx.params.id}.accounts`) };
	}
}
