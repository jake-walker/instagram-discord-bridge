const git = require("git-rev-sync");

module.exports = {
  "about": function(args) {
    return "ℹ️ Instagram Discord Bridge by Jake Walker." + 
      `Running version ${git.short()} (${git.message()}).` +
      "https://github.com/jake-walker/instagram-discord-bridge";
  },
  "ping": function(args) {
    return "🏓 Pong";
  },
  "uptime": function(args) {
    function format(seconds) {
      let h = Math.floor(seconds / (60 * 60));
      let m = Math.floor(seconds % (60 * 60) / 60);
      let s = Math.floor(seconds % 60);

      return `${h} hours, ${m} minutes and ${s} seconds.`
    }

    let uptime = process.uptime();
    return `⏱️ Uptime: ${format(uptime)}`;
  }
}