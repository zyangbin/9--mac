<template>
    <div id="message" :class="{'fr':message.messageDirection==1,'fl':message.messageDirection==2}">

        <!-- 我的消息 -->
        <div class="message-from-me" v-if="message.messageDirection==1">
            <!-- 头像 -->
            <div class="portrait fr" >
                <img :src="userData.data.avatar" alt="" 
                    v-if="userData.data.avatar!=null"
                    class="avatar-portrait-mini" 
                    @click="getFriendInfo($event,message.senderUserId)">
                <span v-if="userData.data.avatar==null"
                    @click="getFriendInfo($event,message.senderUserId)" 
                    class="nickname-portrait-mini" v-nickname-portrait
                    :style="{background:portraitColor(message.senderUserId)}">
                    {{nicknamePortrait}}
                </span>
            </div>
            <!-- 文本消息 -->
            <div class="text-message word-break fr" v-if="message.objectName=='RC:TxtMsg'"
                v-html="textMessage(message.content.content)">
            </div>
        </div>
        

        <!-- ////////////////////////////////////////////////////////////////////////////////////// -->

        <!-- 别人的消息 -->
        <div class="message-from-friend" v-if="message.messageDirection!=1">
            <div class="portrait">
                <!-- 单聊个人头像 -->
                <img :src="currentFriendName.avatar" alt="" 
                    v-if="message.conversationType==1 && currentFriendName.avatar!=null"
                    class="avatar-portrait-mini" @click="getFriendInfo($event,message.senderUserId)">
                <span v-if="message.conversationType==1 && currentFriendName.avatar==null"
                    @click="getFriendInfo($event,message.senderUserId)" 
                    class="nickname-portrait-mini" v-nickname-portrait
                    :style="{background:portraitColor(message.senderUserId)}">
                    {{nicknamePortrait}}
                </span>

                <!-- 群聊个人头像 -->
                <img :src="groupMemberPortrait" alt="" 
                    v-if="message.conversationType==3 && groupMemberPortrait.length>=5"
                    class="avatar-portrait-mini"
                    @click="getFriendInfo($event,message.senderUserId)">
                <span v-if="message.conversationType==3 && groupMemberPortrait.length<=5"
                    class="nickname-portrait-mini" v-nickname-portrait 
                    :style="{background:portraitColor(message.senderUserId)}"
                    @click="getFriendInfo($event,message.senderUserId)">
                    {{groupMemberPortrait}}
                </span>
                <!-- 文本消息 -->
                <div class="text-message word-break" v-if="message.objectName=='RC:TxtMsg'"
                    v-html="textMessage(message.content.content)">
                </div>
            </div>
        </div>
        <!-- 头像 -->
        
        
    </div>
</template>
<script>
import $ from 'jquery'
import store from '../../store/store'
import { getFriendInfo } from '../../public/getFriendInfo'
// import { getGroupMemberPortrait } from './getGroupMemberPortrait'
import { mapState } from 'Vuex'
import { DOMController } from '../../class/DOMController';
export default {
    data(){
        return{
            // uuid:userData.data.uuid
        }
    },
    props:['message'],
    computed:{
        ...mapState({
            userData:'userData',
            currentFriendName:'currentFriendName',
            currentGroup:'currentGroup'
        }),

        // 头像名字-->单聊
        nicknamePortrait(){
            let name = ''
            if(this.currentFriendName.remarkName){
                name = this.currentFriendName.remarkName[0]
            }else{
                name = this.currentFriendName.nickname[0]
            }
            return name
        },

        // 群友头像
        groupMemberPortrait(){
            let avatar = null
            let member = this.currentGroup.baseInfo.members.filter((item)=>{
                return item.uuid===this.message.senderUserId
            })
            if(member[0]==undefined){
                return ''
            }
            if(member[0].avatar){
                avatar = member[0].avatar
            }else if(member[0].remark_name){
                avatar = member[0].remark_name[0]
            }else{
                avatar = member[0].nickname[0]
            }
            return avatar
        }

    },
    store,
    // watch:{

    // },
    methods:{

        // 计算头像背景颜色
        portraitColor(uuid){
            return DOMController.portraitColor(uuid)
        },

        // 计算群友头像
        getGroupMemberPortrait(){
            
        },

        // 展示好友信息
        getFriendInfo(ev,uuid){
            getFriendInfo({
                ev:ev,
                uuid
            })
        },

        // 处理文本消息(emoji、超链接)
        textMessage(content){
            let reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|%|#|-)+)/g;
            content = content.replace(/\n/g,'<br/>')
            content = content.replace(/\s/g,'&nbsp;')
            content = content.replace(reg,function(a,b,c){return '<a style="color:#4A90E2;">'+"http://" +c+'</a>'})
            let html = `<p 
                style="background:${this.message.messageDirection==1 ? '#D8E6F7' : '#EBEBEB'};
                padding:8px;border-radius:">` 
                + RongIMLib.RongIMEmoji.emojiToHTML(content) + `</p>`
            return html
        }
    },

    // mounted:{

    // }
}
</script>
<style lang="scss" scoped>
    // @import './message.scss';
    #message{
        width:80%;
    }
    .message-from-me,.message-from-friend{
        max-width:100%;
        height:100%; 
    }
    .portrait{
        width:64px;
        height:64px;
    }

    .text-message{
        box-sizing:border-box;
        font-size:14px;
        color:#333;
        padding:14px;
        min-height:64px;
    }

    .message-from-me .text-message{
        max-width:60%;
        padding-right:0px;
    }
</style>


