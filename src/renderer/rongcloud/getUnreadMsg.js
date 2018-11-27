export function getUnreadMsgCount(){
    RongIMClient.getInstance().getTotalUnreadCount({
    onSuccess:function(count){
        // count => 所有会话总未读数。
        // console.log('未读消息数：' + count)
    },
    onError:function(error){
        // error => 获取总未读数错误码。
        // console.log(error)
    }
    });
}