import store from '../store/store'
import { Friend } from '../class/Friend'
import _ from 'lodash'
import { clearUnreadCount } from '../rongcloud/clearUnreadCount'
import { mentionedMsg } from './mentionedMsg'
export class MessageType{
    constructor(message,origin){
        this.message = message
        this.groupMessageType = 'GroupNotificationMessage'
        this.commonType = [
            {type:'TextMessage',content:message.messageType=='TextMessage' ? message.content.content : ''},
            {type:'VoiceMessage',content:'[语音]'},
            {type:'ImageMessage',content:'[图片]'},
            {type:'FileMessage',content:'[文件]'},
            {type:'LocationMessage',content:'[地理位置]'},
            {type:'SightMessage',content:'[小视频]'},
            {type:'IdentityNotification',content:'[提醒认证]'},
            {type:'RecallCommandMessage',content:'[撤回消息]'}
        ]
        this.specialObjName = [
            {type:'RCBQMM:GifMsg',content:'[动态表情]'},
            {type:'RCBQMM:EmojiMsg',content:'[动态表情]'},
            {type:'RC:StkMsg',content:'[动态表情]'},
            {type:'WY:ShareReportMessage',content:'[分享报告]'},
            {type:'WY:UploadpicNotification',content:'[上传照片]'},
            {type:'RC:RcCmd',content:'[撤回消息]'},
            {type:'RC:CardMsg',content:'[个人名片]'},
            {type:'WY:FriendHandle',content:'[添加好友]'}
        ]
        this.groupMsgName = [
            {type:'Create',content:'[创建群组]'},
            {type:'Add',content:'[添加成员]'},
            {type:'Quit',content:'[退出群组]'},
            {type:'Kicked',content:'[删除成员]'},
            {type:'Dismiss',content:'[解散群组]'},
            {type:'Rename',content:'[修改群名称]'}
        ]
        this.origin = origin
        if(origin=='login' || origin=='mySelf' || origin=='friend'){
            this.updateConLatestMsg()
            this.updateConLatestName()
        }
        if(origin=='mySelf' || origin=='friend'){
            let type = ''
            if(message.conversationType==1){
                type = 'PRIVATE'
            }
            if(message.conversationType==3){
                type = 'GROUP'
            }
            if(message.messageDirection==1){
                this.clearConUnreadCount(type,message.targetId)
            }else{
                if(store.state.currentFriendName.targetId==message.targetId){
                    this.clearConUnreadCount(type,message.targetId)
                }
            }
            if(store.state.currentFriendName.targetId==message.targetId){
                this.updateSendedMsg()
            }
        }
    }
    checkMsgType(){
        let checkType = null
        if(this.message.messageType!=this.groupMessageType){
            let { messageType } = this.message
            let { objectName } = this.message
            let msgType = _.find(this.commonType,(item)=>item.type==messageType)
            let objType =  _.find(this.specialObjName,(item)=>item.type==objectName)
            checkType = msgType || objType
        }
        if(this.message.messageType==this.groupMessageType){
            checkType = _.find(this.groupMsgName,(O)=>O.type==this.message.content.operation)
        }
        return checkType
    }
    updateConLatestMsg(){
        let params = {
            targetId:this.message.targetId,
            sentTime:this.message.sentTime,
            content:{
                content:window.$sync==2 ? '' : this.checkMsgType().content
            },
            addcount:(this.origin=='login' || this.origin=='mySelf') ? '1' : '0'  // '1'-->不主动添加未读数
        }
        
        if(this.message.content.mentionedInfo){
            mentionedMsg(this.message,res=>{
                store.commit('addUnreadCount',Object.assign(params,{content:{content:res}}))
            })
        }else{
            store.commit('addUnreadCount',params)
        }  
    }
    updateConLatestName(){
        if(this.message.senderUserId==store.state.userData.data.uuid){
            store.commit('getConversationList',{
                handle:'latest',
                list:{
                    targetId:this.message.targetId,
                    nickname:''
                }
            })
        }else{
            Friend.getFriendInfo(this.message.senderUserId,info=>{
                if(info==null){
                    return
                }
                store.commit('getConversationList',{
                    handle:'latest',
                    list:{
                        targetId:this.message.targetId,
                        nickname:info.remark_name ? info.remark_name : info.nickname
                    }
                })
            })                                   
        }
    }
    clearConUnreadCount(type,targetId){
        clearUnreadCount(type,targetId,(res)=>{
            store.commit('clearUnreadCount',res)
        })
    }
    updateSendedMsg(params){
        let msgType = this.checkMsgType()
        if(msgType==null){
            console.log('未检测到的消息类型',this.message)
            if(params=='change-friend'){
                return this.message
            }
        }
        if(msgType){
            let spcecialMsgType = ['RC:StkMsg','RCBQMM:EmojiMsg','RC:CardMsg','RC:SightMsg','WY:ShareReportMessage','RCBQMM:GifMsg']
            let { objectName } = this.message
            if(spcecialMsgType.indexOf(objectName)>=0){
                let str = this.message.messageDirection==1 ? '发出' : '收到'
                str += msgType.content
                str = str.replace(/\[/gi, '')
                str = str.replace(/\]$/gi, '')
                str += '，请在手机上查看'
                this.message.content.content = str
            }
            if(params=='change-friend'){
                return this.message
            }else{
                store.commit('getSendedMessage',{
                    str:'push',
                    list:[this.message]
                })
            }
        }
    }
}