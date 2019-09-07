// instagram.js is responsible for managing messages to and from
// Instagram.

// Import Instagram API
const apiClient = require('instagram-private-api').IgApiClient;
const config = require("./config");
const lastUpdate = require("./lastupdate");
const tinyurl = require("tinyurl");
const signale = require("signale");

// Create a new Instagram API instance
const api = new apiClient();

// List of user IDs to ignore messages from (the current account is added to this list)
const ignoreList = [];

// Setup function (runs once at start) with a function to run when
// a message is received.
module.exports.setup = async (msgReceived) => {
  signale.info("Setting up Instagram...");
  // Create a 'virtual' device for running Instagram.
  api.state.generateDevice(config.instagram.username);
  signale.debug("Logging into Instagram...");
  // Login with the username and password from config file, wait until done.
  await api.account.login(config.instagram.username, config.instagram.password);
  const user = await api.account.currentUser();
  signale.info(`Logged in as ${user.username} (ID: ${user.pk})`);

  // Add the current user to the ignore list so our messages don't get resent
  ignoreList.push(user.pk);

  // Print chat thread IDs on startup for easy configuration
  const unsetThreads = await this.threadNames();
  signale.debug("Available chat threads", unsetThreads);

  // Function to run every second to check for new messages.
  return setInterval(async () => {
    // Get *all* chat threads from Instagram
    const threads = await getThreads();
    // Filter through messages in the threads, checking for new ones.
    handleMessages(threads, msgReceived);
  }, 1000);
}

// Temporary function to get the thread ids for all the different
// chats available to the account.
module.exports.threadNames = async () => {
  // Get *all* chat threads from Instagram
  const threads = await getThreads();
  const output = [];
  // For each of the threads
  await threads.forEach((thread) => {
    // If the thread is setup in the config
    if (config.mappings.find((m) => m.instagram === thread.thread_id)) {
      // Skip this item
      return;
    }

    // Add the thread's id and name to the output
    output.push({
      id: thread.thread_id,
      name: thread.thread_title
    });
  });
  return output;
}

// Function to send a message to specific thread
module.exports.send = (name="", content, targetThread) => {
  signale.debug("Forwarding message to Instagram...");
  signale.debug("Sending standard message...");
  // Get the individual thread
  const thread = api.entity.directThread(targetThread);

  // If the thread doesn't exist, skip
  if (!thread) { return; }

  // Send the message to the thread
  if (name !== "") {
    thread.broadcastText(`[${name}]: ${content}`);
  } else {
    thread.broadcastText(content);
  }

  signale.debug("Sent!");
}

// Function to get all of the chat threads
async function getThreads() {
  // Get direct message inbox.
  const inbox = api.feed.directInbox();
  // Get all of the threads in the inbox.
  const threads = await inbox.items();
  return threads;
}

// Function to filter through messages
async function handleMessages(threads, callback) {
  // Get the last time we ran this function (to ensure we don't)
  // send messages twice
  const lastTimestamp = await lastUpdate.get();

  // For each 'mapping' defined in the config
  config.mappings.forEach((mapping) => {    
    // Find the thread in the list of threads
    const thread = threads.find((t) => t.thread_id === mapping.instagram);

    // If there isn't a thread, skip
    if (!thread) { return; }

    // Get the messages in the thread, reverse the order
    // and then only get messages that are sent AFTER the last
    // time we checked AND that aren't sent by us.
    const messages = thread.items.reverse().filter((msg) => (parseInt(msg.timestamp) > lastTimestamp) && (ignoreList.indexOf(msg.user_id) < 0));
    
    // If we don't have any messages to process, skip.
    if (messages.length <= 0) { return; }

    // For each of the messages that we need to process.
    messages.forEach(async (msg) => {
      // Get the user's profile information
      const user = await api.user.info(msg.user_id);
      // Get the user's name, if they don't have a full name set
      // on their account, get their username.
      const name = user.full_name || user.username;
      // Get the user's avatar URL (used as profile picture in Discord)
      const avatar = user.profile_pic_url;
      // Get the type of message.
      const type = msg.item_type;

      // Print out the message type, details and user for debugging purposes.
      // console.log(type, msg, user.username);

      const converted = await convertMessage(type, msg);

      // Now that we have a message, send them to discord.
      callback(name, avatar, converted, mapping.discord, mapping.instagram);
    });

    // Now that we have processed all the messages, set the last
    // time we checked for messages to be the time the LAST message
    // was sent in the chat.
    const newTimestamp = parseInt(messages[messages.length - 1].timestamp);
    lastUpdate.set(newTimestamp);
  });
}

async function convertMessage(type, msg) {
  switch(type) {
    case "media": {
      const shortMedia = await tinyurl.shorten(msg.media.image_versions2.candidates[0].url);
      return shortMedia;
    }

    case "like": {
      return msg.like;
    }

    case "animated_media": {
      const mediaObj = msg.animated_media.images
      const shortGif = await tinyurl.shorten(mediaObj[Object.keys(mediaObj)[0]].url)
      return shortGif;
    }

    case "text": {
      return msg.text;
    }

    case "placeholder": {
      if (msg.placeholder.title === "Post Unavailable") {
        return "`[SHARED POST] This post is unavailable due to it's privacy settings.`";
      }

      return "`[SHARED POST] This post is unavailable.`";
    }

    case "media_share": {
      const postObj = msg.media_share;
      let postUrl = "";

      if (postObj.carousel_media) {
        postUrl = postObj.carousel_media[0].image_versions2.candidates[0].url;
      } else if (postObj.image_versions2) {
        postUrl = postObj.image_versions2.candidates[0].url;
      } else {
        signale.warn("UNSUPPORTED POST TYPE", type, msg);
        return "`[SHARED POST] This post type is unsupported.`";
      }

      const short = await tinyurl.shorten(postUrl);
      let text = `\`[SHARED POST] This post was posted by @${postObj.user.username}.`;

      if (postObj.caption) { text += ` Caption: ${postObj.caption.text}`; }

      text += `\` ${short}`;
      return text;
    }
    
    default: {
      signale.warn("UNSUPPORTED MESSAGE TYPE", type, msg);
      return "";
    }
  }
}