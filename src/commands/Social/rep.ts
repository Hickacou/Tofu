import Command from "../../core/base/Command";
import OCBot from "../../core/base/Client";
import { Message, User } from "discord.js";
import { parseUser } from "../../core/lib/Args";
import { BotProfile } from "../../core/typedefs/BotProfile";
import { formatDuration } from "../../core/lib/Time";

export = class extends Command {
	constructor(client: OCBot) {
		super(client, {
			name: "rep",
			desc: "Give a reputation point to someone",
			module: "Social",
			usages: [
				"<user: User>"
			]
		});
	}

	public async setup() {}

	public async exe(message: Message, args: string[]): Promise<void> {
		super.check(message, async () => {

			const authorProfile: BotProfile = await this.client.db.getProfile(message.author);
			if (!authorProfile.canRep) {
				const next12: Date = new Date();
				next12.setDate(next12.getDate() + 1);
				next12.setHours(0, 0, 0, 0);
				const duration: string = formatDuration(new Date(), next12, true);
				message.channel.send(`❌ You can rep someone again in ${duration}`);
				return;
			}

			const user: User = parseUser(args[0], this.client);
			if (!user) {
				message.channel.send("❌ Can't find user");
				return;
			}
			if (user.bot) {
				message.channel.send("❌ You can't rep a bot...")
				return;
			}
			if (user === message.author) {
				message.channel.send("❌ You can't rep yourself...");
				return;
			}
			const profile: BotProfile = await this.client.db.getProfile(user);
			await this.client.db.setUser(user, "rep", ++profile.rep);
			await this.client.db.setUser(message.author, "canRep", false);
			message.channel.send(`<:DHWinkMM:720095840152191027> | I gave a reputation point to ${user.toString()}!`);
		});
	}
}