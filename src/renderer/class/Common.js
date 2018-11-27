export class Common{
    constructor(){

    }
    // 生成二维码
    static createErweima(callback){
        const wsServer = 'ws://47.106.228.86:9501'
        let websocket = new WebSocket(wsServer)
        websocket.onopen = (evt)=>{
            callback(evt.data)
        }
        websocket.onclose = (evt)=>{
            callback(evt.data)
        }
        websocket.onmessage= (evt)=>{
            const res = JSON.parse(evt.data)
            if(res.code==200 && res.fd!=undefined){
                // console.log(res)
                // console.log($('#erweima'))
                let qrcode = new QRCode('erweima', {
                    text: `mcpc://${JSON.parse(evt.data).fd}`,
                    width: 150,
                    height: 150,
                    colorDark : '#333000',
                    colorLight : '#ffffff',
                    correctLevel : QRCode.CorrectLevel.H
                })
                let query = '{type:"login","fd":'+ evt.data.fd +'}'
                websocket.send(query)
            }else{
                callback(evt.data)
            }
        }
        websocket.onerror = (evt, e)=>{
            callback(evt.data)
        }       
    }
    // 判断当前会话是否存在好友列表或群组列表中
    static judgeExit(params, callback){
        const { conversationType, _this } = params
        if(conversationType=='PRIVATE'){
            if(_this.friendlist.length==0){
                callback({ exit:false, tips:'您不是对方好友！' })
            }else{
                let exit = false
                for(let item of _this.friendlist){
                    if(item.uuid==params.targetId){
                        exit = true
                        break
                    }
                }
                callback({ exit, tips:'您不是对方好友！' })
            }
        }
        if(conversationType=='GROUP'){
            if(_this.groupList.length==0){
                callback({ exit:false, tips:'您不在群组中！' })
            }else{
                let exit = false
                for(let item of _this.groupList){
                    if(item.id==params.targetId){
                        exit = true
                        break
                    }
                }
                callback({ exit, tips:'您不在群组中！' })
            }
        }
    }
}