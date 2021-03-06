import { Snowflake, PermissionResolvable } from "discord.js";

export default interface CommandOptions {
	aliases?: string[],
	cooldown?: number,
	desc: string,
	hidden?: boolean,
	module: string,
	name: string,
	perms?: PermissionResolvable[],
	usages?: string[],
	whitelist?: Snowflake[]
}