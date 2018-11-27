export function getConversationList(callback){
      RongIMClient.getInstance().getConversationList({
          onSuccess: function(list) {
              callback(list)
          },
          onError: function(error) {
            //   console.log(error)
          }
      },null);
}
