import Vue from 'vue'
import Vuex from 'vuex'
import { addFriendMessage } from '../components/common/addFriendMessage'
import { stat } from 'fs-extra-p';
import _ from 'lodash'
import { MessageType } from '../rongcloud/messageType'
// import message from '../database/message'
Vue.use(Vuex)

export default new Vuex.Store({
    state:{
        currentFriendName:{},
        whichList:'messageList',
        conversationId:'',
        userData:{},
        userinfostatus:false,
        friendlist:[],
        sendedMessage:[],
        loadingstatus:false,
        conversationList:[],
        hasMsg:true,
        imgFileUrl:[],
        newFriend:[],
        userInfo:null,
        groupList:[],
        currentGroup:null,
        appSetting:null,
        addFrienduuid:null,
        showMemberCount:7,
        friendLocation:'',
        searchList:[],
        currentUnreadCount:0,
        appLatestMsg:null,
        messageObjs:[],
        syncMessageStatus:null
    },
    mutations:{
        // 已读未读消息
        getSyncMessageStatus(state,params){
            state.syncMessageStatus = params.list
        },
        // 读取所有的消息
        getMsgObjs(state,params){
            if(params.handle==='init'){
                state.messageObjs = params.list
            }
        },
        // 销毁所有数据
        destroyState(state){
            state.conversationList = []
            state.currentFriendName = {}
        },
        // 记录收到的最新一条消息
        getAppLatestMsg(state,params){
            state.appLatestMsg = params
            // console.log(params)
        },
        // 当前会话未读消息数量
        getCurrentUnreadCount(state,params){
            const { count, handle } = params
            state.currentUnreadCount = count
        },
        // 本地搜索结果列表
        searchList(state,params){
            const list = params
            state.searchList = list
        },
        // app--->设置
        appSetting(state, params){
            state.appSetting = params
        },
        // 当前群组资料相关操作
        showGroupInfo(state,params){
            const { group, handle } = params
            if(handle=='getInfo'){
                state.currentGroup = group
            }
            if(handle=='rename'){
                const { id, name } = params
                let groupList = state.groupList
                let conversationList = state.conversationList
                for(let item of groupList){
                    if(item.id==id){
                        item.name = name
                        break
                    }
                }
                state.groupList = groupList
                groupList = []
                for(let item of conversationList){
                    if(item.targetId==id){

                        item.nickname = name
                        break
                    }
                }
                state.conversationList = conversationList
                conversationList = []
                // console.log(state.conversationList)
                // console.log(state.groupList)
            }
        },
        // 查看好友资料
        showFriendMsg(state,item){
            let{ address, nickname, sex, mobile, uuid, number, signature} = item
            let obj = {
                address,
                nickname,
                sex,
                mobile,
                uuid,
                remarkName:item.remark_name,
                remarkMore:item.remark_more,
                headimgurl:item.avatar,
                number,
                signature
            }
            state.userInfo = obj
        },
        // 添加好友请求
        addNewFriend(state,item){
            if(item){
                new addFriendMessage(item).pushLocalDB()
                if(item.str=='delete'){
                    let friendName =  item.fromUser
                    localStorage.removeItem(friendName)
                }
            }
            state.newFriend = []
            let keys = Object.keys(localStorage)
            for(let item1 of keys){
                if(item1.indexOf('WNuser:')>=0 && item1!='WNuser:undefined' && JSON.parse(localStorage.getItem(item1)).receiverUUID==state.userData.data.uuid){
                    let res = {
                        fromUser:item1,
                        info:JSON.parse(localStorage.getItem(item1))
                    }
                    let exist = false
                    for(let _item of state.friendlist){
                        if(_item.uuid==JSON.parse(localStorage.getItem(item1)).fromUuid){
                            exist = true
                            break
                        }
                    }
                    if(!exist){
                        state.newFriend.push(res)
                    }
                }
            }
        },
        // 删除好友
        deleteFriend(state, item){
            let idx = item.uuid || item.targetId
            // 更新好友列表 
            for(let i=0;i<state.friendlist.length;i++){
                if(state.friendlist[i].uuid==idx){
                    state.friendlist.splice(i, 1)
                }
            }
            // for(let f of state.friendlist){
            //     if(f.uuid==idx){
            //         state.friendlist.splice(state.friendlist.indexOf(f),1)
            //     }
            // }
            // 更新会话列表
            // for(let k of state.conversationList){
            //     if(k.targetId==idx){
            //         state.conversationList.splice(k, 1)
            //     }
            // }
        },
        // 切换会话好友
        changeCurrentFriendName(state,item){
            if(Object.keys(state.currentFriendName).length>0){
                if(state.currentFriendName.targetId!=item.targetId){
                    state.currentFriendName = item
                }
            }
            if(Object.keys(state.currentFriendName).length==0){
                if(state.currentFriendName.targetId!=item.targetId){
                    state.currentFriendName = item
                }
            }
        },
        // 发送图片消息
        sendImgMessage(state,params){
            if(params.str=='push'){
                state.imgFileUrl.push(params.fileUrl + '~~~' + params.imgBase64)
            }
            if(params.str=='delete'){
                let target = state.imgFileUrl.indexOf(params.fileUrl + '~~~' + params.imgBase64)
                state.imgFileUrl.splice(target,1)
            }
        },
        // 切换列表(好友列表，会话列表，搜索列表)
        showWhichList(state,str){
            state.whichList = str
        },
        
        // 获取用户信息
        getUserData(state,user){
            state.userData = user
        },

        // 显示/隐藏用户信息
        changeUserInfoStatus(state,str){
            if(str=="show"){
                state.userinfostatus = true
            }else{
                state.userInfo = null
                state.userinfostatus = false
            }
        },
        // 更新好友头像
        updateFriendPortrait(state,params){
            let { list } = params
            let arr = state.friendlist
            for(let i=0;i<arr.length;i++){
                if(arr[i].uuid==list.id){
                    arr[i].avatar = list.icon
                    break
                }
            }
            state.friendlist = arr
        },
        // 获取好友列表
        getFriendList(state,arr){
            state.friendlist = arr
        },

        // 获取当前会话历史消息
        getSendedMessage(state,params){
            if(params.str=="changeFriend"){
                state.sendedMessage = _.map(params.list,(item)=>{
                    return new MessageType(item).updateSendedMsg('change-friend')
                })
            }
            if(params.str=="new"){
                if(params.list.objectName!=='RC:RcCmd' && params.list.targetId == state.currentFriendName.targetId){
                    state.sendedMessage.push(params.list)
                }
                if(params.list.objectName==='RC:RcCmd' && params.list.content.targetId==state.currentFriendName.targetId){
                    state.sendedMessage.push(params.list)
                    for(let i=0;i<state.sendedMessage.length;i++){
                        if(params.list.content.messageUId==state.sendedMessage[i].messageUId){
                            state.sendedMessage.splice(i,1)
                        }
                    }
                }
            }
            if(params.str=='withdraw'){
                for(let item of state.sendedMessage){
                    if(item.messageUId==params.handleMsg.messageUId){
                        item.isRecall = true
                    }
                }
                state.sendedMessage.push(params.list)
            }
            if(params.str=='delete'){
                for(let i=0;i<state.sendedMessage.length;i++){
                    if(state.sendedMessage[i].messageUId==params.handleMsg.messageUId){
                        state.sendedMessage.splice(i,1)
                        break
                    }
                }
            }
            if(params.str == "push" || params.str == 'push-history'){
                params.list = _.map(params.list,(item)=>{
                    return new MessageType(item).updateSendedMsg('change-friend')
                })
                if(params.str=='push'){
                    state.sendedMessage = state.sendedMessage.concat(params.list)
                }
                if(params.str=='push-history'){
                    state.sendedMessage = params.list.concat(state.sendedMessage)
                }
                if(params.list[0].objectName==='RC:RcCmd' && params.list[0].messageDirection==2){
                    let exist = false
                    if(params.list[0].conversationType==1 && params.list[0].senderUserId==state.currentFriendName.targetId){
                        exist = true
                    }
                    if(params.list[0].conversationType==3 && params.list[0].targetId==state.currentFriendName.targetId){
                        exist = true
                    }
                    if(exist==true){
                        for(let i=0;i<state.sendedMessage.length;i++){
                            if(params.list[0].content.messageUId==state.sendedMessage[i].messageUId){
                                state.sendedMessage.splice(i,1)
                            }
                        }
                    }
                }
            }
            if(params.str == '@msg'){
                state.sendedMessage = _.map(state.sendedMessage,(o)=>{
                    if(o.messageUId==params.msg.messageUId){
                        o = params.msg
                    }
                    return o
                })
            }
        },
        hasMessage(state,bool){
            state.hasMsg = bool
        },
        // 进入会话时的loading效果
        changeloadingstatus(state,str){
            if(str=="show"){
                state.loadingstatus = true
            }else{
                state.loadingstatus = false
            }
        },
        // 获取会话列表
        getConversationList(state,params){
            const { list, handle } = params
            // 会话置顶 | 免打扰
            if(handle=='topOrtips'){
                let newArr = _.map(state.conversationList,(item=>{
                    if(item.targetId==list.targetId){
                        item.isTop = list.isTop
                        item.noTips = list.noTips
                        if(item.noTips=='1'){
                            item.unReadCount = 0
                        }
                        return item
                    }else{
                        return item
                    }
                }))
                state.conversationList = newArr
            }
            // 初始化会话列表
            if(handle=='uniq'){
                state.conversationList = list
            }
            // 添加好友-->增加一个会话
            if(handle=='push' && (list[0].extra == "newFriend" || list[0].extra=='init')){
                let res = _.find(state.conversationList,(o)=>o.targetId==list[0].targetId)
                if(res==undefined){
                    state.conversationList.push(list[0])
                } 

            }
            // 删除一个会话
            if(handle=='delete'){
                let targetId = list.uuid || list.id || list.targetId
                for(let i=0;i<state.conversationList.length;i++){
                    if(state.conversationList[i].targetId==targetId){
                        state.conversationList.splice(i, 1)
                        break
                    }
                }
            }
            // 清除聊天记录-->更新 latestmsg
            if(handle=='clear-latestmsg'){
                let conversationList = state.conversationList
                for(let i=0;i<list.length;i++){
                    for(let j=0;j<conversationList.length;j++){
                        if(list[i].targetId==conversationList[j].targetId){
                            conversationList[j].latestmsg = ''
                            conversationList[j].unReadCount = 0
                            break
                        }
                    }
                }
                state.conversationList = conversationList
                conversationList = []
            }
            // 记录@消息的时间
            if(handle=='@msg'){
                let idx = _.findIndex(state.conversationList,{targetId:list.targetId})
                if(idx>=0){
                    state.conversationList[idx].pointMsgTime = new Date().getTime()
                }
            }
            // 群变动修改latestmsg
            if(handle=='Rename'){
                state.conversationList = _.map(state.conversationList,(item)=>{
                    if(item.targetId==list.targetId){
                        item.latestmsg = '[修改群名称]'
                    }
                    return item
                })
            }
            if(handle=='Add'){
                state.conversationList = _.map(state.conversationList,(item)=>{
                    if(item.targetId==list.targetId){
                        item.latestmsg = '[添加群成员]'
                    }
                    return item
                })
            }
            if(handle=='Kicked'){
                state.conversationList = _.map(state.conversationList,(item)=>{
                    if(item.targetId==list.targetId){
                        item.latestmsg = '[删除群成员]'
                    }
                    return item
                })
            }
            if(handle=='Create'){
                state.conversationList = _.map(state.conversationList,(item)=>{
                    if(item.targetId==list.targetId){
                        item.latestmsg = '[创建群组]'
                    }
                    return item
                })
            }
            if(handle=='Quit'){
                state.conversationList = _.map(state.conversationList,(item)=>{
                    if(item.targetId==list.targetId){
                        item.latestmsg = '[退出群组]'
                    }
                    return item
                })
            }
            // 将某条会话放在会话列表的第一条显示
            if(handle=='isTop'){
                state.conversationList = _.map(state.conversationList,(item)=>{
                    if(item.targetId==list.targetId){
                        item.sentTime = new Date().getTime()
                    }
                    return item
                })
            }
            // 更新会话头像
            if(handle=='updateicon'){
                // if(list.conversationType=='GROUP'){
                state.conversationList = _.map(state.conversationList,(item)=>{
                    if(item.targetId==list.id){
                        item.avatar = list.icon
                    }
                    return item
                })
                // }
            }
            // 修改群会话的最近一条消息的发送者
            if(handle=='latest'){
                state.conversationList = _.map(state.conversationList,(item)=>{
                    if(item.targetId==list.targetId){
                        item.latestname = list.nickname
                    }
                    return item
                })
            }
        },
        // 清除未读消息
        clearUnreadCount(state,id){
            for(let item of state.conversationList){
                if(item.targetId==id){
                    item.unReadCount = 0
                    break
                }
            }
            _.map(state.conversationList,(item)=>{
                if(item.targetId==id){
                    item.pointMsgTime = 0
                }
            })
        },
        // 添加未读消息
        addUnreadCount(state,msg){
            if(msg.senderUserId==msg.targetId && msg.objectName == 'RC:RcCmd'){
                for(let item of state.conversationList){
                    if(item.targetId==state.currentFriendName.targetId){
                        item.latestmsg = '[撤回消息]'
                        break
                    }
                }
                return
            }
            state.conversationList = _.map(state.conversationList,(item)=>{
                if(item.targetId==msg.targetId){
                    item.latestmsg = msg.content.content
                    item.sentTime = msg.sentTime
                    if(msg.addcount!='1'){
                        if(msg.targetId==state.currentFriendName.targetId){
                            item.unReadCount = 0
                        }else{
                            if(item.noTips=='1'){
                                item.unReadCount = 0
                            }else{
                                item.unReadCount += 1
                            }
                        }
                    }
                }
                return item
            })
        },
        // 获取用户所属群组信息
        getGroupList(state,params){
            const { list, handle } = params
            if(handle=="reset"){
                state.groupList = list
            }
            if(handle=='push'){
                state.groupList.push(list)
            }
            if(handle=='delete'){
                for(let i=0;i<state.groupList.length;i++){
                    if(state.groupList[i].id==params.list.id){
                        state.groupList.splice(i, 1)
                        break
                    }
                }
                // state.groupList.splice( state.groupList.indexOf(params.list), 1)
            }
            if(handle=='updateicon'){
                let arr = state.groupList
                for(let i=0;i<arr.length;i++){
                    if(arr[i].id==list.id){
                        arr[i].icon = list.icon
                        break
                    }
                }
                state.groupList = arr
            }
            // if(handle=='update-reduce'){
            //     const { groupId } = params
            //     const { memberId } = params
            //     for(let item of state.groupList){
            //         if(item.id==groupId){

            //         }
            //     }
            // }
        },
        // 添加群成员为好友
        addFrienduuid(state,item){
            state.addFrienduuid = item
        },
        // 展示群成员的个数
        showMemberCount(state,count){
            state.showMemberCount = count
        },
        // 获取好友定位消息
        friendLocation(state, location){
            state.friendLocation = location
        }
    }
})
