const instagram = require("./instagram");
const discord = require("./discord");
const commands = require("./commands");

function parseCommand(text) {
	const output = {
		command: false,
		args: [],
	};

	if (text.startsWith(".")) {
		const command = text.substr(1);
		const parts = command.split(" ");
		output.command = parts[0];
		parts.shift();
		output.args = parts;
	}

	return output;
}

// Setup the Instagram 'Module', with callback for new messages
instagram.setup((name, avatar, content, targetChannel, fromThread) => {
	const command = parseCommand(content);

	if (command.command !== false) {
		if (Object.prototype.hasOwnProperty.call(commands, command.command)) {
			const result = commands[command.command](command.args);
			instagram.send("", result, fromThread);
			return;
		}
	}

	if (content === "") {
		return;
	}

	// When a message is received from an Instagram chat of interest,
	// send the message to Discord, specifying the name of the user,
	// the user's avatar, the content of the message and the channel(s),
	// to send the message to.
	discord.send(name, avatar, content, targetChannel);
});

// Setup the Discord 'Module', with callback for new messages
discord.setup((name, content, targetThread, fromChannel) => {
	const command = parseCommand(content);

	if (command.command !== false) {
		if (Object.prototype.hasOwnProperty.call(commands, command.command)) {
			const result = commands[command.command](command.args);
			discord.send("", "", result, fromChannel);
			return;
		}
	}

	if (content === "") {
		return;
	}

	// When a message is received from a Discord channel of interest,
	// send the message to Instagram, specifying the name of the user,
	// the content of the message and the thread ids to send the message
	// to.
	instagram.send(name, content, targetThread);
});
