import {SendSignal , RequestServerStatus, GetServerFromPort} from '../axios';

module.export = {
    commands: ["restart"],
    expectedArgs: "<restart>",
    premissionError: "You need to have a valid role to run this command.",
    minArgs: 1,
    maxArgs: 1,
    callback: (messageCreate, arguments) => {
        const restart = +arguments[0];
        let signal = "restart";
        let interval;
        let seconds = 0;

        if (messageCreate.channelId != "791113683521634304")
            return;
        
        let server = await GetServerFromPort(port);
        
        let identifier = server.attributes.identifier;
        if (identifier == null || identifier == undefined) {
            await interaction.reply("Error. Could not find server corrosponding to that port.");
            return;
        }

        try{
            await SendSignal(identifier, signal);
        }catch (err) {
            console.log(err);
            return;
        }

        let reply = await messageCreate.reply(`Signal \`${signal}\` has been sucessfully sent to server ${server.attributes.name}.\nAwaiting restart.`)

        interval = setInterval(async function(){
            let status = await RequestServerStatus(identifier);

            if (status == null){
                stopInterval();
                return;
            }

            if (status.data.attributes.current_state == "running") {
                await message.edit(`${message.content.split('\n')[0]}\nServer is now online!`);
                stopInterval();
                return;
            }

            seconds ++;

            if (seconds % 3 == 0){
                if (reply.content.endsWith('. . .'))
                await reply.edit(reply.content.replace('. . .', '.'));
            else
                await reply.edit(`${reply.content} .`);
            }
        }, 1000);
    }, 
    premissions: [],
    requiredRoles: []
}