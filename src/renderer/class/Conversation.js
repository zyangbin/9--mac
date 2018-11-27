import { Friend } from './Friend.js'
import { Group } from './Group.js'
import { Message } from './Message'
import message from '../database/message'
import async from 'async'
import conversation_db from '../database/conversation'
import store from '../store/store'
import { getHistoryMessages } from '../rongcloud/getHistoryMessage'
import { MessageType } from '../rongcloud/MessageType'
import $ from 'jquery'

// 获取所有会话
function getAllConversationList(callback){
    RongIMClient.getInstance().getConversationList({
        onSuccess: function(list) {
            callback(list)
        },
        onError: function(error) {
           // do something...
        }
    },null);
}
export class Conversation {
    constructor(){

    }
    // 过滤会话列表(过滤非好友和非所属群组的会话))
    static getConversationList(callback){
        getAllConversationList(allList=>{
            Group.getGroup(groupList=>{
                Friend.getFriendList(friendList=>{
                    for(let item of allList){
                        // 过滤群组
                        if(item.conversationType=='3'){
                            for(let g of groupList){
                                if(item.targetId==g.id){
                                    Group.getGroupInfo({id:g.id},res=>{
                                        let conversation = [{
                                            avatar:res.baseInfo.group_info.icon,
                                            nickname:res.baseInfo.group_info.name,
                                            remarkName:'',
                                            sentTime:item.sentTime,
                                            unReadCount:window.$sync==2 ? 0 : item.unreadMessageCount,
                                            targetId:item.targetId,
                                            conversationType:'GROUP',
                                            isTop:'0',
                                            noTips:'0',
                                            extra:'init'
                                        }]
                                        getHistoryMessages(String(g.id),hisMsg=>{
                                            if(hisMsg.length>0){
                                                store.commit('getConversationList',{
                                                    handle:'push',
                                                    list:conversation
                                                })
                                                new MessageType(item.latestMessage,'login')
                                            }else{
                                                conversation[0].latestmsg = ''
                                                conversation[0].latestname = ''
                                                store.commit('getConversationList',{
                                                    handle:'push',
                                                    list:conversation
                                                })
                                            }
                                        },0,'GROUP')
                                    })
                                }
                            }
                        }
                        // 过滤好友
                        if(item.conversationType=='1'){
                            for(let f of friendList){
                                if(item.targetId==f.uuid){
                                    let conversation = [{
                                        avatar:f.avatar,
                                        nickname:f.nickname,
                                        remarkName:f.remark_name,
                                        sentTime:item.sentTime,
                                        authTime:item.authTime,
                                        unReadCount:window.$sync==2 ? 0 : item.unreadMessageCount,
                                        targetId:item.targetId,
                                        conversationType:'PRIVATE',
                                        isTop:'0',
                                        noTips:'0',
                                        extra:'init'
                                    }]
                                    getHistoryMessages(String(f.uuid),hisMsg=>{
                                        if(hisMsg.length==0){
                                            store.commit('getConversationList',{
                                                handle:'push',
                                                list:conversation
                                            })
                                        }else{
                                            store.commit('getConversationList',{
                                                handle:'push',
                                                list:conversation
                                            })
                                            item.latestMessage.targetId = item.targetId
                                            new MessageType(item.latestMessage,'login')
                                        }
                                    },0,'PRIVATE')
                                }
                            }
                        }
                    }
                    callback({conversationList:[], friendList, groupList})
                })
            })
        })
    }
    // 删除会话
    static deleteConversation(params, callback){
        const { type, id } = params
        RongIMClient.getInstance().removeConversation(type, id, {
            onSuccess:function(bool){
                callback(bool)
            },
            onError:function(error){
               callback(error)
            }
        });
    }
    /*
      创建会话
        @ 对方不在会话列表中
        @ 从好友列表创建会话
        @ 接收好友消息时创建会话
    */
    static createConversation(params){
        const { item, intoConversation, type } = params
        // 创建好友会话
        if(type=='friend'){
            var list = [{
                avatar:item.avatar || item.headimgurl,
                nickname:item.nickname,
                remarkName:item.remark_name || item.remarkName,
                latestmsg:params.latestmsg ? params.latestmsg : '',
                sentTime:params.sentTime ? params.sentTime : new Date().getTime(),
                unReadCount:params.unReadCount ? params.unReadCount : 0,
                targetId:String(item.uuid),
                extra:'newFriend',
                conversationType:'PRIVATE',
                isTop:'0',
                noTips:'0'
            }]
            store.commit('getConversationList', {
                list:list,
                handle:'push'
            })
            if(intoConversation){
                store.commit('changeCurrentFriendName',list[0])
                $('.init').hide()
            }
        }
        // 创建群组会话(自己建群/好友拉群/好友建群)
        if(type=='group'){
            Group.getGroupInfo({id:item.id ? item.id : item.uuid},res=>{
                var list = [{
                    avatar:res.baseInfo.group_info.icon,
                    nickname:res.baseInfo.group_info.name,
                    remarkName:'',
                    latestmsg:params.latestmsg ? params.latestmsg : '',
                    sentTime:params.sentTime ? params.sentTime : new Date().getTime(),
                    unReadCount:params.unReadCount ? params.unReadCount : 0,
                    targetId:String(item.id ? item.id : item.uuid),
                    extra:'newFriend',
                    conversationType:'GROUP',
                    isTop:'0',
                    noTips:'0'
                }]
                store.commit('getConversationList', {
                    list:list,
                    handle:'push'
                })
                if(intoConversation){
                    store.commit('changeCurrentFriendName',list[0])
                    $('.init').hide()
                }
            })
        }
    }
    // 清除指定所有会话
    static clearConversation(){
        const { type, id } = params
        RongIMClient.getInstance().clearConversations({
            onSuccess:function(){
                // 清除会话成功
                // console.log('清除所有会话成功')
            },
            onError:function(error){
                // error => 清除会话错误码。
                // console.log('清除所有会话失败')
            }
        })  
    }
}