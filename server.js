const amqp = require("amqplib");
const args = process.argv.slice(2);
const {v4: uuidv4} = require("uuid");
const uuid = uuidv4();
const queueName = "rpc";

async function processTask() {
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName);
    console.log("I Wait to get New Task To Process");
    channel.consume(queueName , (msg) => {
        console.log("received data: " , msg.content.toString());
        const data = parseInt(msg.content.toString());
        let temp = 0;
        for(let i = 1; i <= data; i++) {
            temp += (data * i);
        }
        channel.sendToQueue(msg.properties.replyTo, Buffer.from(temp.toString()) , {
            correlationId: msg.properties.correlationId
        })
        channel.ack(msg);
    })
};

processTask();