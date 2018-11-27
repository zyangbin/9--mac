export class addFriendMessage{
    constructor(obj){
        this.friendName = obj.nickname
        this.avatar = obj.avatar
        this.sentTime = obj.sentTime
        this.message = obj.message
        this.goUuid = obj.fromUuid
        this.origin = JSON.stringify(obj)
    }
    pushLocalDB(){
        localStorage.setItem('WNuser:' + this.goUuid, this.origin)
    }
}