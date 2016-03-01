var rabbit = require('amqplib');

// server configuration

//TODO: extract into the config file.
var server = 'amqp://guest:guest@localhost';
var readLine = require('readline');

var exchangeName = 'orders.ex';
var exchangeType = 'direct';
var connection, channel;
var queueOptions = {durable: true};
var routingKey = '';

function initPublisher(server){
  return rabbit.connect(server)
          .then(registerChannel)
          .then(registerExchange);
}

initPublisher(server).then(publishMessages);

function registerChannel(conn){
    console.log('registering channel');
    connection = conn;
    return conn.createChannel();
}

function registerExchange(ch){
  console.log('registering exchange');
    channel = ch;

  return ch.assertExchange(exchangeName, exchangeType)
}

function publishMessages(){

   var prompt = readLine.createInterface(process.stdin, process.stdout);

   prompt.question('Type the message you want to send: ', function(msg){
      var message = new Buffer(msg);
      channel.publish(exchangeName, routingKey, message);
   });


  //  channel.close();
  // publishMessages();


  connection.on('close', function(){
    console.log('connection closed');
    console.log('trying to reconnect');
     initSubscriber().then(publishMessages);
  });


}
