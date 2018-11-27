<template>
    <div id="friendlist" @mousemove.prevent="stopUp">
        <form>
            <el-input type="text" class="search" placeholder="搜索联系人" 
                @keyup.native="searchFriend" v-model="searchFriendName" 
                @focus="changeAllStatus" size="mini" clearable=""
                prefix-icon="iconfont icon-shousuo"
                form="style:{backgroundColor:red;}"></el-input>
            <el-input type="text" class="search add" placeholder="手机号/ 9号米仓号"
                v-model="friendPhone" v-show="searchFriendIptStatus" size="mini"
                @keyup.native="searchFriendPhone" clearable
                @click.native.stop="searchFriendPhone"
                prefix-icon="iconfont icon-shousuo">
            </el-input>
            <span class="addfriend iconfont icon-jia" title="加好友" 
                @click.stop="addNewFriend" style="display:none">
            </span>
        </form>
    <!-- <GeminiScrollbar autoshow update> -->
        <div id="list">

        <label class="phone-result" v-if="searchFriendIptStatus==true"
            >
            <div v-if="phoneResult!=null">
                <img :src="phoneResult.avatar" alt="" v-move 
                    v-if="phoneResult.avatar!=null" 
                    @click.stop="stopUp">
                <el-button @click.stop="addNewFriend">添加</el-button>
                <span v-if="phoneResult.avatar==null" class="nickname-avatar"
                    @click.stop="stopUp"
                    :style="{background: portraitColor(phoneResult.uuid)}">{{phoneResult.nickname[0].toUpperCase()}}</span>
                <span class="nickname" @click.stop="stopUp">{{phoneResult.nickname}}</span>
            </div>
            <p class="no-result" v-if="phoneResult==null && friendPhone==''" @click.stop="showUserErweima">
                我的二维码<span class="iconfont icon-erweima1" v-if="friendPhone==''"></span>
            </p>
            <p v-if="friendPhone!='' && phoneResult==null" class="no-result" style="cursor:default;">
                {{(friendPhone.length==11 && phoneResult==null) ? '当前查找的用户不存在' : '请输入完整手机号/9号米仓号'}}
            </p>
            <div id="user-erweima" v-if="friendPhone==''">

            </div>
            <p v-if="phoneResult==null && friendPhone==''" 
                class="user-erweima-notice"
                style="fontSize:14px;text-align:center;margin-top:20px;color:#a7a7a7;display:none;">
                扫一扫我的二维码，加我9号米仓
            </p>
            <div class="user-erweima-avatar">
                <img :src="userData.data.avatar" alt=""  v-move 
                    v-if="userData.data.avatar!=null" 
                    >
                <span v-if="userData.data.avatar==null" class="nickname-avatar"
                    :style="{background:portraitColor(userData.data.uuid)}">{{userData.data.nickname[0].toUpperCase()}}
                </span>
            </div>
        </label>
        <div class="add-friend-remark" @click.stop="stopUp">
            <p class="title">
                <span>好友验证</span>
                <span class="close iconfont icon-guanbi" 
                    @click="toggleMessageBox('.add-friend-remark','hide')">

                </span>
            </p>
            <input placeholder="请输入添加理由" v-model="remarkMessage"
                @click.stop="stopUp" @keydown="limitRemarkMessageLen($event)"/>
            <el-button @click="sendAddMessage">
                发送
            </el-button>
        </div>
        <!-- <div class="add-friend-fail">
            <p class="title">
                <span>添加失败</span>
                <span class="close iconfont icon-guanbi" 
                @click="toggleMessageBox('.add-friend-fail','hide')"></span>
            </p>
            <p>
                他已经是您的好友
            </p>
            <el-button @click="toggleMessageBox('.add-friend-fail','hide')">确认</el-button>
        </div> -->
        
        <ul class="alllist" v-show="whichList=='friendList'">
            <li class="title" @click.stop="addNewFriend">
                <span class="iconfont icon-jiahaoyoutubiao fl" style="color:#ccc;fontSize:13px;"></span>
                <span class="fl" 
                    style="color:#333;fontWeight:500">添加好友</span>
            </li>
            <li class="title" @click="takeUp('newFriend')">
                <span class="iconfont icon-jiantouyou fl"
                :class="{choose:takeup.indexOf('newFriend')>=0}"
                style="color:#ccc;">
                    
                </span>
                <span class="fl" style="color:#333;fontWeight:500">
                    新朋友
                </span>
                <span class="fr count-newfriend" v-if="newFriend.length!=0">
                    {{newFriend.length}}
                </span>
               
            </li>
             <ul class="new-friend-list" ref="newFriend">
                <li v-for="(item,idx) of newFriend" :key="idx">
                    <img :src="item.info.avatar" alt=""  v-move 
                        v-if="item.info.avatar!=null && item.info.avatar!=''"
                        @click.stop="showUserInfo($event,item)">
                    <span v-else class="nickname-avatar"
                    :style="{background: portraitColor(item.info.fromUuid)}"
                        @click.stop="showUserInfo($event,item)">
                        {{item.info.nickname[0].toUpperCase()}}
                    </span>
                    <p>
                        <span>备注：{{item.info.message | formatMessage}}</span>
                        <span>{{item.info.nickname}}</span>
                        <el-button class="handle" @click="handleFriendRequest(item)">
                            添加
                        </el-button>
                        <!-- <span class="reject" @click="agreeBeFriend(item, '拒绝')">拒绝</span>
                        <span class="resolve" @click="agreeBeFriend(item, '添加')">添加</span> -->
                    </p>
                </li>
                 <li style="textAlign:center;lineHeight:60px;color:#ccc;font-size:14px;border:0 none;font-size:12px;cursor:pointer;"
                    v-if="newFriend.length==0">暂无新朋友消息</li>
            </ul>
            <li class="title" @click="takeUp('group')" >
                <span class="iconfont icon-jiantouyou fl" 
                    :class="{choose:takeup.indexOf('group')>=0}"
                    style="color:#ccc;">
                    
                </span>
                <span class="fl" style="color:#333;fontWeight:500">
                    群组
                </span>
                <span class="fr" v-if="groupList.length!=0">
                    {{groupList.length}}
                </span>
                
            </li>
            <ul class="group" ref="group">
                <li v-for="item of groupList" :key="item.id" 
                    class="group-item" @contextmenu.prevent="handle($event,item)"
                    @click="change(item,'group')">
                    <img :src="item.icon" alt="" v-if="item.icon!=''"  v-move >
                    <span v-if="item.icon==''" class="no-icon nickname-avatar" 
                        :style="{background: portraitColor(item.id)}">
                        {{item.name[0]}}
                    </span>
                    <span class="nickname">
                        {{item.name}}
                    </span>
                </li>
                <li style="textAlign:center;lineHeight:60px;color:#ccc;font-size:14px;border:0 none;font-size:12px;cursor:default;"
                    v-if="groupList.length==0">暂无群组</li>
            </ul>
            <li class="title" @click="takeUp('friend')">
                <span class="iconfont icon-jiantouyou fl" 
                    :class="{choose:takeup.indexOf('friend')>=0}"
                    style="color:#ccc;">
                </span>
                <span class="fl" style="color:#333;fontWeight:500">
                    联系人
                </span>
                <span class="fr" v-if="friendlist.length!=0">
                    {{friendlist.length}}
                </span>
            </li>
            <!-- <ul>
                <li v-for="(item,idx) of getBigLetters" :key="idx">
                    <span>{{item}}</span>
                </li>
            </ul> -->
            <ul class="friend" ref="friend">
                <li v-for = "(item,idx) in sortMail" 
                    :key="idx"
                    @click="change(item,'friend',$event)"
                    @contextmenu.prevent="handle($event,item)"
                    :class="{letterFirst:idx==0 || (idx>0 && sortMail[idx].firstLetter!=sortMail[idx-1].firstLetter)}">
                    
                    <p v-if=" idx==0 || (idx>0 && sortMail[idx].firstLetter!=sortMail[idx-1].firstLetter)"
                        class="letter-sort">
                        {{item.firstLetter}}
                    </p>
                    <img :src="item.avatar" alt="" v-if="item.avatar!=null"  v-move>
                    <span v-if="item.avatar==null" class="nickname-avatar"
                    :style="{background: portraitColor(item.uuid)}">
                        {{item.remark_name ? item.remark_name[0] : item.nickname[0].toUpperCase()}}
                        <!-- {{item.nickname[0].toUpperCase()}} -->
                    </span>
                    <span class="nickname">{{item.remark_name || item.nickname}}</span>
                </li>
                <li style="cursor:default;textAlign:center;lineHeight:64px;color:#ccc;font-size:14px;border:0 none;font-size:12px;"
                    v-if="friendlist.length==0">暂无联系人</li>
                <!-- <li class="last"></li> -->
            </ul>
        </ul>
        <ul class="searchlist" v-show="whichList=='searchList'">
            <li v-for="(item,idx) in searchResult" 
                :key="idx" 
                @click="change(item,'search',$event)"
                >
                <img :src="item.avatar" alt="" v-if="item.avatar!=null" v-move>
                <span v-if="item.avatar==null" class="nickname-avatar"
                :style="{background: portraitColor(item.uuid)}">
                        {{item.remark_name ? item.remark_name[0] : item.nickname[0].toUpperCase()}}
                    <!-- {{item.remark_name[0] || item.nickname[0].toUpperCase()}} -->
                    <!-- {{item.nickname[0].toUpperCase()}} -->
                </span>
                <p style="lineHeight:64px;">
                    <span style="margin-left:15px;max-width:155px;display:inline-block;overflow:hidden;
                        text-overflow:ellipsis;white-space:nowrap">{{item.remark_name || item.nickname}}</span>
                </p>
            </li>
            <p class="notmatch" v-if="phoneResult==null">
                {{searchResult.length==0 && searchFriendName=='' ? '请输入要搜索的内容' : '找到'+searchResult.length+'个好友'}}
            </p>
        </ul>
        <ul class="conlist" v-if="whichList=='messageList'">
            <li v-for="item of conversationList" :key="item.targetId" 
                @click="intoConversationFromConlist(item)" @contextmenu.prevent="handle($event,item)"
                :class="{currentCon:currentId==item.targetId,topCon:item.isTop=='1'}">
                <i class="iconfont icon-miandarao" style="position:absolute;bottom:10px;right:10px;color:#ccc;"
                    v-if="item.noTips=='1'"></i>
                <div class="left clearfix">
                    <img :src="item.avatar" alt="" v-if="item.avatar!=null" v-move>
                    <span v-if="item.avatar==null || item.avatar==''" class="nickname-avatar"
                        :style="{background: portraitColor(item.targetId)}">
                        <!-- {{item.nickname[0].toUpperCase() || '9'}} -->
                        {{item.remarkName ? item.remarkName[0] : item.nickname[0].toUpperCase()}}
                    <!-- {{item.remark_name[0] || item.nickname[0].toUpperCase()}} -->

                        <!-- {{item.remark_name[0] || item.nickname[0].toUpperCase()}} -->

                    </span>
                    <!-- <span v-if="item.avatar==''" class="nickname-avatar" 
                    :style="{background: portraitColor(item.targetId)}">
                        {{item.remark_name ? item.remark_name[0] : item.nickname[0].toUpperCase()}} -->
                        <!-- {{item.nickname[0].toUpperCase() || '9'}} -->
                        <!-- {{item.remark_name[0] || item.nickname[0].toUpperCase()}} -->

                    <!-- </span> -->
                </div>
                <div class="right">
                    <p class="info">
                        <!-- <span>{{item.remarkName || item.nickname | formatMessage}}</span> -->
                        <span class="nickname" v-if="item.remarkName=='' || item.remarkName==undefined">{{item.nickname}}</span>
                        <span class="remarkName" v-else>{{item.remarkName}}</span>
                        <span class="time">{{item.sentTime | formattime}}</span>
                    </p>
                    <p style="vertical-align:middle;">
                        <!-- <a class="group-member-name">
                            {{item.latestMsgUsername ? item.latestMsgUsername : ''}}
                        </a> -->
                        <strong style="color:red;fontWeight:500;padding-bottom:2px;"
                            v-if="item.pointMsgTime!=0 && item.pointMsgTime!=undefined && item.targetId!=currentFriendName.targetId">
                            [有人@我]
                        </strong>
                        <span v-if="item.conversationType=='GROUP' && item.latestname!=undefined && item.latestname!=''"
                            style="float:left;">{{item.latestname + ': '}}&nbsp;</span>
                        <span v-html="formatemoji(item.latestmsg)"></span>
                        <!-- {{item.latestmsg ? item.latestmsg : '' | formatMessage}} -->
                        <i v-if="item.unReadCount!=0 && item.noTips=='0'">{{item.unReadCount>99 ? '...' : item.unReadCount}}</i>
                    </p>
                </div>
            </li>
        </ul>
        </div>
        <!-- <div class="close-handle-request">

        </div> -->
        <div class="handle-request" @click.stop="stopUp">
            <p class="title">
                <span>添加好友</span>
                <span class="iconfont icon-guanbi" v-close:handle-request></span>
            </p>
            <p class="remark-message" >

            </p>
            <p class="handle-result-icon" v-if="currentRequestFriend==null">
                <span class="iconfont icon-Group-" style="color:#FDCB3F;font-size:40px;"></span>
                <span class="iconfont icon-Group" style="font-size:40px;color:#ccc;"></span>
            </p>
            <p class="handle-result-notice" v-if="currentRequestFriend==null">
                <span class="resolve">已添加</span>
                <span class="reject">已拒绝</span>
            </p>
            <el-button class="reject" size="mini" v-show="currentRequestFriend!=null"
                @click="agreeBeFriend(currentRequestFriend,'删除')">删除</el-button>
            <el-button class="resolve" size="mini" v-show="currentRequestFriend!=null"
                @click="agreeBeFriend(currentRequestFriend,'添加')">接受</el-button>
        </div>
        <div class="modal modal-handle-request-friendlist">
            <p class="title">
                <span>提示</span>
                <span class="iconfont icon-guanbi" v-close:modal-handle-request-friendlist></span>
            </p>
            <p class="notice">
                发送好友请求成功
            </p>
            <el-button v-close:modal-handle-request-friendlist>确定</el-button>
        </div>
        <!-- </GeminiScrollbar> -->
        <handle-menu :contentlist="handleList" ref="menu" v-show="handleStatus"
            :msg="handleTarget"></handle-menu>
        <!-- <user-info></user-info> -->
    </div>
