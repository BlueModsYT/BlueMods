import { Command } from "./CommandHandler.js";
import { world, system } from "@minecraft/server";
import main from "./config.js";

function isCommandEnabled(commandName) {
    return main.enabledCommands[commandName] !== undefined ? main.enabledCommands[commandName] : true;
}

function saveEnabledCommands() {
    const commandsString = JSON.stringify(main.enabledCommands);
    world.setDynamicProperty(main.enabledCommandsKey, commandsString);
}

Command.register({
    name: "module",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const { player } = data;
    const action = args[0]?.toLowerCase();
    const commandName = args[1]?.toLowerCase();
    const commandActions = ["enable", "disable", "list"];

    if (!action || !commandActions.includes(action)) {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!module ${main.enabledisable} <command> or §3!module list`);
        player.runCommandAsync(`playsound random.break @s`);
        return;
    }

    if (action === "list") {
        let commandList = "\n§l§eCommands Module List:§r\n";
        let commandNumber = 1;

        for (const [command, enabled] of Object.entries(main.enabledCommands)) {
            commandList += `§7[§e${commandNumber}§7] [${enabled ? "§aENABLED" : "§cDISABLED"}§7] §e${command}\n`;
            commandNumber++;
        }

        player.sendMessage(commandList);
        player.runCommandAsync(`playsound note.bell @s`);
        return;
    }

    if (!(commandName in main.enabledCommands)) {
        player.sendMessage(`§7[§b#§7] §cInvalid command name. Command §e${commandName} §cis not recognized.`);
        return;
    }

    if (action === "enable") {
        if (main.enabledCommands[commandName]) {
            player.sendMessage(`§7[§b#§7] §cCommand §e${commandName} §cis already enabled.`);
            player.runCommandAsync(`playsound random.break @s`);
        } else {
            main.enabledCommands[commandName] = true;
            saveEnabledCommands();
            player.sendMessage(`§7[§b#§7] §aCommand §e${commandName} §ahas been enabled.`);
            player.runCommandAsync(`playsound note.bell @s`);
        }
    } else if (action === "disable") {
        if (!main.enabledCommands[commandName]) {
            player.sendMessage(`§7[§b#§7] §cCommand §e${commandName} §cis already disabled.`);
            player.runCommandAsync(`playsound random.break @s`);
        } else {
            main.enabledCommands[commandName] = false;
            saveEnabledCommands();
            player.sendMessage(`§7[§b#§7] §aCommand §e${commandName} §ahas been disabled.`);
            player.runCommandAsync(`playsound note.bell @s`);
        }
    }
});