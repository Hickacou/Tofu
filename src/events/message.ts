import { Message, MessageEmbed, MessageReaction, ReactionCollector, Snowflake, TextChannel } from "discord.js";
import BotEvent from "../core/base/BotEvent";
import Tofu from "../core/base/Client";
import StarboardSettings from "../core/typedefs/StarboardSettings";
import * as log from "../core/lib/Log";

export = class extends BotEvent {
	private stars: Map<Snowflake, Message>;
	constructor(client: Tofu) {
		super(client, "message");
		this.stars = new Map<Snowflake, Message>();
	}

	public async exe(message: Message): Promise<void> {
		if (message.author.bot) return;
		if (message.guild) {
			const guildSettings: StarboardSettings = await this.client.db.getStarboard(message.guild);
			if (guildSettings.enabled) {
				const collector: ReactionCollector = new ReactionCollector(message, (r: MessageReaction) => r.emoji.name === "⭐", { time: 120000, dispose: true });
				collector.on("collect", async (reaction, _u) => {
					if (reaction.emoji.name !== "⭐") return;

					const star: string = (reaction.count < 5) ? "⭐" : (reaction.count < 10) ? "🌟" : "✨";
					if (reaction.count >= 2) {
						if (!this.stars.has(reaction.message.id)) {
							const link: string = `https://discord.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id}`;
							const embed: MessageEmbed = new MessageEmbed()
								.setAuthor(reaction.message.author.username, reaction.message.author.displayAvatarURL({ dynamic: true }))
								.setDescription(reaction.message.content)
								.addField("Attachments", "_ _", false)
								.addField("Original", `[Jump!](${link})`, false)
								.setTimestamp(reaction.message.createdTimestamp)
								.setColor("FFF23D");
							if (reaction.message.attachments.array().length > 0) {
								for (const attachment of reaction.message.attachments.array()) {
									if (attachment.width && attachment.height && !embed.image) {
										embed.setImage(attachment.url);
									}
									embed.fields[0].value += `[${attachment.name}](${attachment.url})\n`;
								}
								embed.fields[0].value.slice(3);
							} else {
								embed.spliceFields(0, 1);
							}
							this.stars.set(reaction.message.id, (await guildSettings.channel.send(`${star} **${reaction.count}**`, embed)));
							return;
						}
						const msg: Message = this.stars.get(reaction.message.id);
						msg.edit(`${star} **${reaction.count}**`, msg.embeds[0]);
					}
				});
				collector.on("remove", async (reaction, _u) => {
					const msg: Message = this.stars.get(reaction.message.id);
					if (reaction.count < 2) {
						msg.delete();
						this.stars.delete(reaction.message.id);
						return;
					}
					const star: string = (reaction.count < 2) ? "⭐" : (reaction.count < 10) ? "🌟" : "✨";
					msg.edit(`${star} **${reaction.count}**`, msg.embeds[0]);
				});
				collector.on("end", (_collected, reason) => {
					if (reason === "messageDelete") {
						if (!this.stars.has(message.id)) return;
						this.stars.get(message.id).delete();
						this.stars.delete(message.id);
					}
				});
			}
		}
		if (this.client.test && !this.client.admins.includes(message.author.id)) return;
		const prefix: string = this.client.prefix;
		const msg: string = message.content;
		if (message.channel.type === "dm") {
			if (!process.env.DM_CHANNEL) {
				log.info(`DM received. Author : ${log.user(message.author)} | Content : ${log.text(message.content)}`);
				return;
			}
			const channel: TextChannel = await this.client.channels.fetch(process.env.DM_CHANNEL) as TextChannel || null;
			try {
				const embed: MessageEmbed = new MessageEmbed()
					.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.avatarURL({ dynamic: true }))
					.setColor("BLUE")
					.setDescription(message.content)
					.setFooter(`Answer with ${this.client.prefix}dm ${message.author.id} <message>`)
					.setTimestamp(message.createdAt);
				if (message.attachments.size > 0) embed.setImage(message.attachments.first().url)
				if (message.attachments.size > 1) embed.addField("Attachments", message.attachments.map(a => `[Link](${a.url})`).join("\n"))
				channel.send(embed);
			} catch (err) {
				log.warn(`Couldn't mirror DM to .env channel. Author : ${log.user(message.author)} | Content : ${log.text(message.content)}`);
				console.log(err);
			}
			return;
		}
		if (!msg.toLowerCase().startsWith(prefix)) return;
		const args: string[] = msg.trim().slice(prefix.length).split(" ");
		const command: string = args.shift().toLowerCase();
		if (this.client.aliases.has(command)) {
			this.client.commands.get(this.client.aliases.get(command)).exe(message, args);
			return;
		}
		if (this.client.commands.has(command)) {
			this.client.commands.get(command).exe(message, args);
		}
	}
}