function sendMessage(type,content,targetId,callback){
    var msg = new RongIMLib.TextMessage({content,extra:"附加信息"});
    var conversationtype = RongIMLib.ConversationType[type]
    // console.log(conversationtype)
    // var conversationtype = RongIMLib.ConversationType.PRIVATE; // 单聊,其他会话选择相应的消息类型即可。
    var targetId = targetId; // 目标 Id
    RongIMClient.getInstance().sendMessage(conversationtype, targetId, msg, {
                onSuccess: function (message) {
                    //message 为发送的消息对象并且包含服务器返回的消息唯一Id和发送消息时间戳
                    // console.log("Send successfully");
                    callback(message)
                },
                onError: function (errorCode,message) {
                    var info = '';
                    switch (errorCode) {
                        case RongIMLib.ErrorCode.TIMEOUT:
                            info = '超时';
                            break;
                        case RongIMLib.ErrorCode.UNKNOWN_ERROR:
                            info = '未知错误';
                            break;
                        case RongIMLib.ErrorCode.REJECTED_BY_BLACKLIST:
                            info = '在黑名单中，无法向对方发送消息';
                            break;
                        case RongIMLib.ErrorCode.NOT_IN_DISCUSSION:
                            info = '不在讨论组中';
                            break;
                        case RongIMLib.ErrorCode.NOT_IN_GROUP:
                            info = '不在群组中';
                            break;
                        case RongIMLib.ErrorCode.NOT_IN_CHATROOM:
                            info = '不在聊天室中';
                            break;
                        default :
                            info = x;
                            break;
                    }
                    callback(info)
                    // console.log('发送失败:' + info);
                }
            }
        );
}
module.exports = sendMessage