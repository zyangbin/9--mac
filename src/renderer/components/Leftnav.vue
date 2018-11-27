<template>
    <div id="leftnav">
        <img :src="userData.data.avatar" alt="" v-if="headimgurl!=''" class="darwin-avatar"
            @click.stop="showUserInfo($event)" v-move>
        <span v-if="headimgurl==''" class="nickname darwin-avatar" @click="showUserInfo($event)"
                :style="{background:portraitColor(userData.data.uuid)}">
                {{nickname[0].toUpperCase()}}
                <!-- {{'9'}} -->
                <!-- {{item.info.remark_name[0] || item.info.nickname[0].toUpperCase()}} -->

        </span>
        <span class="message iconfont icon-xinxi-changtai1" 
             @click="showMsList" title="聊天">
            <i v-if="unReadCount!=0">{{unReadCount>99 ? '99+' : unReadCount}}</i>
        </span>
        <span class="relations iconfont icon-tongxunlu-changtai" 
            @click="showFriendlist" title="通讯录">
            <i v-if="newFriend.length!=0">{{newFriend.length}}</i>
        </span>
        <span class="creat-group iconfont icon-jiaqun-changtai"
            @click="creatGroup" title="建群">
        </span>
        <span class="setting iconfont icon-gengduo" @click.stop="showMore()" title="更多">
            <ul>
                <li @click.stop="handleDB">
                    <span class="iconfont icon-kefu"></span>
                    <i>在线客服</i>
                </li>
                <li @click.stop="checkAbout">
                    <span class="iconfont icon-guanyusvg"></span>
                    <i>关于</i>
                </li>
                <li @click.stop="systemSet">
                    <span class="iconfont icon-shezhi"></span>
                    <i>设置</i>
                </li>
                <li @click.stop="loginOut('1')">
                    <span class="iconfont icon-kaiguan"></span>
                    <i>退出</i>
                </li> 
            </ul>
            
        </span>
        <div class="create-group-container">
            <p class="title">
                <span class="notice">发起群聊</span>
                <span class="iconfont icon-guanbi" @click="showMsList"></span>
            </p>
            <div class="friend-list" ref="choose">
                <el-input type="text" class="search" placeholder="搜索联系人" 
                    size="mini" clearable="" @keyup.native="searchLocalFriend"
                    v-model="searchFriendName"
                    prefix-icon="iconfont icon-shousuo">
                </el-input>
                <ul class="friend">
                    <li v-for = "(item,idx) in sortMail" 
                        :key="idx"  :data-uuid="item.uuid"
                        :class="{letterFirst:idx==0 || (idx>0 && sortMail[idx].firstLetter!=sortMail[idx-1].firstLetter)}">
                        <p v-if=" idx==0 || (idx>0 && sortMail[idx].firstLetter!=sortMail[idx-1].firstLetter)"
                            class="letter-sort">
                            {{item.firstLetter}}
                        </p>
                        <img :src="item.avatar" alt=""  v-move v-if="item.avatar!=null" @click="showMemberInfo($event, item)">
                        <span v-if="item.avatar==null" class="nickname-avatar" 
                            :style="{background: portraitColor(item.uuid),float:'left'}" @click="showMemberInfo($event, item)">
                            <!-- {{item.nickname[0].toUpperCase()}} -->
                            {{item.remark_name ? item.remark_name[0] : item.nickname[0].toUpperCase()}}

                        </span>
                        <el-checkbox name="type" @change="isChoose($event,item)" v-model="isChooseArr[idx]"></el-checkbox>
                        <span class="nickname">{{item.remark_name || item.nickname}}</span>
                    </li>
                    <li class="last">
                        
                    </li>
                </ul>
                <!-- <el-checkbox class="select-all" v-model="selectAllRes"
                    @change="selectAll($event,'create')">全选</el-checkbox> -->
                <!-- <el-button type="default" size="small" class="cancel" @click="isCommit(false)">取消</el-button>
                <el-button size="small" class="confirm" @click="isCommit(true,'step1')" :disabled="friendsUuid.length==0">确认</el-button> -->
            </div>
            <div class="choosed-friend">
                <p>
                    {{ choosedArr.length>0 ? '已选择'+ choosedArr.length +'个联系人 ' : '请选择需要添加的联系人'}}
                </p>
                <ul>
                    <li v-for="item of choosedArr" :key="item.uuid">
                        <img :src="item.avatar" alt=""  v-move v-if="item.avatar!=null" @click="showMemberInfo($event, item)">
                        <span v-if="item.avatar==null" class="nickname-avatar" 
                            :style="{background: portraitColor(item.uuid),float:'left'}" @click="showMemberInfo($event, item)">
                            <!-- {{item.nickname[0].toUpperCase()}} -->
                            {{item.remark_name ? item.remark_name[0] : item.nickname[0].toUpperCase()}}

                        </span>
                        <!-- <el-checkbox name="type" @change="isChoose($event,item)" v-model="isChooseArr[idx]"></el-checkbox> -->
                        <span class="nickname">{{item.remark_name || item.nickname}}</span>
                        <span class="close iconfont icon-guanbi" @click="notChoose(item)">
                        </span>
                    </li>
                </ul>
                <div class="btns">
                    <el-button class="confirm" :disabled="choosedArr.length==0" @click="isCommit(true,'step1')">确定</el-button>
                    <el-button class="cancel" @click="showMsList">取消</el-button>
                </div>
                <div class="last">

                </div>
            </div>
        </div>
        <div class="app-setting">
            <div class="about-more" @click.stop="showNonething">
                <p class="title">
                    <span>关于</span>
                        <!-- @click="closeSettingConfirm('about-more')" -->
                    <span class="close iconfont icon-guanbi" 
                        v-close:about-more>
                    </span>
                </p>
                
                <img src="../assets/1024.png" alt="" v-move>
                <h3>9号米仓</h3>
                <span class="version-notice">{{'已经是最新版本了'}}</span>
                <p>
                    <span @click.stop="shellBrowser('weinong')">官方网站</span>
                    <span @click.stop="shellBrowser('xieyi')">服务协议</span>
                    <span @click.stop="shellBrowser('version')">检查更新</span>
                </p>
                
            </div>
            <div class="modal modal-confirm-loginout">
                <p class="title">
                    <span>提示</span>
                    <span class="iconfont icon-guanbi" v-close:modal-confirm-loginout></span>
                </p>
                <p class="notice">
                    您确定要退出9号米仓Windows版吗？
                </p>
                <el-button class="reject" v-close:modal-confirm-loginout>取消</el-button>
                <el-button class="resolve" @click="loginOut('2')">确定</el-button>
            </div>
            <div class="modal modal-check-version">
                <p class="title">
                    <span>提示</span>
                    <span class="iconfont icon-guanbi" v-close:modal-check-version></span>
                </p>
                <p class="notice">当前版本已经是最新版</p>
                <el-button @click="downloadLatestPackage">下载</el-button>
            </div>
            <div class="system-setting" @click.stop="showNonething">
                <p class="title">
                    <span>系统设置</span>
                        <!-- @click="closeSettingConfirm('system-setting')" -->
                    <span class="close iconfont icon-guanbi" 
                        v-close:system-setting>
                    </span>
                </p>
                <p class="message-notice">
                    <span>接收新消息通知</span>
                    <el-switch
                        v-model="appSysSetting.newMsgNotice"
                        active-color="#498EF2"
                        inactive-color="#BFBFBF"
                        @change="appSetting($event),'new-msg-notice'">
                    </el-switch>
                </p>
                 <p class="message-voice">
                    <span>消息提示声</span>
                    <el-switch
                        v-model="appSysSetting.voiceNotice"
                        active-color="#498EF2"
                        inactive-color="#BFBFBF"
                        @change="appSetting($event,'voice-notice')">
                    </el-switch>
                </p>
                <!-- style="transform:scale(0)" -->
                 <p class="auto-start" >
                    <span>开机自动启动9号米仓</span>
                    <el-switch
                        v-model="appSysSetting.autoStart"
                        active-color="#498EF2"
                        inactive-color="#BFBFBF"
                        @change="appSetting($event,'auto-start')">
                    </el-switch>
                </p>
                <p class="clear-message"
                    @click="clearAllMsg('0')">
                    <span style="color:#7595F1;">清除聊天记录</span>
                </p>
            </div>
        </div>
        <div class="select-more-one">
            <p class="title">
                <span>提示</span>
                 <!-- @click="toggleMessageBox('.select-more-one','hide')" -->
                <span class="close iconfont icon-guanbi" style="margin-top:5px;"
                    @click="toggleMessageBox('set-group-name')"></span>
            </p>
            <input type="text" placeholder="请设置群名称" v-model="groupName" class="set-groupName-input">
            <p class="not-empty">群名称不能为空</p>
            <el-button @click="isCommit(true,'step2')">确定</el-button>
        </div>
        <div class="add-friend-fail">
            <p class="title">
                <span>添加失败</span>
                <span class="close iconfont icon-guanbi" 
                @click="toggleMessageBox('.add-friend-fail','hide')"></span>
            </p>
            <p>
                他已经是您的好友
            </p>
            <!-- <el-button @click="toggleMessageBox('.add-friend-fail','hide')">确认</el-button> -->
        </div>
        <div class="modal modal-clear-message-leftnav">
            <p class="title">
                <span>提示</span>
                <span class="iconfont icon-guanbi" v-close:modal-clear-message-leftnav></span>
            </p>
            <p class="notice">确定清空所有聊天记录</p>
            <el-button class="reject" v-close:modal-clear-message-leftnav>取消</el-button>
            <el-button class="resolve"  @click="clearAllMsg('1')">确定</el-button>
        </div>
    </div>
    
