const git = require("git-rev-sync");

module.exports = {
	about() {
		return "ℹ️ Instagram Discord Bridge by Jake Walker." +
      `Running version ${git.short()} (${git.message()}).` +
      "https://github.com/jake-walker/instagram-discord-bridge";
	},
	ping() {
		return "🏓 Pong";
	},
	uptime() {
		function format(seconds) {
			const h = Math.floor(seconds / (60 * 60));
			const m = Math.floor(seconds % (60 * 60) / 60);
			const s = Math.floor(seconds % 60);

			return `${h} hours, ${m} minutes and ${s} seconds.`;
		}

		const uptime = process.uptime();
		return `⏱️ Uptime: ${format(uptime)}`;
	},
};
