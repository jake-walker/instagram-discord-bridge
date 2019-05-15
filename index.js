const instagram = require("./instagram");
const discord = require("./discord");

// Setup the Instagram 'Module', with callback for new messages
instagram.setup((name, avatar, content, targetChannels) => {
  // When a message is received from an Instagram chat of interest,
  // send the message to Discord, specifying the name of the user,
  // the user's avatar, the content of the message and the channel(s),
  // to send the message to.
  discord.send(name, avatar, content, targetChannels);
});

// Setup the Discord 'Module', with callback for new messages
discord.setup((name, content, targetThreads) => {
  // When a message is received from a Discord channel of interest,
  // send the message to Instagram, specifying the name of the user,
  // the content of the message and the thread ids to send the message
  // to.
  instagram.send(name, content, targetThreads);
});