</template>
<script>
    import store from '../store/store'
    import message from '../database/message'
    import deleteMsg from '../database/deleteMsg'
    import handleMenu from './common/ContentMenu'
    import { mapState } from 'vuex'
    import { getHistoryMessages } from '../rongcloud/getHistoryMessage'
    import { setTimeout, setInterval } from 'timers'
    import { clearUnreadCount } from '../rongcloud/clearUnreadCount'
    import { sendmessage } from '../rongcloud/sendMessage'
    import { getFriendList } from '../rongcloud/getFriendList'
    import { getConversationList } from '../rongcloud/getConversationList'
    import UserInfo from './UserInfo'
    import { Group } from '../class/Group'
    import { Friend } from '../class/Friend'
    import { Message } from '../class/Message'
    import { Conversation } from '../class/Conversation'
    import { Commom, Common } from '../class/Common'
    import { DOMController } from '../class/DOMController'
    import { ipcRenderer } from 'electron'
    import _ from 'lodash'
    import conversation_db from '../database/conversation.js'
    import { getFriendInfo } from '../public/getFriendInfo'
    import { syncMessageStatus } from '../public/syncMessageStatus'
    import lastReadMessage from '../database/lastReadMessage'
    export default {
        data () {
            return {
                message:'aaa',
                currentName:'',
                searchFriendName:'',
                searchResult:[],
                handleStatus:false,
                currentId:'',
                takeup:[],
                friendPhone:'',
                searchFriendIptStatus:false,
                phoneResult:null,
                isFriend:false,
                handleTarget:null,
                handleList:[],
                remarkMessage:'',
                currentRequestFriend:null
            }
        },
        watch:{
            currentFriendName(val, oldval){
                if(Object.keys(val).length==0){
                    this.currentId = ''
                }
                if(val==null){
                    return
                }
                if(val.targetId==undefined){
                    return
                }
                if(!val){
                    return
                }
                if(val.conversationType=='PRIVATE'){
                    $('#group-info').css({
                        transform:'scale(0)'
                    })
                }
                
                if(Object.keys(oldval).length==0){
                    this.intoConversation(val)
                    return
                }
                if(Object.keys(this.currentFriendName).length>0){
                    if(oldval.targetId!=val.targetId){
                        this.intoConversation(val)
                    }
                }
                if(Object.keys(this.currentFriendName).length==0){
                    if(oldval.targetId!=item.targetId){
                        this.intoConversation(val)
                    }
                }
            },
            phoneResult(val, oldval){
                if(val!=null){
                    // console.log('has result')
                }
            },
            conversationListLength(val,oldval){
                if(val!=oldval){
                    for(let item of this.conversationList){
                        let params = {
                            userUuid:this.userData.data.uuid,
                            targetId:item.targetId,
                            conversationType:item.conversationType,
                            isTop:'0',
                            noTips:'0'
                        }
                        conversation_db.insert_one_conversation(params,res=>{
                            if(res.rows.length==1){
                                this.$store.commit('getConversationList',{
                                    handle:'topOrtips',
                                    list:res.rows[0]
                                })
                            }
                        })
                    }
                }
            },
        },
        computed:{
            ...mapState({
                currentFriendName:'currentFriendName',
                userData:'userData',
                currentGroup:'currentGroup',
                messageObjs:"messageObjs",
                searchstatus(state){
                    return state.friendlistStatus
                },
                friendlist(state){
                    return state.friendlist
                },
                sortFriedlist(state){
                    let arr = state.friendlist
                    arr.sort((a,b)=>{
                        return 
                    })
                },
                groupList(state){
                    return state.groupList
                },
                conversationList(state){
                    let resArr = state.conversationList
                    resArr.sort(function(a,b){
                        return b.sentTime - a.sentTime
                    })
                    let arr = []
                    for(let item of resArr){
                        if(item.isTop=='1'){
                            arr.push(item)
                        }
                    }
                    for(let item of resArr){
                        if(item.isTop=='0'){
                            arr.push(item)
                        }
                    }
                    return arr
                },
                conversationListLength(){
                    return this.conversationList.length
                },
                 whichList(state){
                    return state.whichList
                },
                newFriend(state){
                    return state.newFriend
                },
                addFrienduuid(state){
                    return state.addFrienduuid
                },
                sendedMessage(state){
                    return state.sendedMessage
                },
            }),
           
            // 生成26个大写英文字母
            getBigLetters(){
                let bigLetter = []
                for(let i=65;i<91;i++){
                    bigLetter.push(String.fromCharCode(i))
                }
                return bigLetter
            },
            // 通讯录排序
            sortMail(){
                let res = []
                let special = []
                
                for(let item of this.friendlist){
                    let name = item.remark_name || item.nickname
                    let first = pinyin.getFullChars(name)[0].toUpperCase()
                    if(this.getBigLetters.indexOf(first)>=0){
                        item.firstLetter = first
                        res.push(item)
                    }else{
                        item.firstLetter = '#'
                        special.push(item)
                    }
                }
                res.sort(function(a,b){
                    return a.firstLetter>b.firstLetter
                })
                for(let item of special){
                    res.push(item)
                }
                // console.log(res)
                return res
            }
        },
        methods:{
            // 限制添加理由的字数
            limitRemarkMessageLen(ev){
                if(this.remarkMessage.length>50){
                    this.remarkMessage = this.remarkMessage.substring(0,50)
                    ev.target.value = this.remarkMessage
                }
            },
            // 处理好友请求
            handleFriendRequest(item){
                $('.handle-request').show()
                let str = ''
                if(item.info.message.length>50){
                    str = item.info.message.substr(0,50) + '...'
                }else{
                    str = item.info.message
                }
                $('.handle-request .remark-message').text(str)
                this.currentRequestFriend = item
            },
            // 展示新朋友个人信息
            showUserInfo(ev, item){
                this.axios.get(this.ajaxUrl + '/v1/search_friends',{
                    params:{
                        token:sessionStorage.usertoken,
                        to_user:item.info.fromUuid
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
            },
             // 群会话中最近一条消息的发送者
            latestMsgUsername(uuid){
                this.axios.get(this.ajaxUrl + '/v1/search_friends',{
                    params:{
                        token:sessionStorage.usertoken,
                        to_user:uuid
                    }
                }).then(res=>{
                    let member_name = res.data.data.remark_name ? res.data.data.remark_name : res.data.data.nickname
                    // console.log(member_name)
                    // return member_name
                    this.currentFriendName.latestMsgUsername = member_name
                    console.log(this.currentFriendName)
                })
            },
            // 展示个人二维码
            showUserErweima(){
                $('#user-erweima').html('')
                let qrcode = new QRCode('user-erweima', {
                    text:`zxkj://${this.userData.data.mobile}`,
                    width: 170,
                    height: 170,
                    colorDark : '#333000',
                    colorLight : '#ffffff',
                    correctLevel : QRCode.CorrectLevel.H
                })
                $('#user-erweima').attr('title','')
                $('.user-erweima-avatar').show()
                $('.user-erweima-notice').show()
            },
            // emoji表情转换
            formatemoji(str){
                if(str==undefined){
                    // if(msg.messageType=="GroupNotificationMessage"){
                    //     if(msg.content.operation=='Kicked'){
                    //         str = '[移除群成员]'
                    //     } 
                    //     if(msg.content.operation=='Add'){
                    //         str = '[添加群成员]'
                    //     }
                    //     if(msg.content.operation=='Create'){
                    //         str = '[创建群组]'
                    //     }
                    //     if(msg.content.operation=='Rename'){
                    //         str = '[修改群名称]'
                    //     }
                    //     if(msg.content.operation=='Quit'){
                    //         str = '[退出群组]'
                    //     }
                    // }
                    // else if(msg.objectName=='WY:FriendHandle'){
                    //     str = '[添加好友]'
                    // } 
                    // else {
                    //     str = ''
                    // }
                    return str
                } 
                let nickname = ''
                // if(msg.content!=undefined && msg.content.mentionedInfo!=undefined && msg.content.mentionedInfo.userIdList.indexOf(this.userData.data.uuid)>=0){
                //     nickname = this.currentGroup.baseInfo.members.filter(item=>{
                //         return item.uuid==this.userData.data.uuid
                //     })[0].nickname
                //     str = str.replace(/@\s/g,'@我 ')
                //     // if(nickname=='我'){
                //     //     str = str.replace(/@\S+&nbsp;/,'@'+ this.userData.data.nickname +'&nbsp;')
                //     // }else{
                //     //     str = str.replace(/@\S+&nbsp;/,'@'+ nickname +'&nbsp;')
                //     // }
                //     console.log(str)
                // }
                return RongIMLib.RongIMEmoji.emojiToSymbol(str)
            },
            // 阻止冒泡
            stopUp(){
                return
            },
             // 切换弹窗的显示/隐藏
            toggleMessageBox(el,str){
                DOMController.toggleMessageBox($(el),str)
                this.remarkMessage = ''
            },
            // 计算头像背景颜色
            portraitColor(uuid){
                return DOMController.portraitColor(uuid)
            },
            // 添加好友
            addNewFriend(){
                // this.phoneResult = {}
                $('.init').show()
                this.searchFriendIptStatus = true
                if(this.phoneResult!=null && this.phoneResult.uuid==this.userData.data.uuid){
                    this.isFriend = true
                }
                if(this.phoneResult!=null){
                    for(let f of this.friendlist){
                        if(this.phoneResult.uuid==f.uuid){
                            this.isFriend = true
                            break
                            return
                        }
                    }
                }
                if(this.phoneResult!=null){
                    $('.init').show()
                    if(this.isFriend){
                        this.toggleMessageBox('.add-friend-fail','show')
                    }else{
                        this.addNotes()
                    }
                }
            },
            // 添加备注
            addNotes() {
                // $('.init').show()
                $('.add-friend-remark').css({
                    transform:'scale(1)'
                })
            },
            //发送好友请求
            sendAddMessage(){
                let targetUser
                if(this.phoneResult){
                    targetUser = this.phoneResult
                }else{
                    targetUser = this.addFrienduuid
                }
                
                let params = {
                    backUpMsg:this.remarkMessage || '请求添加您为好友',
                    handleType:1,
                    receiverUUID:targetUser.uuid,
                    senderAvatar:this.userData.data.avatar,
                    senderUUID:this.userData.data.uuid,
                    senderNickName:this.userData.data.nickname,
                    objectName:"WY:FriendNotification"
                }
                Message.handleFriend(params, res=>{
                    this.axios.post(this.ajaxUrl + '/v1/friends/ready',{
                        token:sessionStorage.usertoken,
                        to_user:targetUser.uuid,
                        is_mobile:this.friendPhone.length==11 ? '1' : '0'
                    }).then(res=>{
                        console.log(res.data)
                    })
                    $('.modal-handle-request-friendlist').show()
                    this.toggleMessageBox('.add-friend-remark','hide')
                }) 
                this.remarkMessage = ''
            },
            // 搜索陌生好友
            searchFriendPhone(){
                this.searchFriendIptStatus = true
                if(this.friendPhone!=''){
                    $('.user-erweima-avatar').hide()
                    $('user-erweima-notice').hide()

                }
                if(this.friendPhone!=''){
                    if(this.friendPhone.length==11){
                        this.axios.get(this.ajaxUrl + '/user',{
                            params:{
                                mobile:this.friendPhone,
                                token:sessionStorage.usertoken
                            }
                        }).then(res=>{
                            if(res.data.data.length>0){
                                this.phoneResult = res.data.data[0]
                            }else{

                            }
                        })
                    }
                    if(this.friendPhone.length==6){
                        this.axios.get(this.ajaxUrl + '/user',{
                            params:{
                                token:sessionStorage.usertoken,
                                number:this.friendPhone
                            }
                        }).then(res=>{
                            if(res.data.data.length>0){
                                // console.log(res.data.data[0])
                                this.phoneResult = res.data.data[0]
                            }
                        })
                    }else{
                        this.phoneResult = null
                    }
                }
            },
            // 同意/拒绝 好友请求
            agreeBeFriend (item, str){
                if(str=='添加'){
                    this.axios.post(this.ajaxUrl + '/v1/friends',{
                        to_user:this.userData.data.uuid,
                        go_user:item.info.fromUuid
                    }).then(res=>{
                        if(res.data.status=='1'){
                            getFriendList(friendlist=>{
                                this.$store.commit('getFriendList',friendlist)
                                item.str = 'delete'
                                // 更新本地存储(好友添加通知)
                                this.$store.commit('addNewFriend',item)
                                let conList = []
                                conList[0] = {
                                    avatar:item.info.avatar,
                                    nickname:item.info.nickname,
                                    // remarkName:item.remark_name,
                                    latestmsg:item.info.message,
                                    sentTime:item.info.sentTime,
                                    unReadCount:0,
                                    targetId:item.info.fromUuid,
                                    extra:'newFriend',
                                    conversationType:'PRIVATE',
                                    isTop:false,
                                    notificationStatus:false
                                }
                                // 更新会话列表
                                this.$store.commit('getConversationList',{
                                    list:conList,
                                    handle:"push"
                                })
                                // 通知好友已通过验证请求(自定义消息)
                                let params = {
                                    backUpMsg:'同意添加您为好友',
                                    handleType:1,
                                    receiverUUID:item.info.fromUuid,
                                    senderAvatar:this.userData.data.avatar,
                                    senderUUID:this.userData.data.uuid,
                                    senderNickName:this.userData.data.nickname,
                                    objectName:'WY:FriendHandle'
                                }
                                this.currentRequestFriend = null
                                $('.handle-result-icon .icon-Group-').show()
                                
                                this.$nextTick(()=>{
                                    $('.handle-result-icon .icon-Group').hide()
                                    $('.handle-result-notice .reject ').hide()
                                })
                                $('.handle-result-notice .resolve ').show()
                                Message.handleFriend(params, res=>{
                                    console.log(res)
                                })
                            })
                        }else{
                        }
                    })
                }else{
                    // 拒绝好友请求
                    item.str = 'delete'
                    this.$store.commit('addNewFriend',item)
                    this.currentRequestFriend = null
                  
                    this.$nextTick(()=>{
                        $('.handle-result-icon .icon-Group-').hide()
                        $('.handle-result-notice .resolve ').hide()
                    })
                    $('.handle-result-icon .icon-Group').show()
                    $('.handle-result-notice .reject ').show()
                    let params = {
                        backUpMsg:'拒绝添加您为好友',
                        handleType:3,
                        receiverUUID:item.info.fromUuid,
                        senderAvatar:this.userData.data.avatar,
                        senderUUID:this.userData.data.uuid,
                        senderNickName:this.userData.data.nickname,
                        objectName:'WY:FriendNotification'
                    }
                    Message.handleFriend(params, res=>{})
                    this.axios.put(this.ajaxUrl + '/v1/friends/refuse',{
                        token:sessionStorage.usertoken,
                        ready_id:item.info.fromUuid,
                        state:'2'
                    }).then(res=>{
                        console.log(res.data)
                    })
                }
            },
            // 切换好友/群组
            change(item, str, ev){
                let id = 0
                if(str == 'group'){
                    id = item.id
                }
                if(str == 'friend' || str == 'search'){
                    id = item.uuid 
                }
                if(str=='friend' || (str=='search' && item.mobile!=undefined)){
                    $('.show-group-info').css({
                        transform:'scale(0)'
                    })
                    getFriendInfo({
                        uuid:id,
                        ev
                    })
                }

                // return 

                if(str=='group' || (str=='search' && item.mobile==undefined)){
                    Group.getGroupInfo({id},({baseInfo,notice})=>{
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
                    })
                }
                
            },
            // 搜索本地好友
            searchFriend(){
                this.searchResult = []
                let remark, item, nickname
                let search = pinyin.getFullChars(this.searchFriendName).toLocaleLowerCase()
                for(let i=0;i<this.friendlist.length;i++){
                    item = this.friendlist[i]
                    remark = pinyin.getFullChars((item.remark_name ? item.remark_name : '')).toLocaleLowerCase()
                    nickname = pinyin.getFullChars(item.nickname).toLocaleLowerCase()
                    if(remark.indexOf(search)>=0 || nickname.indexOf(search)>=0){
                        this.searchResult.push(item)
                    }
                }
                for(let item of this.groupList){
                    nickname = pinyin.getFullChars(item.name).toLocaleLowerCase()
                    if(nickname.indexOf(search)>=0){
                        this.searchResult.push({
                            avatar:item.icon || null,
                            nickname:item.name,
                            uuid:item.id
                        })
                    }
                }
                if(this.searchFriendName==''){
                    this.searchResult = []
                }
            },
            changeAllStatus(){
                // this.$store.commit('showFriendlist','hide')
                this.$store.commit('showWhichList','searchList')
                this.searchResult = []
            },
            // 右键菜单操作
            handle(ev,item){
                let li = null
                if(ev.target.tagName=='LI'){
                    li = ev.target
                }else{
                    li = $(ev.target).parents('li')[0]
                }
                let idx = item.uuid || item.id
                let top,left
               
                if((window.innerHeight-ev.clientY)<=110){
                    top = ev.clientY-110
                }else{
                    top = ev.clientY
                }
                if(ev.clientX>190){
                    left = ev.clientX - 100
                }else{
                    left = ev.clientX
                }
                this.handleStatus = true
                this.currentName = item.targetName
                this.$refs.menu.$el.style.top = top + 'px'
                this.$refs.menu.$el.style.left = left-70+ 'px'
                if(this.handleStatus){
                    // li.style.background = '#ccc'
                }
                this.handleTarget = item
                if($(li).parents('ul')[0].className=='friend'){
                    this.$store.commit('changeUserInfoStatus','hide')
                    this.handleList = ['发消息','删除好友','查看资料']
                    // this.handleList = ['发消息','删除好友']
                }
                if($(li).parents('ul')[0].className=='conlist'){
                    let topText = item.noTips=='1' ? '开启新消息提醒' : '消息免打扰'
                    let tipsText = item.isTop=='1' ? '取消置顶' : '置顶会话'
                    this.handleList = [topText,tipsText,'删除会话',]
                }
                if($(li).parents('ul')[0].className=='group'){
                    Group.getGroupInfo({id:item.id},(res)=>{
                        if(res.baseInfo.group_info.owner==this.userData.data.uuid){
                            this.handleList = ['发消息','解散群组','查看群资料']
                        }else{
                            this.handleList = ['发消息','退出群组','查看群资料']
                        }
                    })
                }
            },
            // 从会话列表进入会话
            intoConversationFromConlist(obj){
                this.intoConversation(obj)
                $('.show-group-info').css({
                    transform:'scale(0)'
                })
            },
            // 进入会话
            intoConversation(obj){
                // 获取好友剩余认证天数
                $('.group-member-list').hide()
                if(window.uploadTargetId==obj.targetId){
                    $('.not-file-msg').show()
                }else{
                    $('.not-file-msg').hide()
                }
                this.$store.commit('getCurrentUnreadCount',{
                    count:obj.unReadCount,
                    handle:'change'
                })
                let status = $('.auth-deadline').html().indexOf('实人认证')
                let _status = $('.auth-dead-time').html().indexOf('实人认证')
                if((status==-1 || $('.auth-deadline').css('display')=='none')){
                    if(this.currentFriendName.conversationType=='PRIVATE' && (_status==-1 || $('.auth-dead-time').css('display')=='none')){
                        this.axios.get(this.ajaxUrl + '/user/query',{
                            params:{
                                token:sessionStorage.usertoken,
                                uuid:this.currentFriendName.targetId
                            }
                        }).then(res=>{
                            if(res.data.status=='1' && res.data.data.identy_validated!='2'){
                                this.axios.get(this.ajaxUrl+'/v1/friends/gethintstatus',{
                                    params:{
                                        token:sessionStorage.usertoken,
                                        to_user:this.currentFriendName.targetId
                                    }
                                }).then(_res=>{
                                    if(_res.data.data.hint==0){
                                        this.$nextTick(()=>{
                                            $('.auth-deadline').html('Ta未认证身份，请谨慎聊天，<span style="cursor:pointer;color:#7595F1;text-decoration:underline;">提醒Ta认证</span>').show()
                                            // setTimeout(()=>{
                                            //     $('.auth-deadline span').css({textDecoration:'underline'})
                                            //     console.log('underline')
                                            // },1000)
                                            $('.auth-deadline+span').show()
                                            let _this = this
                                            $('.auth-deadline span')[0].onclick = function(){
                                                let _params = {
                                                    senderUUID:_this.userData.data.uuid,
                                                    receiverUUID:_this.currentFriendName.targetId,
                                                    tipsContent:'实人社交，你我共建，提醒您前往App完成实人认证，享受更多服务'
                                                }
                                                Message.remindAuthentication(_params,res=>{
                                                    _this.$store.commit('getSendedMessage',{
                                                        list:res,
                                                        str:'new'
                                                    })
                                                    _this.$store.commit('addUnreadCount',res)
                                                    DOMController.scrollToBottom({toBottom:true,_this:_this})
                                                })
                                            }
                                        })
                                    }else{
                                        $('.auth-deadline+span').hide()
                                        $('.auth-deadline').hide()
                                    }
                                })
                            }
                            if(res.data.data.identy_validated=='2'){
                                this.$nextTick(()=>{
                                    $('.auth-deadline').hide()
                                    $('.auth-deadline+span').hide()
                                })
                            }
                        })
                    }
                    if(obj.conversationType=='GROUP'){
                        $('.auth-deadline').hide()
                        $('.auth-deadline+span').hide()
                        let timer = setTimeout(()=>{
                            Group.getGroupInfo({id:this.currentFriendName.targetId},({baseInfo, notice})=>{
                                this.$store.commit('showGroupInfo',{
                                    group:{
                                        baseInfo,notice
                                    },
                                    handle:'getInfo'
                                })
                                if(baseInfo==null){
                                    return
                                }
                                if(this.userData.data.uuid==baseInfo.group_info.owner){
                                    this.$store.commit('showMemberCount',7)
                                    // console.log(7)
                                }else{
                                    this.$store.commit('showMemberCount',8)
                                    // console.log(8)
                                }
                                clearTimeout(timer)
                            })
                        },500)
                    }
                }
                DOMController.scrollToBottom({toBottom:true,_this:this})
                $('.init').hide()
                $('#leftnav span.message')[0].classList.add('now')
                $('#leftnav span.relations')[0].classList.remove('now')
                this.$store.commit('changeCurrentFriendName',obj)

                // 获取当前会话历史消息
                let conversationType = this.currentFriendName.conversationType
                if(obj.conversationType=='GROUP'){
                    Group.getGroupInfo({id:obj.targetId},({baseInfo, notice})=>{
                        this.$store.commit('showGroupInfo',{
                            group:{
                                baseInfo,notice
                            },
                            handle:'getInfo'
                        })
                        if(this.userData.data.uuid==baseInfo.group_info.owner){
                            this.$store.commit('showMemberCount',7)
                        }else{
                            this.$store.commit('showMemberCount',8)
                        }
                    })
                }
                getHistoryMessages(this.currentFriendName.targetId,function(listMsg,hasMsg){
                    // console.log(listMsg)
                    this.currentId = obj.targetId
                    let msgArr = []
                    deleteMsg.select_all_msg(docs=>{
                        for(let item of listMsg){
                            let idx = _.findIndex(docs.rows,(o)=>{
                                return o.messageUId == item.messageUId && o.handleUser == this.userData.data.uuid
                            })
                            if(idx<0){
                               msgArr.push(item) 
                            }
                        }
                        this.$store.commit('getSendedMessage',{
                            list:msgArr,
                            str:'changeFriend'
                        })

                        DOMController.scrollToBottom({toBottom:true,_this:this})
                        this.$store.commit('hasMessage',hasMsg)
                        // 清除未读消息
                        clearUnreadCount(conversationType, this.currentId,(uuid)=>{
                            this.$store.commit('clearUnreadCount',uuid)
                        })
                        // 多端同步消息状态(消息未读数)
                        if(listMsg.length>0){
                            syncMessageStatus({
                                message:listMsg[listMsg.length-1],
                                conversation:{
                                    conversationType:this.currentFriendName.conversationType,
                                    targetId:this.currentFriendName.targetId
                                }
                            })
                        }
                        // 已读/未读消息
                        if(this.currentFriendName.conversationType=='PRIVATE' && listMsg.length>0){
                            lastReadMessage.select_one({senderUserId:this.currentFriendName.targetId},doc=>{
                                if(doc.rows.length>0){
                                    this.$store.commit('getSyncMessageStatus',{list:doc.rows[0]})
                                }
                                if(doc.rows.length==0){
                                    let params = {
                                        senderUserId:this.currentFriendName.targetId,
                                        messageUId:listMsg[listMsg.length-1].messageUId,
                                        lastMessageSendTime:listMsg[listMsg.length-1].sentTime
                                    }
                                    lastReadMessage.insert_one(params,res=>{
                                        if(res.rowsAffected==1){
                                            this.$store.commit('getSyncMessageStatus',{
                                                list:params
                                            })
                                        }
                                    })
                                }
                            })
                        }
                        this.$store.commit('changeloadingstatus','hide')
                    })
                }.bind(this),0,conversationType)
            },
            // 联系人面板展开/收起
            takeUp(str){
                if(this.takeup.indexOf(str)>=0){
                    this.takeup.splice(this.takeup.indexOf(str),1)
                    this.$refs[str].style.display = 'none'
                }else{
                    this.takeup.push(str)
                    this.$refs[str].style.display = 'block'
                }
            }
        },
        created() {
            document.addEventListener('click',(ev)=>{
                this.handleStatus = false
                this.handleTarget = null
                this.searchFriendIptStatus = false
                this.friendPhone = ''
                this.searchFriendName = ''
                this.phoneResult = null
                this.isFriend = false
                $('.handle-msg-menu').hide()
            })
            
        },
        components:{
            'handle-menu':handleMenu,
            'user-info':UserInfo
        },
        store,
        mounted(){
            setInterval(()=>{
                let list = _.uniq(this.conversationList,'targetId')
                this.$store.commit('getConversationList',{
                    handle:'uniq',
                    list
                })
            },300)
            // 判断某个会话是否有历史消息
            // if(this.conversationList){
            //     this.$nextTick(()=>{
            //         console.log('$$$$$$')
            //         for(let item of this.conversationList){
            //             getHistoryMessages(item.targetId,(listMsg,hasMsg)=>{
            //                 if(listMsg.length==0){
            //                     console.log(listMsg)
            //                     let timer = window.setTimeout(()=>{
            //                         this.$store.commit('getConversationList',{
            //                             handle:'clear-latestmsg',
            //                             list:[item]
            //                         })
            //                         clearTimeout(timer)
            //                     },500)
            //                 }
            //             },0,item.conversationType)
            //         }
            //     })
                
            // }
            
            // 滚动隐藏右键菜单
            $('#list')[0].addEventListener('scroll',(ev)=>{
                this.handleStatus = false
                this.handleTarget = null
                $('.handle-msg-menu').hide()
                this.$store.commit('changeUserInfoStatus','hide')
            })
            this.$refs.group.style.display = 'none'
            this.$refs.friend.style.display = 'none'
            this.$refs.newFriend.style.display = 'none'
            ipcRenderer.on('test-msg',(ev,str)=>{
                // console.log(str)
            })
            ipcRenderer.on('clear-unreadmessage',(ev,str)=>{
                console.log(str)
                if(str=='clear'){
                    for(let item of this.conversationList){
                        clearUnreadCount(item.conversationType, item.targetId,(uuid)=>{
                            this.$store.commit('clearUnreadCount',uuid)
                        })
                    }
                }else{
                    this.intoConversationFromConlist(str)
                }
            })
        }
    }
</script>
<style lang="scss" scoped> 
    @import '../style/common';
    #friendlist{
        width:240px;position:fixed;left:70px;height:100%;
        z-index:5000;top:0px;display:flex;flex-direction:column;
        background:#fff;border-top:1px solid #ccc;box-sizing:border-box;
        border-bottom:1px solid #ccc;
        overflow: hidden;
        .close-handle-request{
            position:fixed;z-index:11100;width:100%;height:100%;
        }
        .handle-request,.modal-handle-request-friendlist{
            position:fixed;background:#fff;width:295px;height:207px;
            box-shadow:$div_shadow;top:96px;
            left:40%;display:none;z-index:12000;
            p.title{
                @include title_style;
                span:nth-child(1){
                    float:left;margin-left:15px;font-size:14px;
                    font-weight:600;
                }
                span:nth-child(2){
                    float:right;margin-right:10px;cursor:pointer;
                }
            }
            p.remark-message{
                padding-left:25px;margin-top:20px;font-size:14px;
                padding-right:25px;
            }
            .el-button{
                position:absolute;bottom:20px;
            }
            >.resolve{
                right:70px;@include btn_success;
            }
            >.reject{
                left:70px;@include btn_default;
            }
            .handle-result-icon{
                text-align:center;margin-top:20px;
            }
            .handle-result-notice{
                text-align:center;font-size:14px;
                margin-top:0px;color:#ccc;
            }
        }
        .modal-handle-request-friendlist{
            width:200px;height:150px;
            span.icon-guanbi{
                line-height:40px;
            }
            p.notice{
                font-size:14px;text-align:center;margin-top:20px;
            }
            .el-button{
                @include btn_success;position:absolute;bottom:20px;right:70px;
            }
        }
        .add-friend-remark,.add-friend-fail{
            position:fixed;
            // position:absolute;
            background:#fff;transform:scale(0);
            z-index:5000;width:295px;height:207px;
            top:95px;left:40%;box-shadow:0 0 3px 1px rgba(0,0,0,0.3);
            p.title{
                @include title_style;
                span:first-child{
                    float:left;margin-left:20px;
                    font-weight:600;
                }
                .close{
                    @include close_button;top:10px;
                }
            }
            input{
                width:242px;outline:none;
                padding-top:10px;padding-bottom:10px;
                padding-left:10px;margin-left:20px;
                margin-top:20px;border:1px solid #D7D2D2;
                border-radius:10px;
            }
            .el-button{
                @include btn_success;position:absolute;bottom:20px;right:20px;
            }
        }
        .add-friend-fail{
            height:140px;
            p:nth-child(2){
                text-align:center;margin-top:20px;font-size:14px;
            }
        }
        .add-friend-remark{
            
        }
        #list{
            border-right:$border_style;
            flex:1;overflow-x:hidden;
            overflow-y:auto;
            // position:relative;
        }
       
        #list::-webkit-scrollbar {/*滚动条整体样式*/
            width: 5px;
            height: 5px;
        }
        #list::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
            border-radius: 10px;max-height:30px;
            background: #fff;
        }
        #list::-webkit-scrollbar-track {/*滚动条里面轨道*/
            border-radius: 10px;
            background: #fff;
        }
        #list:hover::-webkit-scrollbar-thumb{
            background:#ddd;
        }
        .phone-result{
            background:#fff;position:absolute;z-index:4000;
            border-right:$border_style;
            
            width:239px;height:100%;left:0px;top:60px;line-height:40px;
            cursor:pointer;
            img{
                @include portrait_default;
                float:left;margin-top:5px;margin-left:15px;
            }
            span.nickname-avatar{
                @include portrait_name_default;float:left;
                margin-top:5px;margin-left:15px;
            }
            .el-button{
                float:right;padding:4px 6px;margin-top:15px;margin-right:15px;
                font-size:12px;
                background:#fff;color:#7595F1;border:1px solid rgba(103,148,236,1);
            }
            span.nickname{
                float:right;width:100px;margin-right:15px;font-size:12px;
                @include text_ellipse;display:inline-block;margin-top:5px;
            }
            .no-result{
                width:100%;text-align:center;box-sizing:border-box;
                font-size:14px;color:$min_font_color;
                span{
                    width:20px;clear:both;font-size:13px;margin-left:5px;
                }
            }
            #user-erweima{
                height:160px;width:172px;
                margin:auto;
            }
            .user-erweima-avatar{
                position:absolute;left:83px;top:102px;display:none;
                img{
                    width:36px;height:36px;border-radius:5px;
                    border-radius:5px;border:4px solid #fff;
                }
                .nickname-avatar{
                    width:36px;height:36px;font-size:20px;line-height:36px;
                    border-radius:5px;border:4px solid #fff;
                }
            }
        }
        form{
            height:60px;
            border-right:$border_style;
            text-align:center;line-height:60px;position: relative;
            .el-input{
               width:214px;
            }
            
            .add{
                position:absolute;top:1px;left:13px;
                z-index:4000;
            }
            span.search{
                top:2px;left:18px;position:absolute;font-size:12px;
                color:$min-font-color;
            }
            span.addfriend{
                border:1px solid #ddd;
                border-radius:3px;cursor:pointer;vertical-align:middle;
                font-size:16px;padding:2px;background:$main_background_color;
                color:#333;
            }
        }
        .conlist{
            top:60px;
            width:100%;
            li{
                display:flex;width:100%;
                height:70px;border-bottom:1px solid rgba(229,229,229,0.5);
                cursor:pointer;position: relative;
                // border-right:$border_style;
                &:hover{
                    background:$hover_bagcolor;
                }
                .left{
                    width:70px;
                    img{
                        width:44px;height:44px;position:absolute;
                        top:10px;left:10px;border-radius:50%;
                    }
                    span.nickname-avatar{
                        @include nickname_avatar;
                        height:44px;width:44px;line-height:44px;
                    }
                }
                .right{
                    width:164px;display:flex;flex-direction:column;
                    p{
                        width:100%;
                    }
                    p.info{
                        display:flex;padding-top:10px;
                        padding-bottom:10px;
                        // span:first-child{
                        //     font-size:14px;width:122px;font-weight:500;
                        //     @include text_ellipse;color:#333;

                        // }
                        span:last-child{
                            font-size:12px;color:#ccc;
                            text-align:right;flex:1;padding-right:5px;
                        }
                        .nickname,.remarkName{
                            display:inline-block;@include text_ellipse;
                            font-size:14px;color:#333;width:106px;
                        }
                    }
                    p:last-child{
                        text-align:left;color:$min_font_color;font-size:12px;
                        width:80%;
                        @include text_ellipse;
                        i{
                            color:#fff;position:absolute;bottom:12px;right:5px;background:red;
                            font-size:12px;font-style:normal;padding:0px 4px;
                            border:1px solid #fff;
                            border-top-left-radius:10px;
                            border-bottom-left-radius:10px;
                            border-top-right-radius:10px;
                            border-bottom-right-radius:10px;
                        }
                        .group-member-name{
                            // position:absolute;
                        }
                        >span{
                            // @include text-ellipse;min-width:50px;
                            // width:100px;display:inline-block;
                        }
                        b+span{
                            // width:50px;
                        }
                    }
                }
                
            }
            .topCon{
                background:rgba(228,228,228,0.3);;
            }
            .currentCon{
                background:rgb(228,228,228);
                .right .info .time{
                    color:#333;
                }
            }
            
        }
        // 新朋友通知列表
        .new-friend-list{
            li{
                cursor:default !important;
                img,span.nickname-avatar{
                    cursor: pointer;
                }
                
                p{
                    position:relative;line-height:25px;
                    left:55px;
                    .handle{
                        float:right;padding:4px 6px;margin-top:20px;margin-right:15px;
                        font-size:12px;
                        background:#fff;color:#7595F1;border:1px solid rgba(103,148,236,1);
                    }
                    span.reject,span.resolve{
                        float:right;margin-right:10px;cursor:pointer;
                        color:$button_color;padding:0 2px;
                        // background:#ccc;
                        margin-top:2px;border-radius:4px;
                    }
                    span:nth-child(2){
                        display:inline-block;width:100px;margin-top:5px;
                        @include text_ellipse;margin-left:12px;
                    }
                    span:first-child{
                        position:absolute;color:#ccc;
                        display:inline-block;width:110px;
                        @include text_ellipse;left:12px;
                        font-size:12px;bottom:-5px;
                    }
                }
            }
        }
        ul:not(.conlist){
            margin:0;padding:0;list-style:none;
            width:100%;
            .title{
                text-align:center;height:33px;line-height:33px;
                font-size:14px;cursor:pointer;position:relative;
                span.icon-jia{
                    color:#333 !important;
                }
                span.count-newfriend{
                    color:#fff;background:red;
                    font-size:12px;font-style:normal;padding:0 4px;
                    border:1px solid #fff;position:absolute;
                    border-top-left-radius:10px;line-height:16px;right:8px;top:10px;
                    border-bottom-left-radius:10px;
                    border-top-right-radius:10px;
                    border-bottom-right-radius:10px;
                }
                .iconfont{
                    font-size:14px;padding:0 10px;transition:all 0.3s;
                }
                .fr{
                    padding:0 10px;color:$min_font_color;
                    font-size:12px;
                }
                .choose{
                    display:inline-block;transform:rotate(90deg);
                }
            }
            li.letterFirst{
                height:84px !important;
                span.nickname{
                    height:50px !important;margin-top:20px !important;
                }
                img,.nickname-avatar{
                    margin-top:30px !important;
                }
            }
            li:not(.title){
                height:64px;border-bottom:1px solid rgba(229,229,229,0.5);
                cursor:pointer;position: relative;
                &:hover{
                    background:$hover_bagcolor;
                }
                .letter-sort{
                    background:#f5f5f5;
                    position:absolute;
                    padding-left:14px;
                    color:rgb(204, 204, 204);font-size:14px;
                    width:100%;box-sizing:border-box;height:20px;line-height:20px;
                }
                img{
                    @include portrait_default;
                    float:left;margin:10px;
                }
                span.nickname-avatar{
                    @include portrait_name_default;
                    float:left;margin:10px;
                }
                p:not(.letter-sort){
                    width:180px;position:absolute;height:50px;
                    right:0px;font-size:12px;@include text_ellipse;
                }
                span.nickname{
                    display:inline-block;height:100%;margin:0px;
                    line-height:64px;@include text-ellipse;
                    margin-left:5px;
                    float:left;width:130px;font-size:12px;
                }
            }
            .now{
                background:#EEEff2;
            }
            &::webkit-scrollbar{
                height:20px;
            }
            .last{
                border-bottom:0 none;margin-bottom:13px;
            }
            .notmatch{
                text-align:center;padding:10px 0;font-size:12px;
                color:#8b8b8b;
            }
        }
        .group{
            li{
                .no-icon{
                    background:skyblue;display:inline-block;line-height:30px;
                    border-radius:50%;margin-left:10px;height:30px;width:30px;
                    text-align:center;margin-top:10px;
                }
                span:last-child{
                    float:right;margin-right:20px;margin-top:15px;
                    font-size:12px;
                }
            }
        }
        /deep/ #contentmenu{
            position:absolute;z-index:2000;
            text-align:center;
            span{
                min-width:80px;
            }
        }
    }
</style>

