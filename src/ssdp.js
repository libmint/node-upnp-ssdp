var dgram = require('dgram');
var events  = require("events");
var util = require("util");

const SSDP_PORT = 1900;
const SSDP_ADDRESS = "239.255.255.250"
const SSDP_MX = 2;

function SSDP() {
    var ssdp = this;
    events.EventEmitter.call(ssdp);

    ssdp.sendMsearch = function(searchTarget) {
        console.log('[SSDP] sendMsearch');
        var discoverMessage = new Buffer("M-SEARCH * HTTP/1.1\r\n" +
                                         "HOST : " + SSDP_ADDRESS + "\r\n" +
                                         "MAN : \"ssdp:discover\"\r\n" +
                                         "ST : " + searchTarget + "\r\n" +
                                         "MX : " + SSDP_MX + "\r\n" + "\r\n" );

        var msearchSenderSocket = dgram.createSocket("udp4");
        msearchSenderSocket.on('error', function(err) {
            ssdp.emit('error', err);
            msearchSenderSocket.close();
        });

        msearchSenderSocket.bind(SSDP_PORT, function() {
            msearchSenderSocket.addMembership(SSDP_ADDRESS);
        });

        msearchSenderSocket.on('message', function(msg, rinfo) {
            ssdp.emit('discovered', msg);
        });
                        
        msearchSenderSocket.send(discoverMessage, 0, discoverMessage.length, SSDP_PORT, SSDP_ADDRESS);
    }
}

util.inherits(SSDP, events.EventEmitter);
module.exports = new SSDP;