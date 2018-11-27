export function syncMessageStatus(params){
    const { message, conversation } = params
    let msg = {
        lastMessageSendTime: message.sentTime,
        messageUId: message.messageUId,
        type:1
    }
    msg = new RongIMLib.ReadReceiptMessage(msg)
    RongIMClient.getInstance().sendMessage(RongIMLib.ConversationType[conversation.conversationType], conversation.targetId, msg, {
        onSuccess: function (res) {
            // console.log(res)
        },
        onError: function (err) {
            // console.log(err)
        }
    })
}