</template>
<script>
    import store from '../store/store'
    import { mapState } from 'vuex'
    import { Group } from '../class/Group'
    import { ipcRenderer, shell} from 'electron'
    import { DOMController } from '../class/DOMController'
    import user from '../database/user'
    import { Conversation } from '../class/Conversation'
    import { Message } from '../class/Message'
    import _ from 'lodash'
    import { platform } from 'os'
    const path = require('path')
    import { setTimeout, clearTimeout } from 'timers';
    import { startOnBoot } from '../public/autoStart'
    export default {
        data(){
            return {
                current:true,
                isChooseArr:[],
                friendsUuid:[],
                selectAllRes:false,
                groupName:'',
                choosedArr:[],
                _friendlist:this.$store.state.friendlist,
                searchFriendName:'',
                searchResult:[],
                downloadPackageUrl:'',
                unReadConversation:[],
                appSysSetting:{
                    voiceNotice:true,
                    autoStart:true,
                    newMsgNotice:true
                },
                appPath:''
            }
        },
        computed:{
            ...mapState({
                unReadCount(state){
                    let total = 0
                    if(state.conversationList.length!=0){
                        for(let item of state.conversationList){
                            total += item.unReadCount
                        }
                    }
                    return total
                },
                headimgurl(state){
                    return state.userData.data.avatar ? state.userData.data.avatar : ''
                },
                nickname(state){
                    return state.userData.data.nickname
                },
                friendlist(state){
                    return state.friendlist
                },
                newFriend(state){
                    return state.newFriend
                },
                userData(state){
                    return state.userData
                },
                currentFriendName(state){
                    return state.currentFriendName
                },
                conversationList(state){
                    return state.conversationList
                },
                searchList(state){
                    return state.searchList
                },
                localAppSysSetting(state){
                    return state.appSetting
                }
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
                res.sort((a,b)=>{
                    return a.firstLetter>b.firstLetter
                })
                for(let item of special){
                    res.push(item)
                }
                return res
            }
        },
        watch:{
            unReadCount(val, oldval){
                if(platform=='darwin'){
                    ipcRenderer.send('unread-total-count',val)
                }
                if(process.env.NODE_ENV === 'development'){
                    return
                }
                if(this.appSysSetting.newMsgNotice=='0'){
                    if(this.$routef.name==='index'){
                        ipcRenderer.send('unread-count', 0)
                    }
                }else{
                    if(this.$route.name==='index'){
                        ipcRenderer.send('unread-count', val)
                        this.unReadConversation = []
                        for(let item of this.conversationList){
                            if(item.unReadCount>0){
                                this.unReadConversation.push({
                                    avatar:item.avatar,
                                    nickname:item.nickname,
                                    remarkName:item.remarkName,
                                    unReadCount:item.unReadCount,
                                    targetId:item.targetId,
                                    conversationType:item.conversationType
                                })
                            }
                        }
                        ipcRenderer.send('message-list',this.unReadConversation) 
                    }
                }
            },
            groupName(val, oldval){
                if(val!='' && val.trim().length!=0){
                    $('.not-empty').hide()
                }
            },
            searchList(val,oldval){
                // console.log(val)
                if(val.list.length==0){
                    for(let i=0;i<this.sortMail.length;i++){
                        $('.friend-list ul li').eq(i).hide()
                    }
                    return
                }
                if(val.list.length>0){
                    let arr = []
                    for(let item of val.list){
                        let exist = false
                        for(let i=0;i<this.sortMail.length;i++){
                            if(item.uuid==this.sortMail[i].uuid){
                                arr.push(i)
                                break
                            }
                        }
                    }
                    for(let i=0;i<this.sortMail.length;i++){
                        if(arr.indexOf(i)>=0){
                            $('.friend-list ul li').eq(i).show()
                        }else{
                            $('.friend-list ul li').eq(i).hide()
                        }
                    }
                }
            },
            searchFriendName(val,oldval){
                if(val==''){
                    this.$store.commit('searchList',{list:this.friendlist})
                }
            }
        },
        methods:{
            // 清除所有消息记录
            clearAllMsg(status){
                if(status==='0'){
                    $('.modal-clear-message-leftnav').show()
                    return
                }
                if(status==='1'){
                    Message.clearHistoryMsg({
                        list:this.conversationList
                    },(res)=>{
                        if(res.status){
                            $('.init').show()
                            this.$store.commit('getConversationList',{
                                list:this.conversationList,
                                handle:'clear-latestmsg'
                            })
                            this.$store.commit('getCurrentUnreadCount',{
                                count:0,
                                handle:'change'
                            })
                            this.$store.commit('getAppLatestMsg',null)
                            $('.modal-clear-message-leftnav').hide()
                        }
                    })
                }
            },
            // 搜索本地好友
            searchLocalFriend(){
                this.searchResult = []
                if(this.searchFriendName==""){
                    this.$store.commit('searchList',{list:this.friendlist})
                    console.log(333)
                    return
                }
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
                this.$store.commit('searchList',{list:this.searchResult})
            },
            // 计算头像背景颜色
            portraitColor(uuid){
                return DOMController.portraitColor(uuid)
            },
            // 本地数据库相关操作 || 在线客服
            handleDB(){
                
                shell.openExternal('http://html.ecqun.com/kf/sdk/openwin.html?corpid=4082467&cstype=rand&mode=0&cskey=2fgF8VQsVvx8HU2PJD&scheme=0')
                $('.setting ul').hide()
            },
            // 设置-->关于
            checkAbout(){
                $('.system-setting').hide()
                $('.about-more').show()
                $('.setting ul').hide()
            },
            // 设置-->设置
            systemSet(){
                $('.system-setting').show()
                $('.about-more').hide()
                $('.setting ul').hide()
                
            },
            // app设置
            appSetting(bool,str){
                if(str!='auto-start'){
                    let params = {
                        userUuid:this.userData.data.uuid,
                        nickname:this.userData.data.nickname,
                        avatar:this.userData.data.avatar,
                        voiceNotice:this.appSysSetting.voiceNotice==true ? '1' : '0',
                        autoStart:this.appSysSetting.autoStart==true ? '1' : '0',
                        newMsgNotice:this.appSysSetting.newMsgNotice==true ? '1' : '0'
                    }
                    user.update_one(params, res=>{
                        this.$store.commit('appSetting',{
                            voiceNotice:this.appSysSetting.voiceNotice,
                            autoStart:this.appSysSetting.autoStart,
                            newMsgNotice:this.appSysSetting.newMsgNotice
                        })
                    })
                }
                if(str=='auto-start'){
                    console.log(this.appPath)
                    if(bool){
                        startOnBoot.enableAutoStart('9号米仓',this.appPath)
                    }else{
                        startOnBoot.disableAutoStart('9号米仓',res=>{
                            console.log(res)
                        })
                    }
                }
            },
            // 阻止冒泡
            showNonething(){
                return
            },
            // 关闭设置
            closeSettingConfirm(str){
                $('.setting ul').hide()
                if(str=='about-more'){
                    $('.about-more').css({
                        transform:'translatex(-50%) scale(0)'
                    })
                }
                if(str=='system-setting'){
                    $('.system-setting').css({
                        transform:'translatex(-50%) scale(0)'
                    })
                }
            },
            // 跳到浏览器打开
            shellBrowser(str){
                if(str=='weinong'){
                    shell.openExternal('http://www.weinongtech.com/index2.html')
                    // $('.setting ul').hide()
                    // $('.about-more').css({
                    //     transform:'translatex(-50%) scale(0)'
                    // })
                    $('.about-more').hide()
                }
                if(str=='xieyi'){
                    shell.openExternal('http://www.weinongtech.com/promise.html')
                    // $('.setting ul').hide()
                    // $('.about-more').css({
                    //     transform:'translatex(-50%) scale(0)'
                    // })
                    $('.about-more').hide()

                }
                if(str=='version'){
                    this.axios.get(this.ajaxUrl + '/api/version',{
                        params:{
                            version_id:'1.0.0',
                            type:3
                        }
                    }).then(res=>{
                        // console.log(res.data)
                        // if(res.data.status=='1'){
                        $('.modal-check-version').show()
                        if(res.data.status==='0'){
                            $('.modal-check-version p.notice').html('当前已经是最新版')
                            $('.modal-check-version .el-button').text('确定')
                            this.downloadPackageUrl = ''
                        }else{
                            $('.modal-check-version p.notice').html('检测到最新版<br/>下载最新版本' + res.data.data.newversion)
                            $('.modal-check-version .el-button').text('下载')
                            this.downloadPackageUrl = res.data.data.downloadurl
                        }
                        // }
                    })
                }
            },
            // 下载最新版安装包
            downloadLatestPackage(){
                $('.modal-check-version').hide()
                if(this.downloadPackageUrl===''){
                    return
                }else{
                    shell.openExternal(this.downloadPackageUrl)
                }
            },
            showFriendlist(){
                this.current = false
                this.$store.commit('showWhichList','friendList')
                $('.friend-list').hide()
                $('.init-blank').hide()
                $('.choosed-friend').css({
                    transform:'scale(0)'
                })
                $('.create-group-container').hide()
                $('#leftnav span.message')[0].classList.remove('now')
                $('#leftnav span.creat-group')[0].classList.remove('now')
                $('#leftnav span.relations')[0].classList.add('now')
                $('.init').show()
                $('#group-info').css({
                    transform:"scale(0)"
                })
                $('.show-group-info').css({
                    transform:'scale(0)'
                })
                this.isFalse()
                this.choosedArr = []
                $('#friendlist #list').animate({scrollTop:0},0)
            },
            showMsList(){
                this.current = true
                this.$store.commit('showWhichList','messageList')
                $('.friend-list').hide()
                $('.init-blank').hide()
                $('.choosed-friend').css({
                    transform:'scale(0)'
                })
                $('.create-group-container').hide()
                $('#leftnav span.message')[0].classList.add('now')
                $('#leftnav span.relations')[0].classList.remove('now')
                $('#leftnav span.creat-group')[0].classList.remove('now')
                $('.show-group-info').css({
                    transform:'scale(0)'
                })
                if(this.conversationList.length==0 || Object.keys(this.currentFriendName).length==0){
                    $('.init').show()
                }else{
                    $('.init').hide()
                }
                this.isFalse()
                this.choosedArr = []
                this.searchFriendName = ''
                $('#friendlist #list').animate({scrollTop:0},0)
            },
            // 查看用户信息
            showUserInfo(ev){
                this.axios.get(this.ajaxUrl +　'/user/query',{
                    params:{
                        token:sessionStorage.usertoken,
                        uuid:this.userData.uuid
                    }
                }).then(res=>{
                    $('.user-info').css({right:0})
                    this.$store.commit('showFriendMsg',res.data.data)
                    this.$store.commit('changeUserInfoStatus','show')
                    this.$store.commit('getUserData',res.data)
                    let params = {
                        el:$('.user-info'),
                        clientX:ev.clientX,
                        clientY:ev.clientY
                    }
                    DOMController.userInfoPosition(params)
                    $('.friend-list').hide()
                    $('.choosed-friend').css({
                        transform:'scale(0)'
                    })
                    $('.create-group-container').hide()
                    $('.init-blank').hide()
                    $('#group-info').css({
                        transform:'scale(0)'
                    })
                })
            },
            // 查看好友信息
            showMemberInfo(ev, item){
                this.axios.get(this.ajaxUrl + '/v1/search_friends',{
                        params:{
                            token:sessionStorage.usertoken,
                            to_user:item.uuid
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
            // 退出登录
            loginOut(str){
                if(str==='1'){
                    let text = ''
                    if(platform=='darwin'){
                        text = '您确定要退出9号米仓Mac版吗？'
                    }
                    if(platform=='win32'){
                        text = '您确定要退出9号米仓Window版吗？'
                    }
                    $('.modal-confirm-loginout p.notice').text(text)
                    $('.modal-confirm-loginout').show()
                    $('.setting ul').hide()
                }
                if(str==='2'){
                    ipcRenderer.send('unread-count', 0)
                    ipcRenderer.send('route-message', 'login')
                    this.$store.commit('changeCurrentFriendName', {})
                    this.appSetting()
                    if(window.$websocket){
                        window.$websocket.close()
                    }
                    window.$loginout = true
                    this.$router.push('/login')
                }
            },
            // 创建群组
            creatGroup(){
                $('.friend-list').show()
                $('.create-group-container').show()
                $('.init').show()
                $('.init-blank').show()
                $('#leftnav span.message')[0].classList.remove('now')
                $('#leftnav span.relations')[0].classList.remove('now')
                $('#leftnav span.creat-group')[0].classList.add('now')
                $('.choosed-friend').css({
                    transform:'scale(1)'
                })
                this.isFalse()
                this.choosedArr = []
                this.$store.commit('searchList',{list:this.friendlist})
                this.$store.commit('changeUserInfoStatus','hide')
            },
            // 是否勾选当前好友
            isChoose(ev,item){
                if(ev){
                    this.friendsUuid.push(item.uuid)
                    this.choosedArr.push(item)
                    // 判断是否全部勾选
                    let middleWare = true
                    for(let i=0;i<this.isChooseArr.length;i++){
                        if(this.isChooseArr[i]==false){
                            middleWare = false
                            break
                        }
                    }
                    if(middleWare){
                        this.selectAllRes = true
                    }
                }else{
                    this.friendsUuid.splice(item.uuid,1)
                    this.selectAllRes = false
                    for(let i=0;i<this.choosedArr.length;i++){
                        if(this.choosedArr[i].uuid==item.uuid){
                            this.choosedArr.splice(i,1)
                        }
                    }
                }
            },
            // 清空所有被勾选好友
            isFalse(){
                this.isChooseArr = []
                for(let item of this.friendlist){
                    this.isChooseArr.push(false)
                }
            },
            // 是否全选
            selectAll(bool,str){
                if(bool){
                    this.isChooseArr = []
                    for(let item of this.friendlist){
                        this.isChoose(true,item.uuid)
                        this.isChooseArr.push(true)
                        this.choosedArr = this.friendlist
                    }
                }else{
                    this.isChooseArr = []
                    this.friendsUuid = []
                    this.choosedArr = []
                    for(let item of this.friendlist){
                        this.isChooseArr.push(false)
                    }
                }
            },
            // 是否提交创建群组申请
            isCommit(bool, str){
                if(bool){
                    $('.select-more-one').show()
                    if(str=='step1'){
                        $('.set-groupName-input').focus()
                        return
                    }
                    if((this.groupName==''||this.groupName.trim().length==0) && str=='step2'){
                        $('.not-empty').show()
                        let timer = window.setTimeout(()=>{
                            $('.not-empty').hide()
                            clearTimeout(timer)
                        },3000)
                        return
                    }
                    let params = {
                        name:this.groupName,
                        friends:this.friendsUuid.join(','),
                    }
                    Group.creatGroup(params,(res)=>{
                        this.groupName = ''
                        $('.select-more-one').hide()
                        $('.friend-list').hide()
                        $('.create-group-container').hide()
                        this.showMsList()
                        this.friendsUuid = []
                        this.selectAllRes = false
                        $('.not-empty').hide()
                        this.$nextTick(()=>{
                            this.$store.commit('changeCurrentFriendName',this.conversationList[0])
                        })
                        // 更新会话列表
                        // Conversation.createConversation({
                        //     item:res,
                        //     type:'group',
                        //     intoConversation:true,
                        //     _this:this
                        // })
                        
                        // Conversation.getConversationList(res2=>{
                           
                        //     this.$store.commit('getConversationList',{
                        //         list:res2.conversationList,
                        //         handle:'init'
                        //     })
                        // })
                    })
                }else{
                    $('.friend-list').hide()
                    $('.create-group-container').hide()
                    $('.select-more-one').hide()
                    this.isFalse()
                    this.selectAllRes = false
                    this.friendsUuid = []
                }
            },
            
            showMore(){
                $('.setting ul').show()
                $('.system-setting').hide()
                $('.about-more').hide()
                $('.create-group-container').hide()
                $('.friend-list').hide()
                $('.choosed-friend').css({
                    transform:'scale(0)'
                })
                this.$store.commit('changeUserInfoStatus','hide')
                $('#group-info').css({
                    transform:'scale(0)'
                })
            },
            // 切换弹窗的显示/隐藏
            toggleMessageBox(el,str){
                if(el=='.select-more-one'){
                    this.friendsUuid = []
                }
                if(el=='set-group-name'){
                    this.groupName = ''
                    $('.select-more-one').hide()
                    $('.not-empty').hide()
                    return
                }
                DOMController.toggleMessageBox($(el),str)
            },
            // 不勾选当前好友
            notChoose(item){
                for(let i=0;i<this.sortMail.length;i++){
                    if(this.sortMail[i].uuid==item.uuid){
                        this.isChooseArr.splice(i,1,false)
                        this.isChoose(false,item)
                        break
                    }
                }
            }
        },
        store,
        mounted(){
            // 获取软件安装路径
            ipcRenderer.on('app-path',(ev,str)=>{
                if(this.appSysSetting.autoStart){
                    startOnBoot.enableAutoStart('9号米仓',this.appPath)
                }else{
                    startOnBoot.disableAutoStart('9号米仓',res=>{})
                }
                this.appPath = str
            })
            // Mac 红绿灯设置
            if(platform=='darwin'){
                $('#leftnav>.darwin-avatar').css({
                    marginTop:'20px'
                })
                $('#talkarea .right .top p').hide()
            }
            // 读取用户设置
            user.select_one({ userUuid:this.userData.data.uuid,nickname:this.userData.data.nickname,avatar:this.userData.data.avatar}, res=>{
                if(res=='insert'){
                    this.$store.commit('appSetting',{voiceNotice:'1',autoStart:'1',newMsgNotice:'1'})
                }else{
                    this.$store.commit('appSetting',{
                        voiceNotice:res.rows[0].voiceNotice,
                        autoStart:res.rows[0].autoStart,
                        newMsgNotice:res.rows[0].newMsgNotice
                    })
                    this.appSysSetting.voiceNotice = res.rows[0].voiceNotice=='1' ? true : false
                    this.appSysSetting.autoStart = res.rows[0].autoStart=='1' ? true : false
                    this.appSysSetting.newMsgNotice = res.rows[0].newMsgNotice=='1' ? true : false
                }
            })
            this.isFalse()
            document.addEventListener('click',(ev)=>{
                if(ev.target.tagName==='TEXTAREA'){
                    this.showMsList()
                }
            })
            ipcRenderer.on('clear-unreadmessage',(ev,str)=>{
                this.showMsList()
            })

            // 检测版本
            this.axios.get(this.ajaxUrl + '/api/version',{
                params:{
                    version_id:'1.0.0',
                    type:3
                }
            }).then(res=>{
                if(res.data.status==='0'){
                    $('.modal-check-version').hide()
                    $('.modal-check-version p.notice').html('当前已经是最新版')
                    $('.modal-check-version .el-button').text('确定')
                    this.downloadPackageUrl = ''
                }else{
                    $('.modal-check-version').show()
                    $('.modal-check-version p.notice').html('检测到最新版<br/>下载最新版本' + res.data.data.newversion)
                    $('.modal-check-version .el-button').text('下载')
                    this.downloadPackageUrl = res.data.data.downloadurl
                }
            })
            ipcRenderer.on('check-version',(ev,str)=>{
                this.shellBrowser('version')
            })
        }
    }
</script>
<style lang="scss" scoped>
    @import '../style/common.scss';
    #leftnav{
        width:70px;height:100%;background:#1D2640;
        position:fixed;top:0;left:0;z-index:6000;
        -webkit-app-region: drag;
        .modal-clear-message-leftnav,.modal-check-version,.modal-confirm-loginout{
            position:fixed;background:#fff;width:295px;height:207px;
            box-shadow:$div_shadow;top:35%;transform:translate(-50%,-50%);
            left:50%;
            display:none;
            z-index:12000;
            p.title{
                @include title_style;
                span:nth-child(1){
                    float:left;margin-left:15px;font-weight:600;
                }
                span:nth-child(2){
                    float:right;margin-right:10px;cursor:pointer;
                }
            }
            p.notice{
                text-align:center;margin-top:40px;font-size:14px;
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
        }
        .modal-check-version{
            p.notice{
                text-align:center !important;
            }
            .el-button{
                @include btn_success;left:126px;
            }
        }
        .create-group-container{
            p.title{
                @include title_style;
                span:nth-child(1){
                    float:left;margin-left:15px;font-weight:600;
                }
                span:nth-child(2){
                    float:right;margin-right:10px;cursor:pointer;
                    line-height:38px;
                }
            }
            position:absolute;top:61px;left:100px;
            width:539px;height:456px;display:none;
            box-shadow:3px 2px 3px 1px rgba(155, 145, 145,0.1),-3px 2px 3px 1px rgba(155, 145, 145,0.1);
        }
        .choosed-friend{
            position:absolute;
            border-left:1px solid #ddd;
            // left:340px;top:61px;
            left:238px;top:36px;
            overflow-y:auto;
            width:300px;height:420px;display:flex;flex-direction:column;
            transform:scale(0);
            // box-shadow:0 0 3px 1px rgba(0,0,0,0.3);
            // box-shadow:1px 1px 3px rgba(0,0,0,0.3),1px -1px 3px rgba(0,0,0,0.3);
            // border:$border_style;border-left:1px solid #f5f5f5;
            
            p{
                padding:20px 0px 15px 20px;
                // background:#EFF3F6;
                background:#fff;color:#868686;
                font-size:14px;
            }
            ul::-webkit-scrollbar {/*滚动条整体样式*/
                width: 5px;
                height: 1px;
            }
            ul::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
                border-radius: 10px;max-height:30px;
                background: #fff;
            }
            ul::-webkit-scrollbar-track {/*滚动条里面轨道*/
                border-radius: 10px;
                background: #fff;
            }
            ul:hover::-webkit-scrollbar-thumb{
                background:#ccc;
            }
            ul{
                background:#fff;overflow-y:auto;
                flex:1;width:100%;
                li{
                    list-style:none;height:58px;position:relative;
                    cursor:pointer;
                     img{
                        @include portrait-mini;float:left;
                        margin:10px;cursor:pointer;
                    }
                    .nickname-avatar{
                        @include portrait_name_mini;
                        margin:10px;cursor:pointer;float:left;
                    }
                    span.nickname{
                        display:inline-block;height:100%;margin:0px;
                        line-height:58px;margin-left:5px;
                        float:left;width:100px;font-size:12px;
                        @include text_ellipse;
                    }
                    span.close{
                        position:absolute;top:18px;right:20px;
                        display:inline-block;background:#ccc;
                        border-radius:50%;color:#fff;height:18px;
                        width:18px;text-align:center;line-height:23px;
                    }
                }
            }
            .btns{
                height:50px;background:#fff;padding-right:20px;
                line-height:50px;text-align:right;
                >.confirm{
                    right:10px;@include btn_success;
                }
                >.cancel{
                    right:70px;@include btn_default;
                }
            }
            .last{
                height:10px;
            }
            
        }
        .friend-list{
            position:absolute;height:400px;width:238px;
            background:#fff;border-right:0 none;
            top:36px;left:0px;
            display:none;
            padding-top:20px;
            >.el-input{
                width:200px;margin-left:18px;margin-bottom:20px;
            }
            ul::-webkit-scrollbar {/*滚动条整体样式*/
                width: 5px;
                height: 1px;
            }
            ul::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
                border-radius: 10px;max-height:30px;
                background: #fff;
            }
            ul::-webkit-scrollbar-track {/*滚动条里面轨道*/
                border-radius: 10px;
                background: #fff;
            }
            ul{
                margin:0;
                padding:0 10px;
                overflow-y:auto;
                height:352px;
                &:hover::-webkit-scrollbar-thumb{
                    background:#ccc;
                }
                li.letterFirst{
                    height:78px !important;
                    span.nickname{
                        height:50px !important;margin-top:20px !important;
                    }
                    img,.nickname-avatar{
                        margin-top:30px !important;
                    }
                    .el-checkbox{
                        margin-top:37px !important;
                    }
                    
                }
                li.last{
                    height:0px;
                }
                li{
                    list-style:none;height:58px;
                    // border-bottom:$border_style;
                    position:relative;
                    .letter-sort{
                        // background:#f5f5f5;
                        position:absolute;
                        padding-left:22px;
                        color:#827B7B;
                        font-size:14px;
                        width:100%;box-sizing:border-box;height:20px;line-height:20px;
                        
                    }
                    
                    img{
                        @include portrait_mini;float:left;
                        margin:10px;cursor:pointer;
                    }
                    .nickname-avatar{
                        @include portrait_name_mini;
                        margin:10px;cursor:pointer;float:left;
                    }
                    .el-checkbox{
                        float:right;margin:10px;
                        border-radius:50%;margin-top:15px;
                        margin-right:5px;
                    }
                    span.nickname{
                        display:inline-block;height:100%;margin:0px;
                        line-height:50px;margin-left:10px;
                        float:left;width:100px;font-size:12px;
                        @include text_ellipse;
                    }
                }
            }
            .select-all{
                margin-top:10px;float:right;
                margin-right:10px;
            }
            >.el-button{
                position:absolute;bottom:10px;padding:0;
                height:25px;width:40px;text-align:center;
                
            }
            >.confirm{
                right:10px;background:#7595F1;
                color:#fff;
            }
            >.cancel{
                right:70px;
            }
            
        }
        >img{
            width:48px;height:48px;position:fixed;top:10px;left:1px;
            border-radius:50%;cursor: pointer;padding:10px;
            -webkit-app-region:no-drag;

        }
        >.nickname{
            @include nickname_avatar;top:10px;
            position:absolute;cursor:pointer;margin-left:11px;
            -webkit-app-region:no-drag;width:48px;height:48px;
        }
        >span:not(.nickname){
            color:#fff;position:fixed;left:24px;font-size:20px;
            cursor: pointer;transition:all 0.3s;display:inline-block;
        }
        >span.iconfont{
            width:23px;height:23px;
            display:block;font-size:24px;
            color:#96A4CA;
            -webkit-app-region:no-drag;
            
        }
        span.now{
            color:#fff !important;
            // -webkit-app-region:no-drag;
        }
        .message,.relations{
            top:120px;position:relative;
            i{
                color:#fff;position:absolute;top:-12px;left:14px;background:red;
                font-size:12px;font-style:normal;padding:0 4px;
                border:1px solid #fff;
                border-top-left-radius:10px;
                border-bottom-left-radius:10px;
                border-top-right-radius:10px;
                border-bottom-right-radius:10px;
            }
        }
        .setting{
            bottom:30px;position:relative;
            font-size:20px !important;
            >ul{
                width:114px;position:absolute;display:none;
                color:$main_font_color;left:46px;border-top-right-radius:2px;
                bottom:-5px;border-bottom-right-radius:2px;
                box-shadow:3px 2px 3px 1px rgba(155, 145, 145,0.1),3px -2px 3px 1px rgba(155, 145, 145,0.1);
                list-style:none;z-index:4000;
                background:#fff;
                li{
                    padding:6px 10px;
                    span{
                        font-size:16px;color:$min_font_color;
                    }
                    i{
                        font-style:normal;font-size:14px;
                        color:#555555;
                    }
                    &:hover{
                        background:#EEEFF2;
                    }
                }
            }
        }
        .version-notice{
            position:absolute;font-size:12px;bottom:40px;right:15px;
            color:#FF5A5A;display:none;
        }
        .creat-group{
            top:246px;font-size:20px !important;
        }
        .relations{
            top:180px;font-size:24px;left:22px;
        }
        .add-friend-fail{
            @include message_box;width:200px;height:120px;left:360px;
            p.title{
                @include title_style;
                span:nth-child(1){
                    float:left;margin-left:15px;font-weight:600;
                }
                .close{
                    @include close_button;font-size:14px;top:10px;
                }
            }
            p:nth-child(2){
                text-align:center;margin-top:20px;font-size:14px;
            }
            .el-button{
                @include confirm_button;
            }
        }
        .about-more{
            width:394px;height:250px;display:none;
            position:fixed;top:60px;background:#fff;
            left:50%;transform:translateX(-50%);
            box-shadow:3px 2px 3px 1px rgba(155, 145, 145,0.1),-3px 2px 3px 1px rgba(155, 145, 145,0.1);

            img{
                width:75px;height:75px;margin-top:38px;
                margin-left:158px;
            }
            h3{
                text-align:Center;padding:10px 0;color:#787B8C;
                font-size:21px;font-weight:500;
            }
            p.title{
                height:36px;text-align:center;background:#EFF3F6;
                font-weight:600;
                span:first-child{
                    float:left;margin-left:10px;margin-top:8px;
                    font-size:14px;font-weight:600;
                }
                .close{
                    @include close_button;line-height:30px;
                }
            }
            
            p:not(.title){
                display:flex;justify-content:space-between;margin-top:10px;
                span{
                    flex:1;text-align:center;text-decoration:none;
                    color:#141414;cursor:pointer;
                    font-size:14px;
                    &:hover{
                        color:$icon_color;
                    }
                }
            }
        }
        .system-setting{
            width:394px;height:250px;display:none;
            position:fixed;top:60px;background:#fff;
            left:50%;transform:translateX(-50%);
            box-shadow:3px 2px 3px 1px rgba(155, 145, 145,0.1),-3px 2px 3px 1px rgba(155, 145, 145,0.1);
            p.title{
                height:36px;text-align:left;background:#EFF3F6;
                span:first-child{
                    line-height:36px;margin-left:10px;font-size:14px;
                    font-weight:600;
                }
                .close{
                    @include close_button;line-height:30px;
                }
            }
            p:not(.title){
                height:50px;line-height:50px;font-size:14px;
                padding:0 25px;font-weight:500;
                >span{
                    float:left;
                }
                /deep/ .el-switch{
                    float:right;
                    height:100%;
                }
            }
            p.clear-message{
                span{
                    color:#7A95CA;cursor:pointer;
                }
            }
        }
        .select-more-one{
            @include message_box;left:220px;display:none;
            height:180px;width:300px;transform:scale(1);
            .el-button{
                @include btn_success;position:absolute;right:25px;
                bottom:10px;
            }
            p.title{
                @include title_style;
                span:first-child{
                    float:left;margin-left:20px;
                    font-weight:600;
                }
            }p.not-empty{
                color:#FF5A5A;display:none;
                text-align:center;font-size:14px;
            }
            input{
                width:242px;outline:none;
                padding-top:10px;padding-bottom:10px;
                padding-left:10px;margin-left:20px;
                margin-top:20px;border:1px solid #D7D2D2;
                border-radius:10px;
            }
            .close{
                @include close_button;
            }
        }
    }
</style>

