export function clearUnreadCount(msgtype,targetId,callback){
    var clearUnreadCount = RongIMClient.getInstance().clearUnreadCount
    var conversationType = RongIMLib.ConversationType[msgtype]
    clearUnreadCount(conversationType, targetId, {
        onSuccess: function () {
            callback(targetId)
        },
        onError: function (errorCode) {

        }

    });
}