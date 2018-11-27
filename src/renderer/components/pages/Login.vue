<template>
    <div id="login" @mousemove.prevent="stopUp">
        <div class="login-out-from-app" v-show="loginoutFromApp">
            <p class="title">
                <span class="notice">提示</span>
                <span class="close iconfont icon-guanbi"
                    @click="hideLoginoutBox"></span>
            </p>
            <p class="content">
                <span>你已经退出9号米仓</span>
            </p>
            <el-button @click="hideLoginoutBox">
                确定
            </el-button>
        </div>
        <!-- <div class="password-login">
            <el-button type="primary" @click="psdlogin">密码登录</el-button>
        </div> -->
        <p class="handle-frame">
            <span class="iconfont icon-guanbi" @click="handleFrame('close')"></span>
            <span class="iconfont icon-zuixiaohua" @click="handleFrame('min')"></span>
        </p>
        <div id="login-left">
			<img src="../../assets/login-left.png" alt="下载地址"/>
        </div>
        <div id="login-right">
            <p class="login-other-client">
                当前账号于 {{loginoutTime}} 在其他电脑上上登录，此客户端已退出登录
            </p>
            <div id="erweima" title="" @mouseover="toggleMobileNotice('show')"
                @mouseout="toggleMobileNotice('hide')" v-if="LoginAgainUuid==''">
                <img src="../../assets/1024.png" alt="" class="logo">
                <div class="modal" v-show="failStatus||successScan">
                    <span class="iconfont icon-shuaxin1" 
                        @click="createErweima('1')"  v-show="failStatus"></span>
                    <span v-show="successScan && !failStatus" class="success-scan">扫码成功</span>
                    
                </div>
            </div>
            <div class="mobile-notice" @mouseover="toggleMobileNotice('show')"
                @mouseout="toggleMobileNotice('hide')"
                v-if="LoginAgainUuid==''">
                <img src="../../assets/mobile-notice.png" alt="" >
            </div>
            <div class="login-again" v-if="LoginAgainUuid!=''" style="padding-left:0px;">
                <img :src="loginAgainUser.avatar" alt="" v-if="loginAgainUser!=null && loginAgainUser.avatar!=null">
                <span class="nickname-avatar" v-if="loginAgainUser!=null && loginAgainUser.avatar==null"
                    :style="{background: portraitColor(LoginAgainUuid)}">{{loginAgainUser.nickname[0].toUpperCase()}}</span>
                <span class="nickname" v-if="loginAgainUser!=null">{{loginAgainUser.nickname}}</span>
                <button @click="confirmLogin" v-if="conformLoginStatus==false">登录</button>
                <p v-if="conformLoginStatus==true" 
                    >
                    请在<span class="after" style="color:#ff5a5a;">9号米仓</span>App确认登录
                    <br>
                    <!-- <span class="toggle-account" @click="toggleAccount" 
                        v-show="successScan && !failStatus">
                        切换账号
                        <i class="iconfont icon-xiayizhang" style="fontSize:13px;"></i>
                    </span> -->
                </p>
                
                <span class="toggle-account" @click="toggleAccount">
                    切换账号
                    <i class="iconfont icon-xiayizhang" style="fontSize:13px;"></i>
                </span>
            </div>
            <div class="text-description">
                <p class="notice" v-show="LoginAgainUuid=='' && successScan!=true" v-if="!failStatus">请使用<span class="before">9号米仓</span>App扫码登录</p>
                <p class="notice" v-if="failStatus && LoginAgainUuid=='' && successScan!=true"></p>
                <p class="notice" v-show="LoginAgainUuid=='' && successScan==true && !failStatus">请使用<span class="after">9号米仓</span>App确认登录</p>
                <span class="toggle-account" @click="toggleAccount" 
                    v-show="successScan && !failStatus">
                    切换账号
                    <i class="iconfont icon-xiayizhang" style="fontSize:13px;"></i>
                </span>
                <p class="notice" v-if="failStatus && LoginAgainUuid=='' && successScan==true"></p>

                <p class="refresh" v-show="failStatus && LoginAgainUuid==''">二维码失效，请点击刷新二维码</p>
                <ul>
                    <li class="all">
                        <img src="../../assets/downloadapp.png" alt="">
                        <span class="iconfont icon-erweima"></span>
                        <span>二维码下载</span>
                    </li>
                    <li class="android" @click="shellBrowser('android')">
                        <!-- <img src="../../assets/downloadapp.png" alt=""> -->
                        <span class="iconfont icon-changyonglogo37"></span>
                        <span>安卓下载</span>
                    </li>
                    <li class="ios" @click="shellBrowser('ios')">
                        <!-- <img src="../../assets/downloadapp.png" alt=""> -->
                        <span class="iconfont icon-ios"></span>
                        <span>苹果下载</span>
                    </li>
                </ul>
            </div>
              
        </div>
    </div>
