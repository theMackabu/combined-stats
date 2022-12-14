// Gamespeed LTD 2022. All Rights Reserved.
// module: base.ts
// This file is licensed under the GPL-3 License.
// License text available at https://www.gnu.org/licenses/gpl-3.0.en.html

import type { Context } from 'koa';
import { Get, Router } from '@discordx/koa';

const publicRoutes = [
	{ type: 'GET', name: 'guild list', url: '/api/guilds', param: '', body: '', info: 'View all guilds' },
	{ type: 'GET', name: 'guild info', url: '/api/guilds', param: 'id', body: '', info: 'View info about a guild' },
	{ type: 'GET', name: 'profile', url: '/api/profile', param: 'id', body: '', info: 'View a user profile' },
	{ type: 'GET', name: 'profiles', url: '/api/profiles', param: '', body: '', info: 'View all user profiles' },
	{ type: 'GET', name: 'gamemode stats', url: '/api/stats', param: 'game/:uuid', body: '', info: 'View a gamemode stat' },
	{
		type: 'POST',
		name: 'combined stats',
		url: '/api/stats',
		param: 'game',
		body: '{uuids: Array<string>}',
		info: 'View combined gamemode stats',
	},
	{
		type: 'POST',
		name: 'combined stats',
		url: '/api/overall',
		param: '',
		body: '{uuids: Array<string>}',
		info: 'View overall stats',
	},
];

@Router()
export class Base {
	@Get('/')
	async index(ctx: Context): Promise<void> {
		await ctx.render('index', { routes: publicRoutes });
	}
}
