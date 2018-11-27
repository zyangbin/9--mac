const qiniu = require('qiniu')
const AK = 'Jhzn_5JsLIduz7OFPXxOInemgkn8J4S5NohKs443'
const SK = 'pu3JS3JWcPrg-lN07iBKIc6S9Etv4QxRttE2rxSP'
const mac = new qiniu.auth.digest.Mac(AK, SK)
const options = {
    scope: 'jhmc',
}
const putPolicy = new qiniu.rs.PutPolicy(options);
const uploadToken=putPolicy.uploadToken(mac)


 
