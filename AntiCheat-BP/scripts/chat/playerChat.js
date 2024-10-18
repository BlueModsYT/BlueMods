import { world, system } from "@minecraft/server";
import main from "../commands/config.js";

// all rights reserved @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods.

let messages = new Map();
let spamTimers = new Map();

const spamCooldown = 3;  // 3 seconds cooldown
const maxMessages = 3;  // Maximum messages allowed within the cooldown period
const playerSpamData = new Map();

try {
    world.scoreboard.addObjective('Sents', '');
} catch (error) {
    // Objective already exists or error handling
}

function chat(data) {
    const tags = data.sender.getTags();
    let ranks = tags.filter(tag => tag.startsWith('rank:')).map(tag => tag.replace('rank:', ''));

    if (tags.includes('admin')) {
        ranks.push("§dAdmin");
    }
    if (tags.includes('trusted')) {
        ranks.push("§sTrusted");
    }

    ranks = ranks.length ? ranks : ["§6Member"];

    let score;
    try {
        score = world.scoreboard.getObjective('Sents').getScore(data.sender.scoreboard);
    } catch (e) {
        score = 0;
    }

    if (score >= 3) {
        data.cancel = true;
        return data.sender.sendMessage(`§7[§b#§7] §aYou're sending messages too quickly, slow down buddy.`);
    }

    const lastMessage = messages.get(data.sender.name);
    const currentTime = Date.now();

    if (lastMessage && lastMessage.message === data.message) {
        data.cancel = true;
        return data.sender.sendMessage(`§7[§b#§7] §aPlease do not type the same message.`);
    }

    messages.set(data.sender.name, { message: data.message, time: currentTime });

    const playerName = data.sender.name;
    const playerData = playerSpamData.get(playerName) || { lastMessageTime: 0, messageCount: 0 };

    const timeDiff = (currentTime - playerData.lastMessageTime) / 1000;

    if (timeDiff > spamCooldown) {
        playerData.messageCount = 0;
    }

    playerData.messageCount++;
    playerData.lastMessageTime = currentTime;

    if (playerData.messageCount > maxMessages) {
        data.cancel = true;
        const countdown = Math.ceil(spamCooldown - timeDiff);
        return data.sender.sendMessage(`§7[§b#§7] §cSlow down, you're flooding the chat. Wait ${countdown} seconds.`);
    }

    playerSpamData.set(playerName, playerData);

    data.sender.runCommandAsync(`scoreboard players add @s Sents 1`);

    if (data.message.startsWith("!*")) {
        data.cancel = true;
        return;
    }

    const rankText = ranks.map(rank => `§7[${rank}§7]`).join(" ");
    const text = `${rankText} ${data.sender.nameTag}: §f${data.message}`;
    world.getDimension('overworld').runCommandAsync(`tellraw @a {"rawtext":[{"translate":${JSON.stringify(text)}}]}`);

    data.cancel = true;
}

system.runInterval(() => {
    world.getDimension("overworld").runCommandAsync(`scoreboard players reset @a Sents`);
}, 6000);

world.beforeEvents.chatSend.subscribe((data) => {
   
 if (data.message.startsWith(main.prefix)) return;
    chat(data);
});
