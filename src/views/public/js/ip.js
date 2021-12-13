function is_ipv4(ip) {
  return regex_v4.test(ip);
};

function is_ipv6(ip) {
  return regex_v6.test(ip);
};

var simpleIPRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g;

let regex_v4 = /((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])/;

let regex_v6 = /((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))/;

let ip_regex_array = [regex_v6, regex_v4]

function peer(callback) {
  var WebRTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
  var createdConnection;

  function start(){
    createConnection()
    createStunRequest()
  };

  function stop() {
    if (createdConnection) {
      try {
        createdConnection.close();
      } finally {
        createdConnection.onicecandidate = () => {};
        createdConnection = null;
      };
    };
  };

  function createConnection(){
    let iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
    createdConnection = new WebRTCPeerConnection({ iceServers });
    createdConnection.onicecandidate = (data) => handleCandidates(data);
    createdConnection.createDataChannel('fake_data_channel');
  };

  function createStunRequest() {
    return createdConnection.createOffer().then(sdp => createdConnection.setLocalDescription(sdp));
  };

  function handleCandidates(ice) {
    if (ice && ice.candidate && ice.candidate.candidate) {
      callback(ice && ice.candidate && ice.candidate.candidate);
    };
  };

  return {
      start, 
      stop,
      createConnection,
      createStunRequest,
      handleCandidates
  };
};

function publicIPs(timer){
  if(timer) if(timer < 100) throw new Error('Custom timeout cannot be under 100 milliseconds.');
  var IPs = [];
  var peerConn = peer(handleIceCandidates);
  function getIps() {
    return new Promise(function(resolve, reject) {
      peerConn.start();
      setTimeout(() => {
        if(!IPs || IPs === []) {
          reject('No IP addresses were found.')
        } else {
          resolve(unique(IPs.flat(Infinity)))
        };
        reset();
      }, timer || 500);
    });
  };

  function handleIceCandidates(ip) {
    var array = [];
    for(let regex of ip_regex_array) {
      let arr = [];
      let possible_ips_array = regex.exec(ip)
        if(possible_ips_array) {
          for(let i = 0; i < possible_ips_array.length; i++) {
            if(is_ipv4(possible_ips_array[i]) || is_ipv6(possible_ips_array[i])) {
              arr.push(possible_ips_array[i])
            };
          };
          array.push(arr);
        };
    };
    push(array.flat(Infinity))
  };

  function push(ip) {
    if(!IPs.includes(ip)) {
      IPs.push(unique(ip.flat(Infinity)));
    };
  };

  function reset() {
    peerConn.stop()
  };
  function unique(a) {
    return Array.from(new Set(a));
  };

  return getIps();
};

function getIPTypes(timer) {
  return new Promise(function(resolve, reject) {
    let finalIpArray = []
    publicIPs(timer).then((ips)=>{
      ips.forEach(ip => {
        if (ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/)) {
          finalIpArray.push({ ip: ip, type: 'private', IPv4: true })
        } else if (ip.match(/((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))/)) {
          finalIpArray.push({ ip: ip, type: 'IPv6', IPv4: false })
        } else {
          finalIpArray.push({ ip: ip, type: 'public', IPv4: true })
        }
      })
      resolve(finalIpArray)
    }).catch(reject)
  });
}

function getIPv4(timer) {
  return getIPTypes(timer).then(ips => {
      const ip = ips.filter(ip => ip.IPv4);
      for(let i = 0; i < ip.length; i++) {
        ip[i] = ip[i].ip
      }
      return ip ? ip : '';
  });
}

function getIPv6(timer) {
  return getIPTypes(timer).then(ips => {
    const ip = ips.filter(ip => ip.type === 'IPv6');
    for(let i = 0; i < ip.length; i++){
      ip[i] = ip[i].ip
    }
    return ip ? ip.ip : '';
  });
}

function getIPs(timer){
return Object.assign(publicIPs(timer), {
    types: getIPTypes,
    public: publicIPs,
    IPv4: getIPv4,
    IPv6: getIPv6,
  })
};