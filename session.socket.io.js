module.exports = function(io, sessionStore, cookieParser, key){
  key = key || 'connect.sid';
  return function(socket, next){
    socket.getSession = function(callback){
      cookieParser(socket.handshake, {}, function (parseErr){
        if(parseErr){ callback(parseErr); return; }
        sessionStore.get(findCookie(socket.handshake), function (storeErr, session) {
          callback(storeErr, session);
        });
      });
    };
    next();
  };

  function findCookie(handshakeInput) {
    // fix for express 4.x (parse the cookie sid to extract the correct part)
    var handshake = JSON.parse(JSON.stringify(handshakeInput)); // copy of object
    if(handshake.secureCookies && handshake.secureCookies[key]) handshake.secureCookies = handshake.secureCookies[key].match(/\:(.*)\./).pop();
    if(handshake.signedCookies && handshake.signedCookies[key]) handshake.signedCookies[key] = handshake.signedCookies[key].match(/\:(.*)\./).pop();
    if(handshake.cookies && handshake.cookies[key]) handshake.cookies[key] = handshake.cookies[key].match(/\:(.*)\./).pop();

    // original code
    return (handshake.secureCookies && handshake.secureCookies[key])
      || (handshake.signedCookies && handshake.signedCookies[key])
      || (handshake.cookies && handshake.cookies[key]);
  }
};