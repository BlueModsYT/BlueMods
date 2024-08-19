import { world, system, ChatSendBeforeEvent } from "@minecraft/server"
import main from "../commands/config.js"
import "./bow.js"
// all rights reserved @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods.
let messages = new Map()
try {
    world.scoreboard.addObjective('Sents', '')
} catch(error) {
    0;
}
function chat(data){
    const tags = data.sender.getTags()
    let ranks = tags.filter(tag => tag.startsWith('rank:')).map(tag => tag.replace('rank:', ''))
    ranks = ranks.length ? ranks : ["§6Member"]
    
    let score;
    try {
        score = world.scoreboard.getObjective('Sents').getScore(data.sender.scoreboard)
    } catch (e) {
        score = 0;
    }
    if(score >= 3){
        data.cancel = true
        return data.sender.sendMessage(`§bBlueMods §7>> §aYou're sending messages too quickly, slow down buddy`)
    }
    if(!messages.get(data.sender.name)){
        messages.set(data.sender.name, data.message)
    }else {
        const oldMsg = messages.get(data.sender.name)
        if(oldMsg == data.message){
            data.cancel = true
            return data.sender.sendMessage(`§bBlueMods §7>> §aPlease do not type the same message.`)
        }
    }
    messages.set(data.sender.name, data.message)
    data.sender.runCommandAsync(`scoreboard players add @s Sents 1`)
    
    if(data.message.startsWith("!*")){
        data.cancel = true
        return
    }

    const rankText = ranks.map(rank => `§7[${rank}§7]`).join(" ");
    const text = `${rankText} ${data.sender.nameTag}: §f${data.message}`;
    
    world.getDimension('overworld').runCommandAsync(`tellraw @a {"rawtext":[{"translate":${JSON.stringify(text)}}]}`)
    data.cancel = true
}

let seconds = 0

function timer(){
    seconds++
    if(seconds >= 10){
        world.getDimension("overworld").runCommandAsync(`scoreboard players reset @a Sents`)
        world.getDimension("overworld").runCommandAsync(`scoreboard players set @a Sents 1`)
        seconds = 0
        return seconds
    }
    return seconds
}
function loop(){
    let worldLoad = false
    system.run(() => {
        worldLoad ? loop() : world.getDimension('overworld').runCommandAsync(`testfor @a`).then(e => { if(!worldLoad){ worldLoad = true, loop()}}, onrejected => {return loop()})
        if(system.currentTick % 20 == 0){
            timer()
        }
    })
}

world.beforeEvents.chatSend.subscribe((data) => {
    if (data.message.startsWith(main.prefix)) return;
    chat(data)
})
loop()
  