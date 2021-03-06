import { Client, Guild, GuildChannel, GuildMember, Role, Snowflake, TextChannel, User } from "discord.js";

export const userMention: RegExp = /<@!?(\d{18,})>/;
export const channelMention: RegExp = /<#(\d{18,})>/;
export const roleMention: RegExp = /<@&(\d{18,})>/;
export const snowflakeDetect: RegExp = /(\d{18,})/;

export function parseID(str: string, regex: RegExp): Snowflake | null {
	if (regex.test(str)) {
		return regex.exec(str)[1];
	} else if (snowflakeDetect.test(str)) {
		return snowflakeDetect.exec(str)[1];
	} else return null;
}

export function parseChannel(str: string, guild: Guild, global: boolean = false, client?: Client): TextChannel | null {
	const id: Snowflake = parseID(str, channelMention);
	if (global) {
		if (!client) {
			return null;
		}
		if (!(client.channels.cache.has(id))) return null;
		return client.channels.cache.get(id) as TextChannel;
	}
	if (parseID(str, channelMention) === null) return null;
	if (!guild.channels.cache.has(id) || !guild.channels.cache.get(id).isText()) return null;
	return guild.channels.cache.get(id) as TextChannel;
}

export function parseMember(str: string, guild: Guild): GuildMember | null {
	if (parseID(str, userMention) === null) return null;
	const id: Snowflake = parseID(str, userMention);
	if (!guild.members.cache.has(id)) return null;
	return guild.members.cache.get(id);
}

export function parseRole(str: string, guild: Guild): Role | null {
	if (parseID(str, roleMention) === null) return null;
	const id: Snowflake = parseID(str, channelMention);
	if (!guild.roles.cache.has(id)) return null;
	return guild.roles.cache.get(id);
}

export function parseUser(str: string, client: Client): User | null {
	if (parseID(str, userMention) === null) return null;
	const id: Snowflake = parseID(str, userMention);
	if (!client.users.cache.has(id)) return null;
	return client.users.cache.get(id);
}

export function parseNumber(str: string): number | null {
	if (isNaN(parseInt(str))) return null;
	return parseInt(str);
}

export function parseDuration(str: string): number | null {
	if (str.length < 2) return 0;
	var days: number = 0;
	var hours: number = 0;
	var minutes: number = 0;
	var seconds: number = 0;
	var duration: number = 0;
	if (/(\d+)d/i.test(str)) days = parseInt(/(\d+)d/i.exec(str)[1]) || 0;
	if (/(\d+)h/i.test(str)) hours = parseInt(/(\d+)h/i.exec(str)[1]) || 0;
	if (/(\d+)m/i.test(str)) minutes = parseInt(/(\d+)m/i.exec(str)[1]) || 0;
	if (/(\d+)s/i.test(str)) seconds = parseInt(/(\d+)s/i.exec(str)[1]) || 0;
	duration = days * 86400000 + hours * 3600000 + minutes * 60000 + seconds * 1000;
	return (duration == Infinity) ? 0 : duration;
}

export function parseLink(str: string): string | null {
	const regex: RegExp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
	if (!regex.test(str)) return null;
	return str;
}