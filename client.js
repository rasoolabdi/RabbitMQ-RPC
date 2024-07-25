const amqp = require("amqplib");
const args = process.argv.slice(2);
const queueName = "rpc";
const {v4: uuidv4} = require("uuid");
const uuid = uuidv4();

async function sendTaskToProcess() {
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    const assertedQueue = await channel.assertQueue("" , {exclusive: true});
    channel.sendToQueue(queueName , Buffer.from[args[0]] , {
        replyTo: assertedQueue.queue,
        correlationId: uuid
    })
    channel.consume(assertedQueue.queue , (msg) => {
        if(msg.properties.correlationId == uuid) {
            console.log("Processed Done: " , msg.content.toString());
            channel.ack(msg);
            setTimeout(() => {
                connection.close();
                process.exit(0)
            }, 2000);
        }
    })
}

sendTaskToProcess();