</template>
<script>
    import store from '../../store/store'
    import { initSDK } from '../../rongcloud/initSDK'
    import { getConversationList } from '../../rongcloud/getConversationList'
    import { mapState } from 'vuex'
    import { getFriendList } from '../../rongcloud/getFriendList'
    import { setInterval, clearInterval, setTimeout, clearTimeout } from 'timers'
    import { Group } from '../../class/Group'
    import { getHistoryMessages } from '../../rongcloud/getHistoryMessage'
    import { Conversation } from '../../class/Conversation'
    import { DOMController } from '../../class/DOMController'
    import { Friend } from '../../class/Friend'
    import { Message } from '../../class/Message'
    import { callbackify } from 'util'
    import { platform } from 'os'
    import { ipcRenderer, session, shell } from 'electron'
    import user from '../../database/user'
    import { clearUnreadCount } from '../../rongcloud/clearUnreadCount'
    import lastReadMessage from '../../database/lastReadMessage'
    import _ from 'lodash'
    import { MessageType } from '../../rongcloud/messageType'
    import async from 'async'

    export default{
        data(){
            return {
                success:false,
                userInfo:null,
                timer:'',
                failStatus:false,
                successScan:false,
                LoginAgainUuid:'',
                conformLoginStatus:false,
                loginAgainUser:null,
                clickCount:0,
                loginoutTime:'',
                loginoutFromApp:false
            }
        },
        watch:{
            failStatus(val, oldval){
                if(val){
                    this.mouseout()
                }
            },
            successScan(val, oldval){
                if(val){
                    this.mouseout()
                }
            }
        },
        computed:{
            ...mapState({
                userData(state){
                    return state.userData
                },
                conversationList(state){
                    return state.conversationList
                },
                friendList(state){
                    return state.friendlist
                },
                groupList(state){
                    return state.groupList
                },
                appSetting(state){
                    return state.appSetting
                },
                currentFriendName(state){
                    return state.currentFriendName
                }
            })
        },
        methods:{
            // 阻止冒泡
            stopUp(){
                return
            },
            // 隐藏弹框
            hideLoginoutBox(){
                $('.login-out-from-app').hide()
            },

            // 计算头像背景颜色
            portraitColor(uuid){
                return DOMController.portraitColor(uuid)
            },

            // 调到浏览器打开
            shellBrowser(str){
                if(str=='android'){
                    shell.openExternal('https://a.app.qq.com/o/simple.jsp?pkgname=com.wnkj.jhmc.app')
                }
                if(str=='ios'){
                    shell.openExternal('https://itunes.apple.com/cn/app/id1434837892?mt=8')
                }
            },
            // 账户密码登录
            psdlogin(){
                this.axios.post(this.ajaxUrl + '/session',{
                    mobile:'13265987092',
                    passsword:'13265987092',
                    login_type:'mobile'
                }).then(res=>{
                    if(res.data.status=='1'){
                        this.initData(res.data)
                        this.registerMessage()
                    }
                })
            },
            // 窗口相关操作
            handleFrame(str){
                ipcRenderer.send('handle-frame',str)
            },
            // 鼠标移入、移除切换
            mouseover(){
                $('#erweima').css({
                    paddingLeft:'75px',opacity:1
                }).children('.logo').css({
                    left:'145px'
                })
                $('.mobile-notice').css({
                    right:'75px',opacity:1
                })
            },
            mouseout(){
                $('#erweima').css({
                    paddingLeft:'200px',opacity:1
                }).children('.logo').css({
                    left:'270px'
                })
                $('.mobile-notice').css({
                    right:'-50px',opacity:0
                })
            },
            toggleMobileNotice(str){
                if(this.failStatus || this.successScan || this.LoginAgainUuid!=''){
                    return
                }
                if(str=='show'){
                    this.mouseover()
                }
                if(str=='hide'){
                    this.mouseout()
                }
            },
            // 确认登录（二次登录）
            confirmLogin(){
                this.createErweima()
                this.conformLoginStatus = true
            },
            // 切换账号
            toggleAccount(){
                let timer = window.setTimeout(()=>{
                    $('.mobile-notice').css({
                        right:'-50px',opacity:0
                    })
                    clearTimeout(timer)
                },600)
                
                localStorage.setItem('latestuser','')
                this.LoginAgainUuid = ''
                if(window.$websocket){
                    window.$websocket.close()
                    window.$toggleAccount = true
                    let timer2 = window.setTimeout(()=>{
                        this.createErweima()
                        clearTimeout(timer2)
                    },500)
                }else{
                    this.createErweima()
                }
            },
            // 生成二维码
            createErweima(){
                window.$loginTwoClients = false
                // const wsServer = 'ws://47.106.228.86:9501'
                const wsServer = 'ws:chat.weinongtech.com:9501'
                let websocket =  new WebSocket(wsServer)
                window.$websocket = websocket
                let uuid = localStorage.getItem('latestuser')
                websocket.onopen = (evt)=>{
                    this.failStatus = false
                    this.successScan = false
                    if(uuid){
                        this.LoginAgainUuid = uuid
                        websocket.send('{"type":"second","uuid":"'+ uuid +'"}')
                    }
                    let timer1 = setInterval(()=>{
                        websocket.send('{"type":"heartbeat"}')
                    },60000)
                    let timer2 = window.setTimeout(()=>{
                        if(window.$websocket && this.userInfo==null){
                            window.$toggleAccount = false
                            window.$websocket.close()
                        }
                        clearTimeout(timer2)
                    },180000)
                }
                websocket.onclose = (evt)=>{
                    if(window.$toggleAccount==false){
                        this.failStatus = true
                    }
                    window.$websocket = null
                    // console.log('closed')
                }
                websocket.onmessage = (evt)=>{
                    let res = eval('('+ evt.data+')')
                    // console.log(res)
                    if(res.code==200){
                        if(res.type==='realname'){
                            window.$identyValidated = '2'
                            return
                        }
                        let system = 'win'
                        if(uuid){
                            return
                        }
                        $('.modal').nextAll().remove()
                        let time = Date.parse(new Date()).toString()
                        let qrcode = new QRCode('erweima', {
                            // text:`http://chattest.weinongtech.com/s?f=${res.fd}&t=${time.substring(0, time.length-3)}`,
                            text:`http://chat.weinongtech.com/s?f=${res.fd}&t=${time.substring(0, time.length-3)}`,
                            width: 172,
                            height: 160,
                            colorDark : '#333000',
                            colorLight : '#ffffff',
                            correctLevel : QRCode.CorrectLevel.H
                        })
                        $('#erweima').attr('title','')
                        let query = '{"type":"login","fd":'+ res.fd +'}'
                        websocket.send(query) 
                        // this.mouseover()
                    }
                    if(res.data==undefined){
                        return
                    }
                    if(res.data.loginStatus=='1'){
                        this.successScan = true
                    }
                    if(res.data.loginStatus=='3'){
                        this.success = true
                        this.userInfo = res.data
                        this.successScan = false
                        localStorage.setItem('latestuser',res.data.uuid)
                        window.$sync = res.data.sync
                        // let time = Date.parse(new Date()).toString()
                        window.$loginTime = new Date().getTime()
                        this.initData(res.data)
                        this.registerMessage()
                    }
                    if(res.data.loginStatus=='4'){
                        if(res.data.coerce==2 || res.data.coerce=='2'){
                            window.$loginTwoClients = true
                        }else{
                            window.$loginTwoClients = false
                        }
                        websocket.close()
                        window.$loginout = true
                        this.$router.push('login')
                        if(res.data.coerce==1 || res.data.coerce=='1'){
                            this.loginoutFromApp = true
                            let timer = setTimeout(()=>{
                                $('.login-out-from-app').show()
                                clearTimeout(timer)
                            },100)
                        }
                        // if(res.data.coerce==3 || res.data.coerce=='3'){
                        //     this.successScan = false
                        //     this.failStatus = false
                        //     this.createErweima()
                        // }
                    }
                }
                websocket.onerror = (evt, e)=>{
                    // console.log('error')
                } 
            },
            // 初始化数据
            initData(res){
                sessionStorage.setItem('usertoken',res.token)
                sessionStorage.setItem('rtoken',res.r_token)
                this.$router.push('/index')
                // let params = {
                //     appKey : "qd46yzrfqiomf",
                //     token : res.r_token
                // }
                // production
                let params = {
                    appKey : "kj7swf8ok1rl2",
                    token : res.r_token
                }
                let callbacks = {
                    getInstance : function(instance){

                    },
                    getCurrentUser : function(userInfo){
                        // 获取好友列表，群组列表，会话列表
                        Conversation.getConversationList(res=>{
                            const { conversationList, friendList, groupList } = res
                            let timer = setTimeout(()=>{
                                if(window.$sync=='2'){
                                    for(let item of conversationList){
                                        item.latestmsg = ''
                                    }
                                }
                                clearTimeout(timer)
                            },300)
                            this.$store.commit('getFriendList',friendList)
                            this.$store.commit('getConversationList',{
                                list:conversationList,
                                handle:'init'
                            })

                            // 判断会话是否存在历史消息
                            if(conversationList){
                                let timer = window.setTimeout(()=>{
                                    for(let item of conversationList){
                                        getHistoryMessages(item.targetId,(listMsg,hasMsg)=>{
                                            if(listMsg.length==0){
                                                this.$store.commit('getConversationList',{
                                                    handle:'clear-latestmsg',
                                                    list:[item]
                                                })
                                            }
                                        },0,item.conversationType)
                                    }
                                    clearTimeout(timer)
                                },1000)
                            }
                            this.$store.commit('addNewFriend',null)
                            this.$store.commit('getGroupList',{
                                list:groupList,
                                handle:'reset'
                            })
                        })
                    }.bind(this),
                    receiveNewMessage : function(message){
                        console.log(message)
                        
                        if(message.messageType=="TypingStatusMessage"){
                            console.log('对方正在输入...')
                        }
                        // 同步未读消息数
                        if(message.messageType=='SyncReadStatusMessage' || (message.messageType=='ReadReceiptMessage' || message.messageDirection==1)){
                            let conversationType
                            if(message.conversationType==1){
                                conversationType = 'PRIVATE'
                            }
                            if(message.conversationType==3){
                                conversationType = 'GROUP'
                            }
                            clearUnreadCount(conversationType,message.targetId,(targetId)=>{
                                this.$store.commit('clearUnreadCount',targetId)
                            })
                        }
                        // 已读/未读
                        if((message.messageType=="ReadReceiptMessage" || message.messageType=="TypingStatusMessage") && message.messageDirection==2){
                            lastReadMessage.insert_one({
                                senderUserId:message.senderUserId,
                                messageUId:message.messageUId,
                                lastMessageSendTime:message.messageType=="ReadReceiptMessage" ? message.content.lastMessageSendTime : new Date().getTime()
                            },res=>{
                                if(res.rowsAffected>=1){
                                    if(this.currentFriendName.targetId==message.senderUserId){
                                        this.$store.commit('getSyncMessageStatus',{
                                            list:{
                                                senderUserId:message.senderUserId,
                                                messageUId:message.messageUId,
                                                lastMessageSendTime:message.messageType=="ReadReceiptMessage" ? message.content.lastMessageSendTime : new Date().getTime()
                                            }
                                        })
                                    }
                                }
                            })
                        }
                        // 播放声音
                        if(this.appSetting!=null){
                            if(this.appSetting.setting){
                                if(this.appSetting.setting.messageVoice){
                                    if(message.senderUserId!=this.userData.data.uuid && this.$route.name=='index'){
                                        // 接收消息-->声音播放
                                        if(process.env.NODE_ENV=='production'){
                                            let targetId = ''
                                            if(message.conversationType==1){
                                                targetId = message.senderUserId
                                            }
                                            if(message.conversationType==3){
                                                targetId = message.targetId
                                            }
                                            let con = _.find(this.conversationList,(item)=>item.targetId = targetId)
                                            if(con){
                                                if(con.noTips=='1' || con.voiceNotice=='0'){
                                                    return
                                                }
                                            }
                                            console.log('production')
                                            let audio = new Audio(__dirname + '/static/msg_sy.mp3')
                                            audio.play()
                                            let timer = setTimeout(function(){
                                                audio.pause()
                                                clearTimeout(timer)
                                                audio = null
                                            }, 4000)
                                        }else{
                                            console.log('development')
                                        }
                                    }
                                }
                            }
                        }
                        // 消息类型-->消息方向-->是否需要创建会话-->单聊/群聊-->是否需要更新通讯录
                        let checkType = new MessageType(message).checkMsgType()
                        if(checkType){
                            // 通知消息
                            if(platform=='darwin' && message.messageDirection==2 && this.$route.name=='index' && this.appSetting.voiceNotice=='1'){
                                if(message.conversationType==1){
                                    let conver = _.find(this.conversationList,(o)=>o.targetId==message.senderUserId)
                                    if(conver==undefined || (conver!=undefined && conver.noTips!='1')){
                                        Friend.getFriendInfo(message.senderUserId,(info)=>{
                                            let myNotification = new window.Notification(info.remark_name ? info.remark_name : info.nickname, {
                                                body: RongIMLib.RongIMEmoji.emojiToSymbol(checkType.content),
                                                icon:info.avatar ? info.avatar : ''
                                            })
                                        })
                                    }
                                    
                                }
                                if(message.conversationType==3){
                                    let conver = _.find(this.conversationList,(o)=>o.targetId==message.targetId)
                                    if(conver==undefined || (conver!=undefined && conver.noTips!='1')){
                                        Group.getGroupInfo({id:message.targetId},(info)=>{
                                            Friend.getFriendInfo(message.senderUserId,Finfo=>{
                                                let Fname = Finfo.remark_name || Finfo.nickname
                                                if(message.content.mentionedInfo){
                                                    let { mentionedInfo } = message.content
                                                    if(mentionedInfo.type==2){
                                                        let nameArr = message.content.content.match(/@\S+/g,'@')
                                                        let fnArr = _.map(mentionedInfo.userIdList,(o)=>{
                                                            return function(callback){
                                                                Friend.getFriendInfo(o,info=>{
                                                                    callback(null,info)
                                                                })
                                                            }
                                                        })
                                                        async.parallel(fnArr,(errors,results)=>{
                                                            let content = ''
                                                            for(let i=0;i<nameArr.length;i++){
                                                                if(results[i]){
                                                                    let name = results[i].remark_name || results[i].nickname
                                                                    content = message.content.content.replace(nameArr[i],'@'+name)
                                                                }
                                                            }
                                                            let myNotification = new window.Notification(info.baseInfo.group_info.name, {
                                                                body: Fname + ': '+RongIMLib.RongIMEmoji.emojiToSymbol(content),
                                                                icon:info.baseInfo.group_info.icon
                                                            })
                                                        })            
                                                    }
                                                }else{
                                                    let myNotification = new window.Notification(info.baseInfo.group_info.name, {
                                                        body: Fname + ': '+RongIMLib.RongIMEmoji.emojiToSymbol(checkType.content),
                                                        icon:info.baseInfo.group_info.icon
                                                    })
                                                }
                                            })
                                        }) 
                                    }
                                }
                            }
                            let con = _.find(this.conversationList,(o)=>o.targetId==message.targetId)
                            if(con){
                                console.log('已在当前会话列表')
                                let str = message.messageDirection==1 ? 'mySelf' : 'friend'
                                new MessageType(message,str)
                                DOMController.scrollToBottom({toBottom:false,_this:this,message})
                            }else{
                                if(message.conversationType==1){
                                    console.log('新建单聊会话')
                                    Friend.getFriendInfo(message.targetId,info=>{
                                        let params = {
                                            item:{
                                                avatar:info.avatar,
                                                nickname:info.nickname,
                                                remark_name:info.remark_name,
                                                uuid:info.uuid
                                            },
                                            intoConversation:false,
                                            type:'friend',
                                            latestmsg:checkType.content,
                                            sentTime:message.sentTime,
                                            unReadCount:message.messageDirection==1 ? 0 : 1,
                                        }
                                        if(message.objectName=='WY:FriendHandle'){
                                            Friend.getFriendList(list=>{
                                                this.$store.commit('getFriendList',list)
                                                this.$store.commit('addNewFriend',{
                                                    fromUser:'WNuser:' + message.targetId,
                                                    str:'delete'
                                                })
                                            })
                                        }
                                        Conversation.createConversation(params)
                                    })
                                }
                                if(message.conversationType==3){
                                    console.log('新建群聊会话')
                                    let params = {
                                        item:{
                                            id:message.targetId
                                        },
                                        intoConversation:false,
                                        type:'group',
                                        latestmsg:checkType.content,
                                        sentTime:message.sentTime,
                                        unReadCount:message.messageDirection==1 ? 0 : 1,
                                    }
                                    Conversation.createConversation(params)
                                    if(message.objectName=='RC:GrpNtf'){
                                        let push = false
                                        if(message.content.operation=='Create'){
                                            push = true
                                        }
                                        if(message.content.operation=='Add'){
                                            if(message.content.data.targetUserIds.indexOf(this.userData.data.uuid)>=0){
                                                push = true
                                            }
                                        }
                                        if(push){
                                            Group.getGroupInfo({id:message.targetId},(res)=>{
                                                this.$store.commit('getGroupList',{
                                                    list:res.baseInfo.group_info,
                                                    handle:'push'
                                                })
                                            })
                                        }
                                    }
                                }
                            }
                        }else{
                            console.log('未检测到的消息类型',message.messageType)
                        }
                        // 接受好友请求
                        if(message.objectName=='WY:FriendNotification'){
                            let { content } = message
                            if(content.handleType==1 && message.messageDirection==2){
                                if(this.friendList!=null){
                                    for(let item of this.friendList){
                                        if(item.uuid==message.senderUserId){
                                            break
                                            return
                                        }
                                    } 
                                }
                                let obj = {
                                    nickname: content.senderNickName,
                                    avatar: content.senderAvatar,
                                    sentTime: message.sentTime,
                                    fromUuid: content.senderUUID,
                                    message:content.backUpMsg,
                                    receiverUUID: content.receiverUUID
                                }
                                this.$store.commit('addNewFriend', obj)
                            }
                            // 删除好友消息
                            if(content.handleType==4){
                                this.$store.commit('deleteFriend',message)
                                this.$store.commit('getConversationList',{
                                    list:message,
                                    handle:'delete'
                                })
                            }
                        }
                    }.bind(this)
                }
                initSDK(RongIMLib, params, callbacks)         
            },
            // 注册自定义消息
            registerMessage(){
                // 同意好友请求
                let params = {
                    backUpMsg:'',
                    handleType:0,
                    receiverUUID:'',
                    senderAvatar:'',
                    senderUUID:'',
                    senderNickName:'',
                    objectName:'WY:FriendHandle'
                }
                Message.handleFriend(params, res=>{})
                // 提醒认证消息
                let params3 = {
                    receiverUUID:'',
                    senderUUID:'',
                    tipsContent:''
                }
                Message.remindAuthentication(params3, res=>{})
                // 添加好友请求
                let params2 = params
                params2.objectName = 'WY:FriendNotification'
                Message.handleFriend(params2, res=>{})
            }
        },
        created(){
            let uuid = localStorage.getItem('latestuser')
            if(uuid){
                user.select_one({ userUuid:uuid }, res=>{
                    if(res=='insert'){
                        return
                    }
                    this.loginAgainUser = {
                        avatar:res.rows[0].avatar,
                        nickname:res.rows[0].nickname
                    }
                    this.LoginAgainUuid = uuid
                    this.$store.commit('appSetting',{
                        voiceNotice:res.rows[0].voiceNotice,
                        autoStart:res.rows[0].autoStart,
                        newMsgNotice:res.rows[0].newMsgNotice
                    })
                })
            }else{
                this.createErweima()
            }
        },
        mounted() {
            // Mac 红绿灯设置
            if(platform=='darwin'){
                $('.handle-frame').hide()
            }
            //清除定时器
            for(var each in window.pageTimer){
                clearInterval(window.pageTimer[each]);
            }
            this.$store.commit('destroyState')
            ipcRenderer.on('test-message',(ev,str)=>{})
            ipcRenderer.send('unread-count', 0)
            let uuid = localStorage.getItem('latestuser')
            // if(uuid){
            //     user.select_one({ userUuid:uuid }, res=>{
            //         console.log(res)
            //         // let attrArr = Object.keys(res.data)
            //         // this.$store.commit('appSetting',res.data)
            //         // if(res.handle=='select'){
            //         //     this.loginAgainUser = {
            //         //         avatar:res.data.avatar,
            //         //         nickname:res.data.nickname
            //         //     }
            //         //     this.LoginAgainUuid = uuid
            //         // }
            //         // if(attrArr.indexOf('avatar')<0 || attrArr.indexOf('nickname')<0){
            //         //     this.LoginAgainUuid = ''
            //         //     localStorage.setItem('latestuser','')
            //         //     this.createErweima()
            //         // }
            //     })
            // }else{
            //     this.createErweima()
            // }
            if(window.$loginTwoClients){
                let time = new Date()
                let hours = time.getHours()<10 ? ('0' + time.getHours) : time.getHours()
                let minutes = time.getMinutes()<10 ? ('0' + time.getMinutes()) : time.getMinutes()
                window.$loginoutTime = hours + ':' + minutes
                this.loginoutTime = window.$loginoutTime
                $('.login-other-client').show()
                let timer = setTimeout(()=>{
                    $('.login-other-client').hide()
                    clearTimeout(timer)
                },10000)
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import '../../style/common.scss';
    #login{
        width:856px;height:524px;
        .login-out-from-app{
            position:absolute;height:200px;width:280px;background:#fff;
            border-radius:5px;right:160px;top:160px;z-index:2000;
            box-shadow:$div_shadow;
            p.title{
                @include title_style;
                span.notice{
                    font-weight:600;float:left;margin-left:15px;font-size:14px;
                }
                span.close{
                    float:right;margin-right:10px;cursor:pointer;
                    font-size:20px;margin-top:2px;
                }
            }
            p.content{
                text-align:Center;font-size:14px;margin-top:30px;
                color:#555;
            }
            .el-button{
                @include btn_success;
                margin:auto;display:block;
                margin-top:60px;
            }
        }
        .password-login{
            position:absolute;left:300px;bottom:10px;
            z-index:5000;
            .el-button{
                cursor:pointer;
            }
        }
        #login-left{
            width:275px;float:left;
            height:100%;
            -webkit-app-region:drag;
            img{
                -webkit-app-region:drag;
                width:100%;
                height:100%;
            }
        }
        #login-right{
            width:581px;float:right;box-sizing:border-box;
            height:100%;position:relative;background:#fff;
            border:1px solid #ccc;border-left:0 none;
            .login-other-client{
                text-align:center; background:#E6503F;font-size:12px;
                color:#fff;width:350px;padding:5px;left:100px;
                display:none;
                border-radius:10px;margin-top:20px;position:absolute;
            }
            .login-again{
                margin-top:107px;
                img,.nickname-avatar{
                    height:120px;width:120px;display:block;
                    border-radius:50%;background:black;
                    margin-left:230px;margin-bottom:20px;
                }
                span.nickname-avatar{
                    text-align:center;line-height:120px;color:#fff;
                    font-size:40px;
                }
                span.nickname,span.toggle-account{
                    display:block;color:#555555;font-size:16px;
                    text-align:center;
                }
                span.nickname{
                    margin-bottom:30px;
                }
                button,p{
                    width:240px;height:37px;border:0 none;display:block;
                    margin:auto;color:#fff;font-size:16px;cursor:pointer;
                    background:rgba(117,149,241,1);border-radius:5px;
                    outline:none;
                }
                p{
                    background:#fff;color:rgba(85,85,85,1);font-size:14px;
                    text-align:center;
                }
                span.toggle-account{
                    color:#4A84FF;font-size:14px;margin-top:20px;
                    margin-bottom:101px;cursor:pointer;
                }
            }
            #erweima{
                height:162px;width:100%;cursor:pointer;
                position:relative;margin-top:106px;transition:all 0.5s;
                padding-left:202px;box-sizing:border-box;
                img.logo{
                    height:40px;width:40px;vertical-align:middle;
                    position:absolute;top:63px;left:268px;
                    transition:all 0.5s;
                    // border:4px solid #fff;
                }
                .modal{
                    width:172px;height:169px;position:absolute;
                    top:0px;left:200px;background:rgba(6,0,0,0.8);
                    z-index:3000;
                    span.iconfont{
                        display:block;position:absolute;
                        height:50px;width:50px;background:#B7B4B4;
                        color:#F8FDFD;font-size:30px;text-align:Center;
                        line-height:54px;border-radius:50%;
                        left:50%;transform:translate(-50%,-50%);
                        top:50%;z-index:4000;
                    }
                    span.success-scan{
                        position:absolute;font-size:18px;color:#FDFEFE;
                        display:block;left:50%;top:50%;
                        transform:translate(-50%,-50%);
                    }
                }
            }
            .mobile-notice{
                height:235px;width:191px;position:absolute;
                right:-50px;top:46px;transition:all 0.5s;
                opacity:0;cursor:pointer;
                img{
                    width:100%;height:100%;
                }
            }
            .text-description{
                height:234px;
                p.notice{
                    width:100%;margin-top:51px;float:left;text-align:Center;
                    height:21px;font-size:14px;font-family:PingFang-SC-Medium;
                    font-weight:500;color:rgba(85,85,85,1);line-height:20px;
                    margin-bottom:136px;
                    span.before{
                        color:#ff5a5a;
                    }
                    span.after{
                        color:#ff5a5a;
                    }
                }
                >.toggle-account{
                    display:block;position:absolute;
                    text-align:center;
                    color:#4A84FF;font-size:14px;
                    cursor:pointer;bottom:150px;left:253px;
                }
                p.refresh{
                    position:absolute;font-size:12px;color:#F90505;
                    bottom:200px;right:210px;
                }
                ul{
                    display:flex;width:100%;
                    padding-left:130px;box-sizing:border-box;
                    li{
                        width:100px;list-style:none;position:relative;
                        margin-right:20px;cursor:pointer;
                        &:hover{
                            >span{
                                color:#33360B !important;
                            }
                            >img{
                                display:block;
                            }
                        }
                        >img{
                            position:absolute;height:128px;width:129px;
                            bottom:20px;left:0px;padding:3px;background:#fff;
                            display:none;border:1px solid #ddd;
                            box-shadow:0 5px 15px rgba(0,0,0,.3);
                        }
                        height:20px;
                        span{
                            height:20px;
                        }
                        span.iconfont{
                            color:#BBBCBD;margin-right:10px;
                            padding:0px;float:left;
                        }
                        span.icon-erweima{
                            font-size:16px;margin-top:4px;
                        }
                        span.icon-changyonglogo37{
                            font-size:25px;margin-top:0px;
                            margin-right:5px;margin-left:-4px;
                        }
                        span.icon-ios{
                            font-size:18px;margin-top:2px;
                            margin-right:6px;
                        }
                        span:last-child{
                            width:70px; height:20px;line-height:20px;
                            font-size:14px; font-family:PingFangSC-Regular;
                            font-weight:400;color:#aaa;
                            display:inline-block;
                        }
                    }
                }
            }
        }
    }
    p.handle-frame{
        position:absolute;z-index:1000;
        height:26px;width:100%;
        -webkit-app-region:drag;
        span{
            float:right;display:inline-block;
            height:100%;width:36px;line-height:26px;
            color:#676767;font-size:12px;cursor:pointer;
            text-align:Center;-webkit-app-region:no-drag;
            &:hover{
                background:#ccc;
            }
        }
        span:first-child{
            &:hover{
                background:#F45454;color:#fff;
            }
        }
    }
</style>

