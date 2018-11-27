<template>
    <div id="contentmenu" props="contentlist msg">
        <el-button v-for="(item,idx) in contentlist" :key="idx"
            @click="handleMsg($event,msg)">
            {{item}}
        </el-button>
    </div>
</template>
<script>
    import store from '../../store/store'
    import {mapState} from 'vuex'
    import { Group } from '../../class/Group'
    import { Conversation } from '../../class/Conversation'
    import { DOMController } from '../../class/DOMController'
    import { Friend } from '../../class/Friend'
    import { Message } from '../../class/Message'
    import { entryOfSendMsg } from '../../public/entryOfSendMsg'
    import conversation_db from '../../database/conversation.js'
    export default {
        data(){
            return {

            }
        },
        computed:{
            ...mapState({
                currentFriend(state){
                    return state.currentFriendName
                },
                friendlist(state){
                    return state.friendlist
                },
                conversationList(state){
                    return state.conversationList
                },
                userData(state){
                    return state.userData
                },
                groupList(state){
                    return state.groupList
                },
                currentGroup(state){
                    return state.currentGroup
                }
            })
        },
        props:['contentlist','msg'],
        methods:{
            // 右键操作
            handleMsg(ev, msg){
                // 置顶会话 || 取消置顶
                if(ev.target.innerText=='置顶会话' || ev.target.innerText=='取消置顶'){
                    let isTop = ev.target.innerText=='置顶会话' ? '1' : '0'
                    conversation_db.set_top({
                        targetId:msg.targetId,
                        userUuid:this.userData.data.uuid,
                        isTop
                    },res=>{
                        if(res.rowsAffected>=1){
                            this.$store.commit('getConversationList',{
                                handle:'topOrtips',
                                list:{
                                    isTop,
                                    userUuid:this.userData.data.uuid,
                                    targetId:msg.targetId,
                                    noTips:msg.noTips
                                }
                            })
                        }
                    })
                }
                // 查看好友资料
                if(ev.target.innerText=='查看资料'){
                    this.axios.get(this.ajaxUrl + '/v1/search_friends',{
                        params:{
                            token:sessionStorage.usertoken,
                            to_user:msg.uuid
                        }
                    }).then(res=>{
                    if(res.data.status){
                        $('.user-info').css({right:0})
                        this.$store.commit('showFriendMsg',res.data.data)
                        this.$store.commit('changeUserInfoStatus','show')
                        let params = {
                            el:$('.user-info'),
                            clientX:ev.clientX,
                            clientY:ev.clientY
                        }
                        DOMController.userInfoPosition(params)
                    }})
                }
                // 消息免打扰
                if(ev.target.innerText=='消息免打扰' || ev.target.innerText=='开启新消息提醒'){
                    console.log(msg)
                    let noTips = ev.target.innerText=='消息免打扰' ? '1' : '0'
                    conversation_db.set_tips({
                        targetId:msg.targetId,
                        userUuid:this.userData.data.uuid,
                        noTips,
                        isTop:msg.isTop
                    },res=>{
                        console.log(res)
                        if(res.rowsAffected>=1){
                            this.$store.commit('getConversationList',{
                                handle:'topOrtips',
                                list:{
                                    isTop:msg.isTop,
                                    userUuid:this.userData.data.uuid,
                                    targetId:msg.targetId,
                                    noTips
                                }
                            })
                        }
                    })
                }
                // 删除会话
                if(ev.target.innerText=='删除会话'){
                    let params = {
                        conversationType:msg.conversationType,
                        targetId:msg.targetId,
                        sentTime:msg.sentTime
                    }
                    Message.clearHistoryMsg({list:[params]},_res=>{
                        if(_res.status){
                            Conversation.deleteConversation(
                                {
                                    type:RongIMLib.ConversationType[msg.conversationType],
                                    id:msg.targetId
                                },
                                res=>{
                                if(res){
                                    this.$store.commit('getConversationList',{
                                        list:msg,handle:'delete'
                                    })
                                    this.$store.commit('getSendedMessage',{
                                        list:[],
                                        str:'changeFriend'
                                    })
                                    $('.init').show()
                                    this.$store.commit('changeCurrentFriendName',{})
                                }
                            })
                        }
                    })
                }
                // 删除好友
                if(ev.target.innerText=='删除好友'){
                    Friend.deleteFriend({uuid:msg.uuid},res=>{
                        if(res.status=='1'){
                            let params = {
                                targetId:msg.uuid,
                                conversationType:'PRIVATE',
                                sentTime:new Date().getTime()
                            }
                            let _params = {
                                backUpMsg:'删除好友',
                                handleType:4,
                                receiverUUID:this.userData.data.uuid,
                                senderAvatar:this.userData.data.avatar,
                                senderUUID:msg.uuid,
                                senderNickName:this.userData.data.nickname,
                                objectName:'WY:FriendNotification'
                            }
                            Message.clearHistoryMsg({list:[params]},_res=>{})
                            Message.handleFriend(_params, message=>{})
                            Message.handleFriend(Object.assign(_params,{receiverUUID:msg.uuid,senderUUID:this.userData.data.uuid}), message=>{
                                this.$store.commit('deleteFriend',message)
                                this.$store.commit('getConversationList',{
                                    list:message,
                                    handle:'delete'
                                })
                            })
                        }
                    })
                }
                // 解散群组
                if(ev.target.innerText=='解散群组'){
                    const { id } = msg
                    $('.show-group-info').css({
                        transform:'scale(0)'
                    })
                    Group.deleteGroup({id}, (res)=>{
                        if(res.status=='1'){
                            this.$store.commit('getGroupList',{
                                list:msg,
                                handle:'delete'
                            })
                            this.$store.commit('getConversationList',{
                                list:msg,
                                handle:'delete'
                            })
                            $('.init').show()
                            $('#group-info').css({
                                transform:'scale(0)'
                            })
                            $('.show-group-info').css({
                                transform:'scale(0)'
                            })
                        }
                    })
                }
                // 发消息
                if(ev.target.innerText=='发消息'){
                    let targetId = 0
                    let type = ''
                    if(msg.name==undefined){
                        targetId = msg.uuid
                        type = 'friend'
                    }else{
                        targetId = msg.id
                        type = 'group'
                    }
                    let params = {
                        intoConversation:true,
                        type
                    }
                    if(type=='group'){
                        params.userInfo = {
                            uuid:targetId
                        }
                    }
                    if(type=='friend'){
                        params.userInfo = {
                            uuid:targetId,
                            avatar:msg.avatar,
                            nickname:msg.nickname,
                            remark_name:msg.remark_name
                        }
                    }
                    entryOfSendMsg(params)
                }
                // 退出群组
                if(ev.target.innerText=='退出群组'){
                    const friends = this.userData.data.uuid
                    const { id } = msg
                    $('.show-group-info').css({
                        transform:'scale(0)'
                    })
                    Group.quitGroup({id,friends},(res)=>{
                        this.$store.commit('getGroupList',{
                            list:msg,handle:'delete'
                        })
                        $('.init').show()
                        $('#group-info').css({
                            transform:'scale(0)'
                        })
                        $('.show-group-info').css({
                            transform:'scale(0)'
                        })
                    })
                }
                // 查看群资料
                if(ev.target.innerText=='查看群资料'){
                    Group.getGroupInfo({id:msg.id},({baseInfo,notice})=>{
                        this.$store.commit('showGroupInfo',{
                            group:{
                                baseInfo,notice
                            },
                            handle:'getInfo'
                        })
                        $('.handle-group-member').hide()
                        
                        this.$store.commit('getGroupList',{
                            list:baseInfo.group_info,
                            handle:'updateicon'
                        })
                        this.$store.commit('getConversationList',{
                            list:{
                                id:baseInfo.group_info.id,
                                icon:baseInfo.group_info.icon,
                                conversationType:'GROUP'
                            },
                            handle:'updateicon'
                        })
                        $('.show-group-info').css({
                            transform:'scale(1)'
                        })
                        console.log(this.currentGroup)
                    })
                }
                
            }
        },
        store
    }
</script>
<style lang="scss" scoped>
    @import '../../style/common.scss';
    #contentmenu{
        // border:$border_style;
        box-shadow:3px 3px 3px 1px rgba(155, 145, 145,0.1),
            -3px 3px 3px 1px rgba(155, 145, 145,0.1),
            3px -3px 3px 1px rgba(155, 145, 145,0.1);
        border-radius:2px;background:#fff;
        .el-button{
            font-size:14px;border:0 none;width:100%;
            color:#333;display:block;border-radius: 0;
            padding:10px;display:block;
            margin:0;text-align:center;
            &:hover{
                background:#EEEFF2;cursor:pointer;color:#333;
            }
        }
    }
</style>

