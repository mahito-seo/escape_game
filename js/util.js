// Utility Functions
// SHA-256 (with fallback for environments without crypto.subtle)
async function sha256(t){
  try{
    var b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t));
    return Array.prototype.map.call(new Uint8Array(b),function(x){return('00'+x.toString(16)).slice(-2);}).join("");
  }catch(e){
    return _sha256fb(t);
  }
}
function _sha256fb(msg){
  function rr(n,x){return(x>>>n)|(x<<(32-n));}
  var K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  var H0=0x6a09e667,H1=0xbb67ae85,H2=0x3c6ef372,H3=0xa54ff53a,H4=0x510e527f,H5=0x9b05688c,H6=0x1f83d9ab,H7=0x5be0cd19;
  // UTF-8 encode
  var bytes=[];
  for(var i=0;i<msg.length;i++){
    var c=msg.charCodeAt(i);
    if(c<0x80)bytes.push(c);
    else if(c<0x800){bytes.push(0xc0|(c>>6));bytes.push(0x80|(c&0x3f));}
    else{bytes.push(0xe0|(c>>12));bytes.push(0x80|((c>>6)&0x3f));bytes.push(0x80|(c&0x3f));}
  }
  var bitLen=bytes.length*8;
  bytes.push(0x80);
  while(bytes.length%64!==56)bytes.push(0);
  // Append 64-bit big-endian length
  bytes.push(0,0,0,0); // high 32 bits (always 0 for short messages)
  bytes.push((bitLen>>>24)&0xff,(bitLen>>>16)&0xff,(bitLen>>>8)&0xff,bitLen&0xff);

  for(var off=0;off<bytes.length;off+=64){
    var w=new Array(64);
    for(var i=0;i<16;i++)w[i]=((bytes[off+i*4]<<24)|(bytes[off+i*4+1]<<16)|(bytes[off+i*4+2]<<8)|bytes[off+i*4+3])>>>0;
    for(var i=16;i<64;i++){
      var s0=(rr(7,w[i-15])^rr(18,w[i-15])^(w[i-15]>>>3))>>>0;
      var s1=(rr(17,w[i-2])^rr(19,w[i-2])^(w[i-2]>>>10))>>>0;
      w[i]=(w[i-16]+s0+w[i-7]+s1)>>>0;
    }
    var a=H0,b=H1,c=H2,d=H3,e=H4,f=H5,g=H6,h=H7;
    for(var i=0;i<64;i++){
      var S1=(rr(6,e)^rr(11,e)^rr(25,e))>>>0;
      var ch=((e&f)^((~e)&g))>>>0;
      var t1=(h+S1+ch+K[i]+w[i])>>>0;
      var S0=(rr(2,a)^rr(13,a)^rr(22,a))>>>0;
      var maj=((a&b)^(a&c)^(b&c))>>>0;
      var t2=(S0+maj)>>>0;
      h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;
    }
    H0=(H0+a)>>>0;H1=(H1+b)>>>0;H2=(H2+c)>>>0;H3=(H3+d)>>>0;
    H4=(H4+e)>>>0;H5=(H5+f)>>>0;H6=(H6+g)>>>0;H7=(H7+h)>>>0;
  }
  function hex(n){return('00000000'+n.toString(16)).slice(-8);}
  return hex(H0)+hex(H1)+hex(H2)+hex(H3)+hex(H4)+hex(H5)+hex(H6)+hex(H7);
}
