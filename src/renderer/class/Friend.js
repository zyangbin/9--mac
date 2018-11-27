import Vue from 'vue'
import axios from 'axios'
const _this = Vue.prototype
export class Friend{
    constructor(){

    }
    // 获取好友列表
    static getFriendList(callback){
        axios.get(_this.ajaxUrl+'/v1/friends',{
            params:{
                token:sessionStorage.usertoken
            }
        }).then(res=>{
            callback(res.data.data)
        })
    }
    // 获取好友信息
    static getFriendInfo(uuid,callback){
        axios.get(_this.ajaxUrl + '/v1/search_friends',{
            params:{
                token:sessionStorage.usertoken,
                to_user:uuid
            }
        }).then(res=>{
            if(res.data.status){
                callback(res.data.data)
            }
        })
    }
    // 添加好友类消息
    static addFriend(params, callback){
        // 定义消息类型
        let messageName = "FriendNotification" // 消息名称。
        let objectName = "WY:FriendNotification" // 消息内置名称，请按照此格式命名。
        let mesasgeTag = new RongIMLib.MessageTag(true,true) // 消息是否保存是否计数，true true 保存且计数，false false 不保存不计数。
        let prototypes = ["name","age"] // 消息类中的属性名。
        RongIMClient.registerMessageType(messageName,objectName,mesasgeTag,prototypes)
        // 发送消息
        let conversationType = RongIMLib.ConversationType.PRIVATE; //单聊,其他会话选择相应的消息类型即可。
        let targetId = params['uuid']; // 想获取自己和谁的历史消息，targetId 赋值为对方的 Id。
        let msg = new RongIMClient.RegisterMessage.FriendNotification({name:"zhang",age:18});
        RongIMClient.getInstance().sendMessage(conversationType,targetId, msg, {
            onSuccess: function (message) {
                callback(message)
            },
            onError: function (errorCode) {
                callback(message)
            }
        });

    }
    // 删除好友
    static deleteFriend(params, callback){
        const { uuid } = params
        axios.delete(_this.ajaxUrl + '/v1/friends/1',{
            params:{
                token:sessionStorage.usertoken,
                to_user:uuid
            }
        }).then(res=>{
            callback(res.data)
        })
    }
}