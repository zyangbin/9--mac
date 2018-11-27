export function getHistoryMessages(friendid,callback,timestrap,msgtype){
    var conversationType = RongIMLib.ConversationType[msgtype]; //单聊,其他会话选择相应的消息类型即可。
    var targetId = friendid; // 想获取自己和谁的历史消息，targetId 赋值为对方的 Id。
    var timestrap = timestrap; // 默认传 null，若从头开始获取历史消息，请赋值为 0 ,timestrap = 0;
    var count = 20; // 每次获取的历史消息条数，范围 0-20 条，可以多次获取。
    RongIMLib.RongIMClient.getInstance().getHistoryMessages(conversationType, targetId, timestrap, count, {
        onSuccess: function(list, hasMsg) {
            // console.log(list)
            callback(list, hasMsg)
        },
        onError: function(error) {
            console.log("GetHistoryMessages,errorcode:" + error);
        }
    })
    
}
