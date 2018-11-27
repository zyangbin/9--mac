import Vue from 'vue'
import axios from 'axios'
const _this = Vue.prototype
const token = sessionStorage.usertoken

export class Message {
    constructor(){

    }
    // 消息类型(文字，语音，位置，图片，文件，视频)
    static messageType = [
        {
            type:'VoiceMessage',name:'语音'
        },
        {
            type:'ImageMessage',name:'图片'
        },
        {
            type:'LocationMessage',name:'地理位置'
        },
        {
            type:'RichContentMessage',name:'图文'
        },
        {
            type:'FileMessage',name:'文件'
        },
        {
            type:'SightMessage',name:'视频'
        },{
            type:'IdentityNotification',name:'提醒认证'
        }
    ]
    // 获取历史消息
    static getHistoryMessage(){

    }
    // 发送消息
    static sendMessage(){

    }
    // 接受消息
    static getMessage(){

    }
    // 添加好友/同意好友/拒绝好友/删除好友
    /**
     * 
     * handleType:1 添加好友请求
     * handleType:2 同意好友请求
     * handleType:3 拒绝好友请求
     * handleType:4 删除好友
     */
    static handleFriend(params, callback){
        let messageName = "handleFriend"; // 消息名称。
        let objectName = params.objectName; // 消息内置名称，请按照此格式命名。
        let mesasgeTag = new RongIMLib.MessageTag(true,true);// 消息是否保存是否计数，true true 保存且计数，false false 不保存不计数。
        // 消息类中的属性名
        let prototypes = [
            'backUpMsg',
            'handleType',
            'receiverUUID',
            'senderAvatar',
            'senderUUID',
            'senderNickName']
        RongIMClient.registerMessageType(messageName,objectName,mesasgeTag,prototypes);
        let targetId = params.receiverUUID; // 想获取自己和谁的历史消息，targetId 赋值为对方的 Id。
        if(targetId==''){
            return
        }
        let conversationType = RongIMLib.ConversationType.PRIVATE; //单聊,其他会话选择相应的消息类型即可。
        let msg = new RongIMClient.RegisterMessage.handleFriend(
            {
                backUpMsg:params.backUpMsg,
                handleType:params.handleType,
                receiverUUID:params.receiverUUID,
                senderAvatar:params.senderAvatar,
                senderUUID:params.senderUUID,
                senderNickName:params.senderNickName,
        })
        
        RongIMClient.getInstance().sendMessage(conversationType,targetId, msg, {
            onSuccess: function (message) {
                callback(message)
            },
            onError: function (errorCode) {
                callback(errorCode)
            }
        });
    }
    // 自定义提醒认证消息
    static remindAuthentication(params,callback){
        let messageName = 'IdentityNotification'
        let objectName = 'WY:IdentityNotification' // 消息内置名称，请按照此格式命名。
        let mesasgeTag = new RongIMLib.MessageTag(true,true);//
        let prototypes = [
            'receiverUUID',
            'senderUUID',
            'tipsContent']
        RongIMClient.registerMessageType(messageName,objectName,mesasgeTag,prototypes)
        let targetId = params.receiverUUID; // 想获取自己和谁的历史消息，targetId 赋值为对方的 Id。
        if(targetId==''){
            return
        }
        let conversationType = RongIMLib.ConversationType.PRIVATE
        let msg = new RongIMClient.RegisterMessage.IdentityNotification(
            {
                receiverUUID:params.receiverUUID,
                senderUUID:params.senderUUID,
                tipsContent:params.tipsContent,
        })
        RongIMClient.getInstance().sendMessage(conversationType,targetId, msg, {
            onSuccess: function (message) {
                callback(message)
            },
            onError: function (errorCode) {
                callback(errorCode)
            }
        });

    }
    
    // 清除单群聊历史消息
    static clearHistoryMsg(params, callback){
        const { list } = params
        for(let item of list){
            let type = ''
            if(item.conversationType == 'PRIVATE'){
                type = 'PRIVATE'
            }
            if(item.conversationType == 'GROUP'){
                type = 'GROUP'
            }
            const _params = {
                conversationType:RongIMLib.ConversationType[type],
                targetId:item.targetId,
                timestamp:item.sentTime
            }
            RongIMLib.RongIMClient.getInstance().clearRemoteHistoryMessages(_params, {
                onSuccess: function() {
                    callback({status:true})
                },
                onError: function(error) {
                    // console.log(error)
                    callback({status:false})
                }
            })
        }
    }
}