<template>
    <div id="talkarea">
       <div class="img-preview">
           <p class="title">
               <span class="download iconfont icon-xiazai" 
                   title="下载到本地" @click="downloadImg">
               </span>
               <span class="close iconfont icon-guanbi" @click="closeImgPreview"></span>
           </p>
           <div class="imgpreview-container">

           </div>
           <span class="close iconfont icon-guanbi" @click="closeImgPreview"></span>
           <span class="pre iconfont icon-fanhuishangyizhang" 
               @click="playImg('pre')" v-if="currentImgIdx>0">
            </span>
           <span class="next iconfont icon-xiayizhang" 
               @click="playImg('next')" v-if="currentImgIdx<imgContainerArr.length-1">
            </span>
           <!-- <span class="download iconfont icon-xiazai" 
               title="下载到本地" @click="downloadImg"></span> -->
        </div>
        <div class="left"></div>
        <div class="right">

            <!-- 查看群资料 -->
            <div class="show-group-info" v-if="currentGroup!=null">
                <p class="title" v-if="currentGroup.baseInfo!=null">
                    <span>
                        {{currentGroup.baseInfo.group_info.name}}
                    </span>
                    <span>
                        {{`( ${currentGroup.baseInfo.members.length} )`}}
                    </span>
                </p>
                <ul class="overflow-scroll" v-if="currentGroup.baseInfo!=null"> 
                    <li v-for="(item,idx) of currentGroup.baseInfo.members" :key="idx">
                        <user-portrait 
                            :userInfo="item" :size="'default'">
                        </user-portrait>
                        <span class="nickname">
                            {{item.nickname}}
                        </span>
                    </li>
                </ul>
                <div class="btn">
                    <el-button @click="sendMsgFromGroupInfo">
                        发消息
                    </el-button>
                </div>
            </div>

            <!-- 发送名片 -->
            <div class="share-card">
                
            </div>
            
            <div class="init">
                <img src="../assets/init-logo.png" alt="" v-move>
                <!-- <span class="iconfont icon-rslogo"></span> -->
                <p>请选择一个会话开始聊天</p>
            </div>
            <div class="init-blank" style="zIndex:5001;background:#fff;">

            </div>
            <div class="top" v-if="currentFriendName!=null">
                <span class="firendname">{{currentFriendName.remarkName || currentFriendName.nickname}}</span>
                <span class="person iconfont icon-geren1" :style="{marginTop:platform=='darwin' ? '0px' : '15px'}"
                    @click.stop="showFriendInfo($event, currentFriendName)"
                    v-if="currentFriendName.conversationType=='PRIVATE'" >
                </span>
                <span class="person iconfont icon-qunmingpian" :style="{marginTop:platform=='darwin' ? '0px' : '15px'}"
                    @click.stop="showGroupInfo(currentFriendName,'show')"
                    v-if="currentFriendName.conversationType=='GROUP'" >
                </span>
                <span class="sending" v-show="sended">对方正在输入...</span>
                <p>
                    <span class="iconfont icon-guanbi" @click="handleFrame('close')"></span>
                    <span class="iconfont icon-kuoda" style="fontSize:8px;" @click="handleFrame('max')"></span>
                    <span class="iconfont icon-zuixiaohua" @click="handleFrame('min')"></span>
                    <span class="iconfont icon-zhiding2"  @click="handleFrame('settop')"
                        :class="{isTop:isAlwaysTop}" title="置顶"></span>
                </p>
            </div>
            <div class="middle" ref="middle">

                <!-- <div class="message-list">
                    <msg-component v-for="(item,idx) of sendedMessage" :key='idx' :message="item">

                    </msg-component>
                </div> -->


                <p class="auth-dead-time" v-show="identyValidated!='2' && authDeadlineDay>0">
                    <span>请前往9号米仓App进行实人认证，剩余</span>
                    <span class="time"></span>
                    <span class="notice">
                        <img src="../../../static/auth-notice.png"/>
                        <span class="triangle iconfont icon-triangle-right"></span>
                    </span>
                    <span class="iconfont icon-guanbi" v-close:auth-dead-time></span>
                </p>
                <span class="iconfont icon-shangshuangjiantou toBottom" 
                    @click="getUnreadMsg('top')" style="top:90px;"
                    v-if="(currentUnreadCount-sendedMessage.length)>0">
                    {{(currentUnreadCount-sendedMessage.length)>99 ? '99+' : (currentUnreadCount-sendedMessage.length) + ' 条未读消息'}}
                </span>
                <span class="iconfont icon-xiashuangjiantou toBottom" 
                    style="bottom:190px;" v-if="appLatestMsg!=null && appLatestMsg.atBottom==false && appLatestMsg.message.targetId==currentFriendName.targetId"
                    @click="getUnreadMsg('bottom')">
                    你有未读消息
                </span>
                <!-- && authDeadlineDay>0 -->
                <!-- && currentFriendName.conversationType=='PRIVATE' -->
                <p 
                    class="auth-deadline"
                    v-show=" identyValidated!='2' && authDeadlineDay<=0">
                    您未在10天内完成实人认证，已经暂停聊天服务，完成实人认证恢复聊天功能
                </p>
                <span class="close iconfont icon-guanbi" 
                    @click="closeAuthNotice" 
                    v-show="identyValidated!='2' && authDeadlineDay<=0 && currentFriendName.conversationType=='PRIVATE'"></span>
                <div class="currentloading">
                    <p v-show="!nomore">
                        <span class="iconfont icon-loading">
                        </span>
                        努力加载中。。。
                    </p>
                    <p v-show="nomore">
                            没有更多了
                    </p>
                </div>
                <div class="loading" v-if="loadingstatus">
                    <p>
                        <span class="iconfont icon-loading">
                        </span>
                        努力加载中。。。
                    </p>
                    
                </div>

                <div class="con-container" v-if="Object.keys(currentFriendName).length>0">
                     <!-- v-if="item.content.operation!='Rename' 
                        && item.content.operation!='Create' 
                        && item.objectName!='WY:FriendHandle'
                        && item.objectName!='WY:FriendNotification'" -->
                        <!-- v-if="(msgSync=='1' && Math.abs(item.sentTime -loginTime)<=1000*60*60*24*5) || (msgSync=='2' && item.sentTime>=loginTime)" -->
                        <!-- v-if="((msgSync=='1' && ((loginTime - item.sentTime)<=1000*60*60*24*5)||(item.sentTime>=loginTime)) || (msgSync=='2' && item.sentTime>=loginTime)) && item.objectName!='WY:FriendNotification' " -->

                    <div v-for="(item,idx) in sendedMessage" :key="idx"
                        class="conversation clearfix" @click="showUserInfo($event,item)"
                        @contextmenu.stop="showUserInfo($event,item,'@')"
                        v-if="isShow(item,idx)"
                        v-show="item.messageType!='handleFriend' && item.content.handleType!=4"
                        :class="{fromFriend:item.messageDirection==2,fromMe:item.messageDirection==1}"
                    >
                    <div class="container-special-message" v-if="item.objectName=='RC:StkMsg' || item.objectName=='RCBQMM:EmojiMsg' || item.objectName=='RC:VCInvite' || item.objectName=='RC:CardMsg' || item.objectName=='RC:SightMsg' || item.objectName=='WY:ShareReportMessage' || item.objectName=='RCBQMM:GifMsg'">
                        <span>
                            {{item.content.content}}
                        </span>
                    </div>
                    <!-- 系统提示类消息 -->
                    <!-- 消息时间 -->
                    <div class="container-special-message" style="float:left;margin-bottom:10px;"
                        v-if="item.messageType=='TextMessage' || item.messageType=='FileMessage' || item.messageType=='ImageMessage' || item.messageType=='VoiceMessage'"
                        v-show="(idx>=1 && (sendedMessage[idx].sentTime-sendedMessage[idx-1].sentTime)>180000) || idx==0">
                        <span>{{item.sentTime | formatMsgTime}}</span>
                        <!-- <span>{{item.sentTime}}</span> -->
                    </div>
                    <div class="container-special-message" v-if="item.objectName=='RC:GrpNtf' || item.objectName=='WY:IdentityNotification' || item.objectName=='WY:UploadpicNotification' || item.objectName=='WY:FriendHandle' || item.objectName=='RC:RcCmd'">
                        <span v-if="item.objectName=='WY:IdentityNotification' && item.content.receiverUUID==userData.data.uuid"
                            style="background:#fff;">
                            <img src="../../../static/auth-notice-22.png" alt="" style="width:360px;height:69px;" class="notice-img">
                           <!-- <span class="title">实人社交，你我共建</span>
                           <span class="notice">提醒您前往App完成实人认证，享受更多服务</span> -->
                        </span> 
                        <span v-if="item.objectName=='WY:IdentityNotification' && item.content.receiverUUID!=userData.data.uuid"
                            style="max-width:235px;box-sizing:border-box;padding:5px;background:#fff;border:1px solid #D8D8D8;color:#000;font-size:14px;
                            text-align:left;padding:10px;display:block;" class="clearfix">
                            <img src="../../../static/notice-auth-1.png" style="float:left;margin:5px 0;" class="notice-img"/>
                            <span style="float:right;width:155px;display:block;background:#fff;color:#000;font-size:14px;hyphens:auto;line-break: anywhere;overflow-wrap: break-word;word-break: break-all;padding:0px;">
                                {{'您已成功邀请' + (currentFriendName.remarkName ? '"' + currentFriendName.remarkName + '"': '"' + currentFriendName.nickname + '"') + '进行实人认证' }}
                            </span>
                            <!-- {{'您已成功邀请' + (currentFriendName.remarkName ? '"' + currentFriendName.remarkName + '"': '"' + currentFriendName.nickname + '"') + '进行实人认证' }} -->
                        </span>
                        <span v-if="item.objectName=='RC:RcCmd' && currentFriendName.conversationType=='PRIVATE'">
                            {{item.messageDirection==1 ? '你撤回了一条消息' : ((currentFriendName.remarkName ? '"' + currentFriendName.remarkName + '"': '"' + currentFriendName.nickname + '"') + ' 撤回了一条消息')}}
                        </span>
                        <span v-if="item.objectName=='RC:RcCmd' && currentFriendName.conversationType=='GROUP'">
                            {{withdrawMsgNickname(item)}}
                        </span>
                        <span v-if="item.objectName=='WY:UploadpicNotification'">
                            无图无真相，提醒您在App'我的->个人资料'中上传照片，展示最美的自己
                        </span>
                        <span v-if="item.objectName=='RC:GrpNtf' && item.content.operation=='Add'">
                            {{(item.content.operatorUserId==userData.data.uuid ? '你邀请 ' : (item.content.data.operatorNickname + '邀请 ')) + item.content.data.targetUserDisplayNames.join(',')+' 加入群组'}}
                        </span>
                        <span v-if="item.objectName=='RC:GrpNtf' && item.content.operation=='Rename'">
                            {{(item.content.operatorUserId==userData.data.uuid ? '你修改群名为: ' : (item.content.data.operatorNickname + '修改群名为 ')) + item.content.data.targetGroupName}}
                        </span>
                        <span v-if="item.objectName=='RC:GrpNtf' && item.content.operation=='Create'">
                            {{(item.content.operatorUserId==userData.data.uuid ? '你创建了群组' : (item.content.data.operatorNickname + ' 创建了群组'))}}
                        </span>
                        <span v-if="item.objectName=='RC:GrpNtf' && item.content.operation=='Quit'">
                            {{item.content.data.operatorNickname+' 退出了群组'}}
                        </span>
                        <span v-if="item.objectName=='RC:GrpNtf' && item.content.operation=='Kicked'">
                            {{(item.content.operatorUserId==userData.data.uuid ? '你' : item.content.data.operatorNickname) + ('将 '+ item.content.data.targetUserDisplayNames.join(',') + ' 移除群组')}}
                        </span>
                        <span v-if="item.objectName=='WY:FriendHandle' && item.senderUserId==userData.data.uuid">
                            {{'您已同意添加'+currentFriendName.nickname+'为好友，现在可以开始聊天了'}}
                            <!-- {{item.senderUserId!=userData.data.uuid ? '我已同意添加您为好友，现在我们可以聊天了': '您已同意添加'+currentFriendName.nickname+'为好友，现在可以开始聊天了'}} -->
                        </span>
                    </div>
                    <div class="container user clearfix" v-if="item.objectName!='RC:StkMsg' && item.objectName!='RCBQMM:EmojiMsg' && item.objectName!='RC:VCInvite' && item.objectName!='RC:CardMsg' && item.objectName!='RC:SightMsg' && item.objectName!='WY:ShareReportMessage' && item.objectName!='RC:GrpNtf' && item.objectName!='WY:IdentityNotification' && item.objectName!='WY:UploadpicNotification' && item.objectName!='WY:FriendHandle' && item.objectName!='RC:RcCmd' && item.objectName!='RCBQMM:GifMsg'">
                        <span class="content" @contextmenu.prevent="handleMsg($event, item)"
                            v-if="item.messageType=='ContactNotificationMessage'"
                            :class="{usercontent:item.messageDirection==1, location:item.messageType=='LocationMessage'}">
                            {{'我们已经是好友了，可以开始聊天了'}}
                        </span>
                        <!-- 地理位置消息 -->
                        <p v-if="item.messageType=='LocationMessage'"
                            class="location ellipsis"
                            :title="item.content.poi"
                            style="color:#ccc;"
                            @contextmenu.stop="handleMsgMenu($event,item)"
                            @click="getLocation(item.content.longitude + ',' + item.content.latitude, 'large' + '~' + item.content.poi)"
                        >
                            <span style="color:#333;fontWeight:600;">[位置]</span><br>
                            {{item.content.poi}}
                        </p>
                        <span v-if="item.messageDirection==1 && item.messageType=='LocationMessage' && syncMessageStatus!=null"
                            :style="syncMessageStatus.lastMessageSendTime>=item.sentTime ? 'position:absolute;bottom:20px;right:261px;color:#ccc;font-size:14px;' : 'position:absolute;bottom:20px;right:261px;color:#4a90e2;font-size:14px;'">
                            {{syncMessageStatus.lastMessageSendTime>=item.sentTime ? '已读' : '送达'}}
                        </span>   
                        <div v-if="item.messageType=='LocationMessage'" :id="item.messageId"
                            @contextmenu.stop="handleMsgMenu($event,item)"
                            class="content" :class="{usercontent:item.messageDirection==1}"
                            @click="getLocation(item.content.longitude + ',' + item.content.latitude, 'large' + '~' + item.content.poi)">
                            <img src="../assets/location-map.png" alt="" class="msgImg" v-if="item.messageDirection==1"
                                style="width:100%;right:15px;position:relative;height:95px;border-radius:0;" v-move>
                            <img src="../assets/location-map.png" alt="" class="msgImg" v-if="item.messageDirection!=1"
                                style="width:100%;right:5px;position:relative;height:95px;border-radius:0;" v-move> 
                        </div>

                        <!-- 文字消息 -->
                        <!-- @contextmenu.prevent="handleMsg($event, item)" -->
                        <span class="content" 
                            @contextmenu.stop="handleMsgMenu($event,item)"
                            v-html="formatemoji(item)"
                            v-if="item.messageType=='TextMessage'"
                            :class="{usercontent:item.messageDirection==1}"
                            @click="openURL($event,'click')"
                            @mousemove="openURL($event,'mouseover')" @mouseout="openURL($event,'mouseout')">
                            <!-- {{item.content.content}} -->
                        </span>
                        <!-- <span v-if="item.messageDirection==1 && item.messageType=='TextMessage'"
                            style="position:absolute;bottom:20px;right:260px;color:#ccc;font-size:14px;">
                            已读
                        </span>  -->

                        <!-- 提醒认证类消息 -->
                        <span class="content"
                            v-if="item.objectName=='WY:IdentityNotification' && item.messageDirection==2"
                            v-text="item.content.receiverUUID==userData.data.uuid ? '实人社交，你我共建，提醒您前往App完成实人认证，享受更多服务' : '您已成功发送实人认证提醒'">
                        </span>

                        <!-- 添加好友提示消息 -->
                        <span class="content"
                            v-if="item.objectName=='WY:FriendHandle'">
                            {{item.senderUserId!=userData.data.uuid ? '我已同意添加您为好友，现在我们可以聊天了': '您已同意添加'+currentFriendName.nickname+'为好友，现在可以开始聊天了'}}
                        </span>

                        <!-- 语音消息 -->
                        <span v-if="item.messageType=='VoiceMessage'" 
                            @contextmenu.stop="handleMsgMenu($event,item)"
                            style="min-width:50px;"
                            class="voice content clearfix" :class="{usercontent:item.messageDirection==1}"
                            @click="play($event, item.content.content, item.content.duration,'span')">
                            <a v-if="item.messageDirection==1" style="float:right;"
                                @click="play($event, item.content.content, item.content.duration,'span')">
                                {{item.content.duration + '"'}}
                            </a>
                            <a v-if="item.messageDirection!=1" style="float:left;"
                                @click="play($event, item.content.content, item.content.duration,'span')">
                                {{item.content.duration + '"'}}
                            </a>
                            <i class="iconfont icon-yuyinxiaoxi voice" 
                                v-if="item.messageDirection==1"
                                @click="play($event, item.content.content, item.content.duration,'i')"
                                style="float:left;transform:rotate(180deg);margin-top:-2px;margin-left:-2px;">

                            </i>
                            <i class="iconfont icon-yuyinxiaoxi voice" v-else
                                style="position:absolute;right:8px;top:10px;"
                                @click="play($event, item.content.content, item.content.duration,'i')"
                                >

                            </i>
                            <img src="../../../static/voice-1.gif" alt="" 
                                v-if="item.messageDirection==1"
                                @click.stop="play($event, item.content.content, item.content.duration,'img')"
                                style="position:absolute;width:20px;height:20px;top:8px;left:-2px;display:none;">
                            <img src="../../../static/voice-2.gif" alt="" 
                                @click.stop="play($event, item.content.content, item.content.duration,'img')"
                                v-else style="position:absolute;width:20px;height:20px;top:8px;right:-2px;display:none;">
                            <span v-if="item.messageDirection==1 && item.messageType=='VoiceMessage' && currentFriendName.conversationType=='PRIVATE' && syncMessageStatus!=null"
                                :style="syncMessageStatus.lastMessageSendTime>=item.sentTime ? 'color:#ccc;font-size:14px;position:relative;bottom:0px;right:58px;' : 'color:#4a90e2;font-size:14px;position:relative;bottom:0px;right:58px;'">
                                {{syncMessageStatus.lastMessageSendTime>=item.sentTime ? '已读' : '送达'}}
                            </span> 
                        </span>

                        <!-- 文件类型消息 -->
                        <span v-if="item.objectName=='RC:FileMsg'" class=" content file-message"
                            style="borderRadius:5px;max-width:300px;height:48px;"
                            @contextmenu.stop="handleMsgMenu($event,item)"
                            @click="downloadFile(item.content.fileUrl,item.content.name)">
                            <span class="iconfont icon-wenjian-" v-if="item.messageDirection==1"
                                style="display:block;height:30px;position:absolute;top:-10px;right:-10px;fontSize:80px;color:#fff;">
                            </span>
                            <span class="name" v-if="item.messageDirection==1"
                                style="margin-right:60px;display:block;maxWidth:240px;min-width:50px;text-overflow:ellipsis;
                                    white-space:nowrap;float:right;overflow:hidden;">
                                {{item.content.name}}
                            </span><br>
                            <span class="size" style="position:absolute;bottom:5px;right:70px;color:#8b8b8b;" v-if="item.messageDirection==1">
                                {{calculateFileSzie(item.content.size)}}
                            </span>
                             <span class="name" v-if="item.messageDirection==2"
                                style="display:block;text-align:right;maxWidth:240px;min-width:50px;float:left;text-overflow:ellipsis;
                                    white-space:nowrap;marginTop:-18px;margin-left:60px;overflow:hidden;">
                                {{item.content.name}}
                            </span><br>
                            <span class="size" 
                                v-if="item.messageDirection==2"
                                style="position:absolute;bottom:5px;left:70px;color:#8b8b8b;">
                                {{calculateFileSzie(item.content.size)}}
                            </span>
                            <span class="iconfont icon-wenjian-"
                                style="display:block;position:absolute;left:-10px;top:-10px;height:30px;fontSize:80px;color:#fff;" 
                                v-if="item.messageDirection==2">
                            </span>
                            <span v-if="item.messageDirection==1 && item.messageType=='FileMessage' && currentFriendName.conversationType=='PRIVATE'"
                            :style="syncMessageStatus.lastMessageSendTime>=item.sentTime ? 'color:#ccc;font-size:14px;position:relative;bottom:10px;right:43px;' : 'color:#4a90e2;font-size:14px;position:relative;bottom:10px;right:43px;'">
                            {{syncMessageStatus.lastMessageSendTime>=item.sentTime ? '已读' : '送达'}}
                            </span> 
                        </span>

                        <!-- 图片消息 -->
                        <span v-if="item.messageDirection==1 && item.messageType=='ImageMessage' && currentFriendName.conversationType=='PRIVATE' && syncMessageStatus!=null"
                            :style="syncMessageStatus.lastMessageSendTime>=item.sentTime ? 'color:#ccc;font-size:14px;position:relative;bottom:10px;' : 'color:#4a90e2;font-size:14px;position:relative;bottom:10px;'">
                            {{syncMessageStatus.lastMessageSendTime>=item.sentTime ? '已读' : '送达'}}
                        </span> 
                        <img :src="item.content.imageUri" alt="" data-magnify="gallery"
                            :data-src="item.content.imageUri" v-move
                            @contextmenu.stop="handleMsgMenu($event,item)"
                            v-if="item.messageType=='ImageMessage'"
                            class="msgImg" @contextmenu.prevent="handleMsg($event, item)"
                            @click="zoomImg($event, item)">
                        <!-- 小三角提示 -->
                        <i class="iconfont icon-triangle-right"
                            v-if="item.messageType=='TextMessage'|| item.messageType=='VoiceMessage' || item.messageType=='ContactNotificationMessage' || item.messageType=='FileMessage'"
                            :class="{usercontent:item.messageDirection==1,friendcontent:item.messageDirection!=1,timetriangle:(idx>=1 && (sendedMessage[idx].sentTime-sendedMessage[idx-1].sentTime)>180000) || idx==0}">
                        </i>
                        <img :src="currentFriendName.avatar" alt="" v-move
                            v-if="(currentFriendName.avatar!=null && currentFriendName.avatar!='') && (item.messageDirection==2 && item.conversationType==1)"/>
                        <img :src="userHeadimg"  v-move
                            v-if="(item.messageDirection==1 && item.conversationType==1) && userHeadimg!=null"
                            @click="showUserInfo($event,item)"/>
                        <span v-if="(item.messageDirection==1 && item.conversationType==1) && userHeadimg==null"
                            class="nickname-avatar" :style="{background: portraitColor(userData.data.uuid)}"
                            >
                            {{userData.data.nickname[0].toUpperCase()}}
                        </span>
                        <span v-if="currentFriendName.avatar==null && item.messageDirection==2 && item.conversationType==1" 
                            class="nickname-avatar" 
                            :style="{background: portraitColor(currentFriendName.targetId)}">
                            <!-- {{currentFriendName.nickname[0].toUpperCase()}} -->
                           {{currentFriendName.remarkName ? currentFriendName.remarkName[0] : currentFriendName.nickname[0].toUpperCase()}}

                        </span>
                        <span v-if="item.conversationType==3 && (Object.keys(groupMemberInfo).indexOf(item.messageId)<0)" 
                            v-html="getGroupFriendAvarar(item)">
                        </span>
                        <span v-html="groupMemberInfo[item.messageId]">
                        </span>
                        <span class="time">
                            {{item.sentTime | formattime}}
                        </span>
                    </div>
                    </div><br>
                </div>
            </div>
            <div class="bottom">
                <div class="group-member-list" v-if="currentGroup!=null && currentFriendName.conversationType=='GROUP' && currentGroup.baseInfo.members.length>1">
                    <ul v-if="currentGroup.baseInfo">
                        <li v-for="(item,idx) of currentGroup.baseInfo.members" :key="idx"
                            @click="sendPointMsg(item)" v-if="item.uuid!=userData.data.uuid">
                            <img :src="item.avatar" alt="" v-if="item.avatar!=null && item.avatar!=''" v-move>
                            <span class="nickname-avatar" v-else :style="{background:portraitColor(item.uuid)}">
                                {{item.remark_name ? item.remark_name[0] : item.nickname[0].toUpperCase()}}
                                <!-- {{item.remark_name[0] || item.nickname[0].toUpperCase()}} -->
                            </span>
                            <span class="nickname">{{(item.remark_name ? item.remark_name.substr(0,10) : item.remark_name) || (item.nickname.length>10 ? item.nickname.substr(0,10) : item.nickname)}}</span>
                        </li>
                    </ul>
                </div>
                <div class="panel">
                   
                    <span class="smileface iconfont icon-biaoqing1"
                    style="fontSize:18px;" title="表情"
                        @mousemove="showEmojiList($event)"
                        @mouseout="showEmojiList($event)">
                    </span>
                    <!-- :accept="fileType"   -->
                    <span class="file iconfont icon-wenjian1" @mouseover="togglePreCon('block')" 
                        @mouseout="togglePreCon('none')" title="发送文件">
                        <input type="file" class="file" title="发送文件" style="cursor:pointer;font-size:0;"
                         multiple @change="getFileCount($event)"/>
                        <i v-if="files.length!=0" class="count">{{files.length}}</i>
                    </span>
                    <span class="printscreen iconfont icon-jianqie1" title="截图" @click="screenshot($event)"></span>
                    <span class="message iconfont icon-shouye-xiaoxi" @click="getConHisMsg" style="display:none"></span>
                    <span class="not-empty-msg">消息不能为空 !</span>
                    <span class="max-image-size">图片大小建议不超过100KB !</span>
                    <span class="not-file-msg"></span>
                    <div class="emojilist" ref="emojilist" v-show="emojiListstatus"
                        @mouseover="showEmojiList($event)"
                        @mouseout="showEmojiList($event)">
                    </div>
                </div>
                    <!-- @keydown.enter.prevent="sendMessage"  -->
                <textarea v-model="message" 
                    @keydown="changeLine($event)"
                    @contextmenu.stop="handleMsgMenu($event)"
                    ref="message">
                </textarea>
                 <span class="ctrl-notice">
                        Enter发送 Ctrl+Enter换行
                    </span>
                <span class="sendmsg" @click="sendMessage">发送</span>
                <div class="previewImg" ref="preivew" v-show="files.length!=0"
                    @mouseover="togglePreCon('block')" @mouseout="togglePreCon('none')">
                    <ul>
                        <li v-for="(item,idx) of files" :key="idx" 
                            @click="deleteImg(idx,$event)"
                            v-html="item" >
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- 消息不能为空 -->
        <div class="empty-message">
            <p class="title">
                <span>提示</span>
                <!-- @click="closeMessageBox('.empty-message')" -->
                <span class="close iconfont icon-guanbi" 
                    v-close:empty-message>
                </span>
            </p>
            <p>消息不能为空</p>
            <!-- <el-button>确定</el-button> -->
        </div>
        <!-- 对方不是好友 -->
        <div class="not-friend">
            <p class="title">
                <span>提示</span>
                <!-- @click="closeMessageBox('.empty-message')" -->
                <span class="close iconfont icon-guanbi" 
                    v-close:not-friend>
                </span>
            </p>
            <p class="content">对方不是您的好友</p>
        </div>
        <!-- 删除好友提示 -->
        <div class="delete-friend">
            <p class="title">
                <span>提示</span>
                <!-- @click="closeMessageBox('.delete-friend')" -->
                <span class="close iconfont icon-guanbi" 
                v-close:delete-friend></span>
            </p>
            <p class="content">
                
            </p>
            <el-button @click="deleteFriend">确定</el-button>
        </div>
        <!-- 消息右键菜单操作 -->
        <div class="handle-msg-menu">
            <el-button @click.stop="operatorMsg('copy')" :disabled="handleMsgMenuStatus.copy" class="copy">复制</el-button>
            <el-button @click.stop="operatorMsg('paste')"  :disabled="handleMsgMenuStatus.paste" class="paste">粘贴</el-button>
            <el-button @click.stop="operatorMsg('withdraw')" :disabled="handleMsgMenuStatus.withdraw" class="withdraw">撤回</el-button>
            <el-button @click.stop="operatorMsg('delete')" :disabled="handleMsgMenuStatus.delete" class="delete">删除</el-button>
            <el-button @click.stop="operatorMsg('share')" :disabled="handleMsgMenuStatus.share" class="share" style="display:none;">转发</el-button>
            <el-button @click.stop="operatorMsg('save')" :disabled="handleMsgMenuStatus.save" class="save">保存</el-button>
        </div>
        <handle-menu :contentlist="handlelist" ref="handlemenu" 
            v-show="handlestatus" :msg="handleMessage">
        </handle-menu>
    </div>
</template>
<script>
    import store from '../store/store'
    import message from '../database/message'
    import deleteMsg from '../database/deleteMsg'
    import {mapState, install} from 'Vuex'
    import handleMenu from './common/ContentMenu'
    import initSDK from '../rongcloud/initSDK'
    // import emojiList from '../rongcloud/emojiList'
    import { Emoji } from '../public/emojiList'
    import sendMessage from '../rongcloud/sendMessage'
    import { getHistoryMessages } from '../rongcloud/getHistoryMessage'
    import { loadingmore } from './common/loadingmore'
    import { setInterval, clearInterval, setTimeout, clearTimeout } from 'timers'
    import { playVoice } from '../rongcloud/playVoice'
    import { Group } from '../class/Group'
    import { Common } from '../class/Common'
    import { ipcRenderer, shell, ipcMain } from 'electron'
    import { DOMController } from '../class/DOMController'
    import { Friend } from '../class/Friend'
    import user from '../database/user'
    import Vue from 'vue'
    const path = require('path')
    const fs = require('fs')
    const {clipboard} = require('electron')
    const {nativeImage} = require('electron')
    import _ from 'lodash'
    import jQuery from 'jquery'
    import { mkdir } from 'fs'
    import {screenShot} from './common/screenShot'
    // import screenShotCut from 'shortcut-capture'
    window.jQuery = jQuery
    import { Upload } from '../public/upload'
    import { dragEditorContainer } from '../public/dragEditorContainer'
    import { MenuSetGray } from '../public/menuSetGray'
    let timer = window.setTimeout(()=>{
        require('../../../static/magnify/jquery.magnify.min.js')
        clearTimeout(timer)
    },1000)
    import { entryOfSendMsg } from '../public/entryOfSendMsg'
    import MsgComponent from './message/MsgComponent'
    import UserPortrait from './baseComponents/UserPortrait'
    import { syncMessageStatus } from '../public/syncMessageStatus'
    import lastReadMessage from '../database/lastReadMessage'
    import async from 'async'
    import { platform } from 'os'
    export default {
        name:'location',
        data(){
            return {
                message:'',
                handlelist:[''],
                handlestatus:false,
                emojiListstatus:false,
                nomore:true,
                sended:false,
                fileType:'.png,.jpg,.gif,jpeg',
                files:[],
                isChange:false,
                handleMessage:null,
                groupMemberInfo:{},
                imgContainerArr:[],
                currentContainerImg:null,
                currentImgIdx:-1,
                isAlwaysTop:false,
                authDeadlineDay:0,
                identyValidated:'-1',
                maxStatus:false,
                msgSync:window.$sync,
                loginTime:window.$loginTime,
                handleCurrentMsg:null,
                handleMsgMenuStatus:{
                    copy:false,
                    paste:false,
                    delete:false,
                    withdraw:false,
                    share:false,
                    save:false
                },
                shortCut:null,
                dragLineHeight:0,
                platform
            }
        },
        computed:{
            ...mapState({
                currentUnreadCount:'currentUnreadCount',
                currentFriendName:'currentFriendName',
                appLatestMsg:'appLatestMsg',
                messageObjs:'messageObjs',
                syncMessageStatus:'syncMessageStatus',
                rtoken(state){
                    return sessionStorage.getItem('rtoken')
                },
                userData(state){
                    return state.userData
                },
                sendedMessage(state){
                    return state.sendedMessage
                },
                loadingstatus:'loadingstatus',
                userHeadimg(state){
                    return state.userData.data.avatar
                },
                conversationList(state){
                    return state.conversationList
                },
                hasMsg(state){
                    return state.hasMsg
                },
                imgContanier(state){
                    return state.imgFileUrl
                },
                currentGroup(state){
                    return state.currentGroup
                },
                friendlist(state){
                    return state.friendlist
                },
                groupList(state){
                    return state.groupList
                }
            }),
            groupFriendAvatar:function(id){
                return id
            },
            
        },
        methods:{
            // 从群资料入口发消息
            sendMsgFromGroupInfo(){
                entryOfSendMsg({
                        _this:this,
                        userInfo:{
                            uuid:String(this.currentGroup.baseInfo.group_info.id)
                        },
                        type:'group',
                        intoConversation:true
                    })
            },
            // 拉伸消息输入框
            dragEditorContainer(ev){
                if(ev.type==='mousedown'){
                    this.dragLineHeight = $('#talkarea .bottom').height()
                    var params = {
                        ev,
                        dragLine:$('#talkarea .drag-line'),
                        targetEl:$('#talkarea .bottom')
                    }
                    var dragInstance = new dragEditorContainer(params)
                    dragInstance.drag()
                    if(ev.type==='mousemove'){
                        console.log(dragInstance)
                    }
                }
                
                if(ev.type==='mousemove'){
                    console.log(ev.clientY)
                    this.dragLineHeight += 2
                    $('#talkarea .bottom').css({
                        height:this.dragLineHeight + 'px'
                    })
                    // console.log(height)
                    // console.log(dragInstance)
                }
                // dragEditorContainer(params)
            },

            // 判断是谁撤回了一条消息
            withdrawMsgNickname(msg){
                let exist = false
                if(this.currentGroup==null){
                    return
                }
                let { members} = this.currentGroup.baseInfo
                for(let item of members){
                    if(msg.senderUserId==item.uuid){
                        if(msg.senderUserId==this.userData.data.uuid){
                            return '你 撤回了一条消息'
                        }else{
                            return '"' + (item.remark_name ? item.remark_name : item.nickname) + '" 撤回了一条消息'
                        }
                        exists = true
                        break
                    }
                }
                if(exist==false){
                    return '撤回了一条消息'
                }
            },

            // 消息是否显示
            isShow(item,idx){
                let show = false
                if(((this.msgSync=='1' && ((this.loginTime - item.sentTime)<=1000*60*60*24*5)||(item.sentTime>=this.loginTime)) || (this.msgSync=='2' && item.sentTime>=this.loginTime)) && item.objectName!='WY:FriendNotification'){
                    show = true
                }
                if(item.isRecall){
                    show = false
                }
                if(item.is_delete){
                    show = false
                }
                if(item.messageType=='handleFriend'){
                    if(item.content.handleType==4){
                        return false
                    }
                }
                return show
            },

            // 获取撤回消息人的姓名
            RcCmdName(item){
                this.axios.get('/v1/search_friends',{
                    params:{
                        token:sessionStorage.usertoken,
                        to_user:item.senderUserId
                    }
                }).then(res=>{
                    console.log(res.data)
                })
            },

            // 操作消息
            operatorMsg(str){
                $('.handle-msg-menu').hide()
                // 撤回
                if(str=='withdraw'){
                    if(new Date().getTime() <= (this.handleCurrentMsg.sentTime + 120000)){
                        if(this.handleCurrentMsg.senderUserId==this.userData.data.uuid){
                            RongIMClient.getInstance().sendRecallMessage(this.handleCurrentMsg, {
                                onSuccess: function (message) {
                                    console.log(message)
                                    this.$store.commit('getSendedMessage',{
                                        list:message,
                                        str:'new'
                                    })
                                    this.$store.commit('addUnreadCount',message)
                                    this.handleCurrentMsg = null
                            }.bind(this),
                                onError: function (errorCode,message) {
                                    console.log("撤回失败",message)
                            }})
                        }
                    }
                }
                // 删除
                if(str=='delete'){
                    let obj = {}
                    this.axios.get(this.ajaxUrl + '/v1/search_friends',{
                            params:{
                                token:sessionStorage.usertoken,
                                to_user:this.handleCurrentMsg.senderUserId
                            }
                        }).then(res=>{
                            if(res.data.status=='1'){
                                obj.avatar = res.data.data.avatar
                                obj.nickname = res.data.data.nickname
                                obj.remark_name = res.data.data.remark_name
                                obj.messageUId = this.handleCurrentMsg.messageUId
                                obj.senderUserId = this.handleCurrentMsg.senderUserId
                                obj.is_delete = false
                                obj.targetId = this.handleCurrentMsg.targetId
                                obj.handleUser = this.userData.data.uuid
                                deleteMsg.insert_msg(obj, res=>{
                                    this.$store.commit('getSendedMessage',{
                                        str:'delete',
                                        handleMsg:this.handleCurrentMsg
                                    })
                                    this.handleCurrentMsg = null
                                })
                            }
                        })
                }
                // 保存
                if(str=='save'){
                    if(this.handleCurrentMsg.objectName=='RC:FileMsg'){
                        this.downloadFile(this.handleCurrentMsg.content.fileUrl,this.handleCurrentMsg.content.name)
                        this.handleCurrentMsg = null
                    }
                    if(this.handleCurrentMsg.objectName=='RC:ImgMsg'){
                        let a = document.createElement('a')
                        let event = new MouseEvent('click')
                        a.download = name 
                        a.href = this.handleCurrentMsg.content.imageUri
                        a.dispatchEvent(event)
                        this.handleCurrentMsg = null
                    }
                }
                // 复制
                if(str=='copy'){
                    let content = window.getSelection().toString()
                    clipboard.writeText(content, 'selection')
                }
                // 粘贴
                if(str=='paste'){
                    // 粘贴图片
                    if(clipboard.readImage().toDataURL() && clipboard.readImage().toDataURL()!='data:image/png;base64,'){
                        let urlData = clipboard.readImage().toDataURL()
                        var bytes=window.atob(urlData.split(',')[1])
                        var ab = new ArrayBuffer(bytes.length)
                        var ia = new Uint8Array(ab)
                        for (var i = 0; i < bytes.length; i++) {
                            ia[i] = bytes.charCodeAt(i)
                        }
                        let image = new Blob( [ab] , {type : 'image/png'})
                        image.name = '9号米仓_' + new Date().getTime() + '.png'
                        this.getFileCount({
                            type:'paste',
                            files:[image]
                        })
                    }
                    this.message += clipboard.readText('selection')
                    $('textarea').focus()
                }
            },

            // 消息菜单按钮的显示/置灰
            setGray(msg){
                // 输入框
                if(msg==='textarea'){
                    let params = {
                        str:'textarea',
                    }
                    let res = new MenuSetGray(params).setGray()
                    Object.keys(res).forEach(item=>{
                        this.handleMsgMenuStatus[item] = !res[item]
                    })
                // 消息
                }else{
                    let params = {
                        message:this.handleCurrentMsg
                    }
                    let res = new MenuSetGray(params).setGray()
                    Object.keys(res).forEach(item=>{
                        this.handleMsgMenuStatus[item] = !res[item]
                    })
                }
            },

            // 消息右键菜单操作
            handleMsgMenu(ev,msg){
                if(ev.clientY<200){
                    $('.handle-msg-menu').css({
                        left:ev.clientX,
                        bottom:window.innerHeight-ev.clientY-140
                    }).show()
                }else{
                    $('.handle-msg-menu').css({
                        left:ev.clientX,
                        bottom:window.innerHeight-ev.clientY
                    }).show()
                }
                if(ev.target.tagName!='TEXTAREA'){
                    this.handleCurrentMsg = msg
                    this.setGray(msg)
                    if(msg.objectName=='RC:TxtMsg'){
                        if(window.getSelection().toString()=='' && this.handleCurrentMsg.objectName=='RC:TxtMsg'){
                            var range = document.createRange()
                            range.selectNodeContents(ev.target)
                            var selection = window.getSelection()
                            selection.removeAllRanges()
                            selection.addRange(range)            
                        }
                    }
                }
                if(ev.target.tagName=='TEXTAREA'){
                    this.setGray('textarea')
                }
            },

            // 计算文件大小
            calculateFileSzie(num){
                if(num==undefined){
                    return '未知大小'
                }
                if((num/1024)>1024){
                    return (num/(1024*1024)).toFixed(1) + ' M'
                }
                if( num>=1024 && (num/1024)<1024){
                    return (num/1024).toFixed(1) + ' K'
                }
                if(num<1024){
                    return num + 'B'
                }
            },

            // 发送@消息
            sendPointMsg(member){
                this.message += (member.remark_name ? member.remark_name : member.nickname) + ' '
                $('.bottom textarea').focus()
                $('.group-member-list').hide()
            },

            // 打开消息中的链接
            openURL(ev,str){
                if(ev.target.tagName=='A'){
                    if(str=='click'){
                        shell.openExternal(ev.target.innerText)
                    }
                }
            },

            // 输入框换行
            changeLine(ev){
                if(!ev.ctrlKey && ev.keyCode==13){
                    ev.preventDefault()
                    this.sendMessage()
                }
                if(ev.ctrlKey && ev.keyCode==86){
                    this.operatorMsg('paste')
                }
                if(ev.ctrlKey && ev.keyCode==13){
                    this.message += '\n'
                }
                if(ev.shiftKey && (ev.keyCode==50 || ev.keyCode==229)){
                    // console.log(ev.keyCode)
                    // $('.group-member-list').show() 
                }else{
                    $('.group-member-list').hide()
                }
            },

            // 关闭认证提示
            closeAuthNotice(){
                this.axios.post(this.ajaxUrl+'/v1/friends/closehint',{
                    token:sessionStorage.usertoken,
                    to_user:this.currentFriendName.targetId
                }).then(res=>{
                    $('.auth-deadline').hide()
                    $('.auth-deadline+span').hide()
                })
            },

            // 关闭弹窗提示
            closeMessageBox(el){
                $(el).hide()
            },

            // 计算头像背景颜色
            portraitColor(uuid){
                return DOMController.portraitColor(uuid)
            },

            // 获取地址位置消息
            getLocation(str,size){
                if(size.indexOf('large')>=0){
                    this.$store.commit('friendLocation',size.split('~')[1])
                    $('#container').show()
                    $('.index-close').show()
                    $('.close-all-msgbox').show()
                    
                    var map = new AMap.Map('container', {
                        center:[str.split(',')[0], str.split(',')[1]],
                        zoom:11
                    })
                    AMap.plugin('AMap.ToolBar',function(){//异步加载插件
                        var toolbar = new AMap.ToolBar();
                        map.addControl(toolbar);
                    })
                    new AMap.Marker({
                        map: map,
                        position: [str.split(',')[0], str.split(',')[1]],
                        icon: new AMap.Icon({            
                            size: new AMap.Size(40, 50),  //图标大小
                            image: "https://webapi.amap.com/theme/v1.3/images/newpc/way_btn2.png",
                            // iamge:'../../../static/location.png',
                            imageOffset: new AMap.Pixel(0, -60)
                        })        
                    })
                }else{
                    if(this.message!=''){
                        return
                    }
                    let id = size.split('~')[1]
                    let div = document.getElementById(id)
                    if(div==null){
                        return
                    }
                    var map = new AMap.Map(id, {
                        center:[str.split(',')[0], str.split(',')[1]],
                        zoom:10
                    })
                    AMap.plugin('AMap.ToolBar',function(){//异步加载插件
                        map.addControl(toolbar);
                    })
                    new AMap.Marker({
                        map: map,
                        position: [str.split(',')[0], str.split(',')[1]],
                    })
                }
            },

            // 获取群友头像
            getGroupFriendAvarar(m){
                if(this.currentFriendName.conversationType=='PRIVATE'){
                    return
                }
                if(this.currentGroup==null || this.currentGroup==undefined){
                    return
                }
                if(this.currentGroup.baseInfo==null || this.currentGroup.baseInfo==undefined){
                    return
                }
                let { members} = this.currentGroup.baseInfo
                let avatar = ''
                // 从群成员查找
                for(let item of members){
                    // 找到群成员
                    if(item.uuid==m.senderUserId){
                        // 判断是否是自己发送的消息
                        let direction = 'left'
                        if(item.uuid==this.userData.data.uuid){
                            direction = 'right'
                        }
                        // 判断是否有头像
                        if(item.avatar!=null){
                            avatar =  `<img src=${item.avatar} 
                            style="width:36px;height:36px;border-radius:50%;
                            float:${direction};margin:0 10px;cursor:pointer;
                            " v-move>`
                            if(m.messageType=='LocationMessage'){
                                avatar =  `<img src=${item.avatar} 
                                style="width:36px;height:36px;border-radius:50%;
                                margin:0 10px;cursor:pointer;
                                position:absolute;${direction}:0px;top:10px;" v-move>` 
                            }
                            break
                        }else{
                            avatar = `<span class="nickname-avatar" style="margin:0 10px;height:36px;
                            width:36px;line-height:36px;font-size:14px;color:#fff;
                            background:${this.portraitColor(item.uuid)};
                            display:block;float:${direction};line-height:36px;border-radius:50%;
                            text-align:center;cursor:pointer;" 
                            :style="{background: portraitColor(item.uuid)}">
                            ${item.remark_name ? item.remark_name[0] : item.nickname[0].toUpperCase()}</span>`
                            if(m.messageType=='LocationMessage'){
                                avatar = `<span class="nickname-avatar" style="margin:0 10px;height:36px;
                                width:36px;line-height:36px;font-size:14px;background:${this.portraitColor(item.uuid)};
                                display:block;float:${direction};line-height:36px;border-radius:50%;
                                text-align:center;cursor:pointer;position:absolute;${direction}:0px;top:10px;" 
                                >
                                ${item.remark_name ? item.remark_name[0] : item.nickname[0].toUpperCase()}</span>`
                            }
                        }
                    }
                } 
                if(avatar){
                    return avatar
                }else{
                    let direction = 'left'
                    if(m.senderUserId==this.userData.data.uuid){
                        direction = 'right'
                    }
                    message.select_one_msg(m,_msg=>{
                        let msg = _msg.rows[0]
                        if(msg==undefined){
                            return
                        }
                        if(msg.avatar!=null){
                            this.groupMemberInfo[m.messageId] = `<img src=${msg.avatar} 
                                style="width:36px;height:36px;border-radius:50%;
                                float:${direction};margin:0 10px;cursor:pointer;" v-move>`
                            if(m.messageType=='LocationMessage'){
                                this.groupMemberInfo[m.messageId] = `<img src=${msg.avatar} 
                                style="width:36px;height:36px;border-radius:50%;
                                float:${direction};margin:0 10px;cursor:pointer;position:absolute;left:0px;top:10px;" v-move>`
                            }
                        }else{
                            
                            this.groupMemberInfo[m.messageId] = `<span class="nickname-avatar" style="margin:0 10px;height:36px;
                                width:36px;line-height:36px;font-size:14px;background:${this.portraitColor(msg.senderUserId)};
                                display:block;float:${direction};line-height:36px;border-radius:50%;
                                text-align:center;cursor:pointer;color:#fff;">${msg.remark_name ? msg.remark_name[0] : msg.nickname[0].toUpperCase()}</span>`
                            if(m.messageType=='LocationMessage'){
                                this.groupMemberInfo[m.messageId] = `<span class="nickname-avatar" style="margin:0 10px;height:36px;
                                width:36px;line-height:36px;font-size:14px;background:${this.portraitColor(msg.senderUserId)};
                                display:block;line-height:36px;border-radius:50%;position:absolute;top:10px;
                                text-align:center;cursor:pointer;color:#fff;">${msg.remark_name ? msg.remark_name[0] : msg.nickname[0].toUpperCase()}</span>`
                            }
                        }
                    })
                    this.groupMemberInfo[m.messageId] = `<span class="nickname-avatar" style="margin:0 10px;height:36px;
                        width:36px;line-height:36px;font-size:14px;background:${this.portraitColor(m.senderUserId)};
                        display:block;float:${direction};line-height:36px;border-radius:50%;
                        text-align:center;cursor:pointer;color:#fff;">${'9'}</span>`
                    if(m.messageType=='LocationMessage'){
                        this.groupMemberInfo[m.messageId] = `<span class="nickname-avatar" style="margin:0 10px;height:36px;
                        width:36px;line-height:36px;font-size:14px;background:${this.portraitColor(m.senderUserId)};
                        display:block;line-height:36px;border-radius:50%;position:absolute;top:10px;
                        text-align:center;cursor:pointer;color:#fff;">${'9'}</span>`
                    }
                    this.axios.get(this.ajaxUrl + '/v1/search_friends',{
                            params:{
                                token:sessionStorage.usertoken,
                                to_user:m.senderUserId
                            }
                        }).then(res=>{
                            if(res.data.data==null){
                                return
                            }
                            if(res.data.data.avatar!=null){
                                this.groupMemberInfo[m.messageId] = `<img src=${res.data.data.avatar} 
                                    style="width:36px;height:36px;border-radius:50%;
                                    float:${direction};margin:0 10px;cursor:pointer;" v-move>`
                                if(m.messageType=='LocationMessage'){
                                    this.groupMemberInfo[m.messageId] = `<img src=${res.data.data.avatar} 
                                    style="width:36px;height:36px;border-radius:50%;
                                    float:${direction};margin:0 10px;cursor:pointer;position:absolute;left:0px;top:10px;" v-move>`
                                }
                            }else{
                               
                                this.groupMemberInfo[m.messageId] = `<span class="nickname-avatar" style="margin:0 10px;height:36px;
                                    width:36px;line-height:36px;font-size:14px;background:${this.portraitColor(res.data.data.uuid)};
                                    display:block;float:${direction};line-height:36px;border-radius:50%;
                                    text-align:center;cursor:pointer;color:#fff;">${res.data.data.remark_name ? res.data.data.remark_name[0] : res.data.data.nickname[0].toUpperCase()}</span>`
                                if(m.messageType=='LocationMessage'){
                                    this.groupMemberInfo[m.messageId] = `<span class="nickname-avatar" style="margin:0 10px;height:36px;
                                    width:36px;line-height:36px;font-size:14px;background:${this.portraitColor(res.data.data.uuid)};
                                    display:block;line-height:36px;border-radius:50%;position:absolute;top:10px;
                                    text-align:center;cursor:pointer;color:#fff;">${res.data.data.remark_name ? res.data.data.remark_name[0] : res.data.data.nickname[0].toUpperCase()}</span>`
                                }
                            }
                        })
                    }
            },
            // 显示好友信息
            showFriendInfo(ev, msg){
                if(ev.target.classList.contains('notice-img')){
                    return
                }
                this.axios.get(this.ajaxUrl + '/v1/search_friends',{
                        params:{
                            token:sessionStorage.usertoken,
                            to_user:msg.targetId || msg.uuid
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
            // 显示群组信息
            showGroupInfo(item,str){
                if(str=='show'){
                    $('#group-info').css({
                        transform:'scale(1)'
                    })
                    $('.friend-list-add').css({
                        transform:'scale(0)'
                    })
                }
                $('.handle-group-member').hide()
                
                Group.getGroupInfo({id:item.targetId},({baseInfo, notice})=>{
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
                    if(this.userData.data.uuid==this.currentGroup.baseInfo.group_info.owner){
                        this.$store.commit('showMemberCount',7)
                    }else{
                        this.$store.commit('showMemberCount',8)
                    }
                })
            },
            // emoji表情转换
            formatemoji(msg){
                let str = msg.content.content
                let reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|%|#|-)+)/g;
                str = str.replace(/\n/g,'<br/>')
                str = str.replace(/\s/g,'&nbsp;')
                str = str.replace(reg,function(a,b,c){return '<a style="color:#4A90E2;">'+"http://" +c+'</a>'})
                let nickname = ''
                if(msg.content.mentionedInfo){
                    let { mentionedInfo } = msg.content
                    if(mentionedInfo.type==2){
                        let nameArr = msg.content.content.match(/@\S+/g,'@')
                        let fnArr = _.map(mentionedInfo.userIdList,(o)=>{
                            return function(callback){
                                Friend.getFriendInfo(o,info=>{
                                    callback(null,info)
                                })
                            }
                        })
                        msg.content.mentionedInfo = null
                        async.parallel(fnArr,(errors,results)=>{
                            let content = ''
                            for(let i=0;i<nameArr.length;i++){
                                if(results[i]){
                                    let name = results[i].remark_name || results[i].nickname
                                    content = msg.content.content.replace(nameArr[i],'@'+name)
                                }
                            }
                            msg.content.content = content
                            this.$store.commit('getSendedMessage',{
                                str:'@msg',
                                msg
                            })
                        })
                    }
                }
                if(msg.messageDirection==1 && this.currentFriendName.conversationType=='PRIVATE' && this.syncMessageStatus!=null){
                    let text = '送达'
                    if(this.syncMessageStatus.lastMessageSendTime<msg.sentTime){
                        text = '送达'
                    }else{
                        text = '已读'
                    }
                    return RongIMLib.RongIMEmoji.emojiToHTML(str) + `<span v-if="item.messageDirection==1 && item.messageType=='LocationMessage'"
                            style="position:absolute;bottom:5px;left:-33px;color:${text=='已读' ? '#ccc' : '#4A90E2'};font-size:14px;">${text}
                        </span> `
                }else{
                    return RongIMLib.RongIMEmoji.emojiToHTML(str)
                }
            },
            // 显示/隐藏图片容器
            togglePreCon(str){
                if(str=="block"){
                    if(this.files.length>0){
                        this.$refs.preivew.style.display = str
                    }
                }
                if(str=="none"){
                    this.$refs.preivew.style.display = str
                }
            },
            // 删除图片
            deleteImg(idx, ev){
                let target = ev.target || ev
                if(target.tagName=="SPAN" || target.tagName=='SPAN'){
                    this.files.splice(idx,1)
                    let imgEl = target.previousElementSibling
                    this.$store.commit('sendImgMessage',{
                        fileUrl:imgEl.dataset.qiniu,
                        str:'delete'
                    })
                }
                if(target.tagName=='IMG'){
                    this.imgContainerArr = []
                    this.imgContainerArr = $('.previewImg img')
                    this.currentContainerImg = $(target)
                    $('.img-preview img').remove()
                    // console.log($('.previewImg img'))
                    let imgTag = `<img src="${target.src}" 
                        style="width:${target.naturalWidth}px;
                        height:${target.naturalHeight}px"/>`
                    $('.img-preview .imgpreview-container').append(imgTag)
                    $('.img-preview').css({
                        transform:'scale(1) translateX(-50%)'
                    })
                }
            },

            // 上传文件
            getFileCount(ev){
                if(window.$identyValidated==='2'){
                    this.identyValidated = '2'
                }
                if(this.identyValidated!='2' && this.authDeadlineDay<=0){
                    $('.authentication').css({
                        transform:'translateX(-50%) scale(1)'
                    })
                    $('input.file').val('')
                    return
                }
                let params = {
                    targetId:this.currentFriendName.targetId,
                    conversationType:this.currentFriendName.conversationType,
                }
                // input上传
                if(ev.target && ev.target.tagName==='INPUT'){
                    params.files = ev.target.files
                }
                // 拖拽上传
                if(ev.type==='drop'){
                    params.files = ev.dataTransfer.files
                }
                // 粘贴上传
                if(ev.type==='paste'){
                    params.files = ev.files
                }
                // 上传到七牛-->发送图片/文件消息
                let uploadObject = new Upload(params)
                uploadObject.uploadToQiniu()
                $('input.file').val('')
            },

            // 发送消息
            sendMessage(){
                if(window.$identyValidated==='2'){
                    this.identyValidated = '2'
                }
                if(this.identyValidated!='2' && this.authDeadlineDay<=0){
                    $('.authentication').css({
                        transform:'translateX(-50%) scale(1)'
                    })
                    return
                }
               
                let obj = this.currentFriendName
                obj._this = this
                let res = true
                let tipss = ''
                Common.judgeExit(obj,({exit, tips})=>{
                    res = exit
                    tipss = tips
                })
                if(!res){
                    $('.not-friend').show()
                    $('.not-friend .content').text(tipss)
                    return
                }
                if( (this.message=="" || /^[ ]+$/.test(this.message) || this.message.replace(/\n/g,'')=='') && this.imgContanier.length==0 ){
                    // $('.empty-message').show()
                    if($('.not-file-msg').css('display')==='block'){
                        return
                    }
                    $('.not-empty-msg').show()
                    $('.max-image-size').hide()
                    let timer = setTimeout(()=>{
                        $('.not-empty-msg').hide()
                        clearTimeout(timer)
                    },3000)
                    return
                }

                // 发送文字/表情消息
                if(this.message==""){
                    return
                }
                var type = this.currentFriendName.conversationType
                let arr = this.message.match(/@\S+\s/g)
                let resUUID = []
                // console.log(arr)
                if(arr){
                    resUUID = _.filter(this.currentGroup.baseInfo.members, 
                    _.conforms({ 'nickname': function(n) { 
                        if(arr.indexOf('@'+n+' ')>=0) 
                            return n 
                        } 
                    }))
                if(resUUID.length>0 || arr.indexOf('@所有人 ')>=0){
                    var conversationtype = RongIMLib.ConversationType.GROUP
                    // 目标 Id
                    var targetId = this.currentFriendName.targetId
                    // @ 消息对象
                    var mentioneds = new RongIMLib.MentionedInfo()
                    // 全部：RongIMLib.MentionedType.ALL；部分：RongIMLib.MentionedType.PART
                    if(arr.indexOf('@所有人 ')>=0){
                        mentioneds.type = RongIMLib.MentionedType.ALL
                        mentioneds.userIdList = _.map(this.currentGroup.baseInfo.members,'uuid')
                    }else{
                        mentioneds.type = RongIMLib.MentionedType.PART
                        mentioneds.userIdList = _.map(resUUID,'uuid')
                    }
                    // @ 的人
                    // mentioneds.userIdList = _.map(resUUID,'uuid')
                    var msg = new RongIMLib.TextMessage({content:RongIMLib.RongIMEmoji.symbolToEmoji(this.message),extra:"附加信息",mentionedInfo:mentioneds})
                    this.message = ''
                    RongIMClient.getInstance().sendMessage(conversationtype, targetId, msg, {
                                onSuccess: function (message) {

                                    //message 为发送的消息对象并且包含服务器返回的消息唯一Id和发送消息时间戳
                                    console.log("Send successfully")
                                    this.$store.commit('getSendedMessage',{
                                        list:message,
                                        str:'new'
                                    })
                                    let timer = setTimeout(()=>{
                                        $('#talkarea .right .middle').scrollTop($('#talkarea .right .middle')[0].scrollHeight)
                                        clearTimeout(timer)
                                    },100)
                                    let msg = {
                                        targetId:this.currentFriendName.targetId,
                                        content:{
                                            content:message.content.content
                                        },
                                        sentTime:new Date().getTime()
                                    }
                                    this.$store.commit('addUnreadCount',msg)
                                    this.message = ''
                                    
                                }.bind(this),
                                onError: function (errorCode,message) {
                                    var info = '';
                                    switch (errorCode) {
                                        case RongIMLib.ErrorCode.TIMEOUT:
                                            info = '超时';
                                            break;
                                        case RongIMLib.ErrorCode.UNKNOWN_ERROR:
                                            info = '未知错误';
                                            break;
                                        case RongIMLib.ErrorCode.REJECTED_BY_BLACKLIST:
                                            info = '在黑名单中，无法向对方发送消息';
                                            break;
                                        case RongIMLib.ErrorCode.NOT_IN_DISCUSSION:
                                            info = '不在讨论组中';
                                            break;
                                        case RongIMLib.ErrorCode.NOT_IN_GROUP:
                                            info = '不在群组中';
                                            break;
                                        case RongIMLib.ErrorCode.NOT_IN_CHATROOM:
                                            info = '不在聊天室中';
                                            break;
                                        default :
                                            info = x;
                                            break;
                                    }
                                    // console.log('发送失败:' + info);
                                }
                            },true)
                        return
                    }
                }
                window.setTimeout(()=>{
                    let msg = {
                        targetId:this.currentFriendName.targetId,
                        content:{
                            content:this.message
                        },
                        sentTime:new Date().getTime()
                    }
                    this.$store.commit('addUnreadCount',msg)
                    this.message = ''
                },0)
                sendMessage(type,RongIMLib.RongIMEmoji.symbolToEmoji(this.message),this.currentFriendName.targetId,(message)=>{
                    if(typeof message == 'string'){
                        return
                    }
                    this.$store.commit('getSendedMessage',{
                        list:message,
                        str:'new'
                    })
                    DOMController.scrollToBottom({toBottom:true,_this:this})
                })
            },
           
            // 右键菜单
            handleMsg(ev,msg){
                return
                this.handlestatus = true
                this.$refs.handlemenu.$el.style.top = ev.clientY + 'px'
                this.$refs.handlemenu.$el.style.left = ev.clientX + 'px'
                // 删除消息
                this.handleMessage = msg
            },
            // 获取当前会话历史消息
            getConHisMsg(){
                let msgArr = []
                let uuid = this.currentFriendName.targetId;
                (function getData(){
                    getHistoryMessages(uuid,function(listMsg){
                        msgArr.push(listMsg)
                    }.bind(this),null)
                })()
            },
            // 显示 emoji 表情
            showEmojiList(ev){
                if(ev.target.classList.contains('smileface')){
                    if(ev.type == "mousemove"){
                        if(this.$refs.emojilist.innerHTML===''){
                            new Emoji({_this:this})
                        }
                        this.emojiListstatus = true
                    }else{
                        this.emojiListstatus = false
                    }
                }else{
                    this.emojiListstatus = true
                    if(ev.type=='mouseout'){
                        this.emojiListstatus = false
                    }
                }
            },
            // 拉取未读消息
            getUnreadMsg(str){
                if(str=='top'){
                    $('#talkarea .right .middle').scrollTop(0)
                }
                if(str=='bottom'){
                    this.$store.commit('getAppLatestMsg',null)
                    DOMController.scrollToBottom({toBottom:true,_this:this})
                }
            },
            // 播放声音
            play(ev,val,time,str){
                if(str==='img'){
                    return
                }
                if(str==='i'){
                    $('span.voice').find('img').hide()
                    $('span.voice').find('i').show()
                    $(ev.target).hide()
                    $(ev.target).next().show()
                    if(window.$voiceFile){
                        RongIMLib.RongIMVoice.stop(window.$voiceFile)
                    }else{
                        window.$voiceFile = val
                    }
                    playVoice(val)
                    let timer = window.setTimeout(()=>{
                        $(ev.target).show()
                        $(ev.target).next().hide()
                        clearTimeout(timer)
                        window.$voiceFile = ''
                    },time*1000)
                }
                
                if(str==='span' && (($(ev.target).find('img').css('display'))==='none')){
                    $(ev.target).find('i').hide()
                    $(ev.target).find('img').show()
                    if(window.$voiceFile){
                        RongIMLib.RongIMVoice.stop(window.$voiceFile)
                    }else{
                        window.$voiceFile = val
                    }
                    playVoice(val)
                    let timer = window.setTimeout(()=>{
                        $(ev.target).find('i').show()
                        $(ev.target).find('img').hide()
                        clearTimeout(timer)
                        window.$voiceFile = ''
                    },time*1000)
                }
            },
            // 屏幕截图
            screenshot(ev){
                ipcRenderer.send('capture-screen')
            },
           
            // 放大消息图片
            zoomImg(ev, item){
                // console.log($)
                // $('[data-magnify=gallery]').magnify({
                //     draggable:true,
                //     resizable:true,
                //     movable:true
                // })
                return
                this.imgContainerArr = []
                this.imgContainerArr = $('.container img.msgImg')
                this.currentContainerImg = $(ev.target)
                $('.img-preview img').remove()
                let imgTag = `<img src="${item.content.imageUri}" 
                    style="width:${ev.target.naturalWidth}px;
                    height:${ev.target.naturalHeight}px;"/>`
                $('.img-preview .imgpreview-container').append(imgTag)
                $('.img-preview').css({
                    transform:'scale(1) translateX(-50%)'
                })
            },
            // 播放图片
            playImg(str){
                for(let i=0;i<this.imgContainerArr.length;i++){
                    if(this.imgContainerArr[i].src==this.currentContainerImg[0].src){
                        this.currentImgIdx = i
                        break
                    }
                }
                if(str=='next' && (this.currentImgIdx<this.imgContainerArr.length-1)){
                    this.currentImgIdx ++
                    let idx = this.currentImgIdx
                    let imgUrl = this.imgContainerArr[idx].src
                    $('.img-preview img').remove()
                    let imgTag = `<img src="${imgUrl}" 
                        style="width:${this.imgContainerArr[idx].naturalWidth}px;
                        height:${this.imgContainerArr[idx].naturalHeight}px;"/>`
                    $('.img-preview .imgpreview-container').append(imgTag)
                     this.currentContainerImg = $(this.imgContainerArr[idx])
                }
                if(str=='pre' && this.currentImgIdx>0){
                    this.currentImgIdx --
                    let idx = this.currentImgIdx
                    let imgUrl = this.imgContainerArr[idx].src
                    $('.img-preview img').remove()
                    let imgTag = `<img src="${imgUrl}" 
                        style="width:${this.imgContainerArr[idx].naturalWidth}px;
                        height:${this.imgContainerArr[idx].naturalHeight}px;"/>`
                    $('.img-preview .imgpreview-container').append(imgTag)
                     this.currentContainerImg = $(this.imgContainerArr[idx])
                }
            },
            // 下载文件到本地
            downloadFile(url,name){
                let a = document.createElement('a')
                let event = new MouseEvent('click')
                a.download = name
                a.href = 'http://jhmcimg.weinongtech.com/' + url
                a.dispatchEvent(event)
            },
            // 下载图片到本地
            downloadImg(){
                let url = this.currentContainerImg[0].src
                let a = document.createElement('a')
                // console.log(url)
                let event = new MouseEvent('click')
                a.download = name 
                a.href = url
                a.dispatchEvent(event)
            },
            // 关闭图片预览容器
            closeImgPreview(){
                $('.img-preview').css({
                    transform:'scale(0) translateX(-50%)'
                })
            },
            // 显示好友信息
            showUserInfo(ev, item, str){
                // console.log(this.userData.data)
                if(ev.target==undefined){
                    return
                }
                if(str=='@'){
                    if(ev.target.tagName!='SPAN' && ev.target.tagName!='IMG'){
                        return
                    }
                    if(ev.target.tagName=='SPAN' && ev.target.classList.contains('nickname-avatar')==false){
                        return
                    }
                    if(ev.target.tagName=='IMG' && ev.target.classList.contains('msgImg')){
                        return
                    }
                    // if(!(ev.target.classList.contains('nickname-avatar') || ev.target.classList.contains('msgImg'))){
                    //     return
                    // }
                    if(item.senderUserId!=this.userData.data.uuid && this.currentFriendName.conversationType=='GROUP'){
                            this.axios.get(this.ajaxUrl + '/v1/search_friends',{
                            params:{
                                token:sessionStorage.usertoken,
                                to_user:item.senderUserId
                            }
                        }).then(res=>{
                            if(res.data.status=='1'){
                                $('.handle-msg-menu').hide()
                                this.message += str + res.data.data.nickname + ' '
                                $('.bottom textarea').focus()
                            }
                        })
                    }
                    return
                }
                let params = {
                    el:$('.user-info'),
                    clientX:ev.clientX,
                    clientY:ev.clientY
                }
                if((window.innerHeight-ev.clientY)<240){
                    params.clientY = ev.clientY-200
                }
                if((window.innerWidth-ev.clientX)<200){
                    params.clientX = ev.clientX - 300
                }
                // DOMController.userInfoPosition(params)
                if(ev.target.tagName=='SPAN' && ev.target.classList.contains('nickname-avatar')){
                    let obj = {
                        uuid:item.senderUserId
                    }
                    this.showFriendInfo(ev,obj)
                    DOMController.userInfoPosition(params)

                }
                if(ev.target.tagName=='IMG' && !ev.target.classList.contains('msgImg')){
                    let obj = {
                        uuid:item.senderUserId
                    }
                    this.showFriendInfo(ev,obj)
                    DOMController.userInfoPosition(params)
                }
            },
            // 删除好友
            deleteFriend(){
                // console.log(this.currentFriendName)
                this.axios.delete(this.ajaxUrl + '/v1/friends/1',{
                    params:{
                        token:sessionStorage.usertoken,
                        to_user:this.currentFriendName.uuid || this.currentFriendName.targetId
                    }
                }).then(res=>{
                    this.$store.commit('deleteFriend',this.currentFriendName)
                    $('.delete-friend').hide()
                    $('.init').show()
                    this.$store.commit('changeCurrentFriendName', {})
                })
            },
            // 窗口相关操作
            handleFrame(str){
                if(str=='max'){
                    this.maxStatus = !this.maxStatus
                    if(this.maxStatus==false){
                        str = 'max-false'
                    }else{
                        str = 'max-true'
                    }
                }
                if(str=='close'){
                    this.$store.commit('changeCurrentFriendName',{})
                    $('.init').show()
                }
                ipcRenderer.send('handle-frame',str)
                if(str=='settop'){
                    this.isAlwaysTop = !this.isAlwaysTop
                }
                
            }
        },
        components:{
            'handle-menu':handleMenu,
            'msg-component':MsgComponent,
            'user-portrait':UserPortrait
        },
        updated(){
            $('[data-magnify=gallery]').magnify({
                draggable:true,
                resizable:true,
                movable:true,
                zIndex:5000,
                multiInstances:false,
                headToolbar:['maximize'],
                footToolbar:[ 
                    'zoomIn', 
                    'zoomOut', 
                    'prev', 
                    'fullscreen', 
                    'next', 
                    'actualSize', 
                    'rotateRight' 
                    ]
            })
            $("[data-magnify=gallery]").magnify({
                callbacks: {
                    beforeOpen: function(el){

                    },
                    opened: function(el){
                        $('.close-all-msgbox').show()
                        if(!el[0].classList.contains('msgImg')){
                            $('.magnify-modal button.magnify-button-prev').hide()
                            $('.magnify-modal button.magnify-button-next').hide()
                            this.$store.commit('changeUserInfoStatus','hide')
                        }
                        $('.magnify-modal').css({
                            background:'#fff',
                            appRegion:'no-drag'
                        })
                        $('.magnify-modal i').css({
                            fontSize:'16px',
                            color:'#000'
                        })
                        $('.magnify-modal i.icon-icon--1').css({
                            fontSize:'18px',
                            color:'#000'
                        })
                        $('.magnify-modal i.icon-fanhuishangyizhang').css({
                            fontSize:'14px',
                            color:'#000'
                        })
                        $('.magnify-modal i.icon-xiayizhang').css({
                            fontSize:'14px',
                            color:'#000'
                        })
                        $('.magnify-modal i.icon-xiazai1').bind('click',function(){
                            let a = document.createElement('a')
                            let event = new MouseEvent('click')
                            a.download = name
                            a.href = el[0].src
                            a.dispatchEvent(event)
                        })
                    }.bind(this),
                    beforeClose: function(el){
                    // Will fire before modal is closed
                    },
                    closed: function(el){
                        $('.close-all-msgbox').hide()
                    // Will fire after modal is closed
                    },
                    beforeChange: function(index){
                    // Will fire before image is changed
                    // if($('.magnify-modal img')[0].currentSrc==this.userData.data.avatar){
                    //         console.log('touxiang')
                    //     }
                    // The arguments is the index of image group
                    }.bind(this),
                    changed: function(index){
                        // console.log($('.magnify-modal img'))
                        // if($('.magnify-modal img')[0].currentSrc==this.userData.data.avatar){
                        //     console.log()
                        // }
                        // console.log(index)
                    // Will fire after image is changed
                    // The arguments is the index of image group
                    }
                }
                });
        },
        watch:{
            message(val,oldval){
                if(val.charAt(val.length-1)=='@'){
                    $('.group-member-list').show()
                }
            },
            sendedMessage(val,oldval){
                if(val==undefined){
                    return
                }
                if(val.length>0){
                    syncMessageStatus({
                        message:val[val.length-1],
                        conversation:{
                            conversationType:this.currentFriendName.conversationType,
                            targetId:this.currentFriendName.targetId
                        }
                    })
                    if(this.currentFriendName.conversationType=='PRIVATE'){
                        lastReadMessage.select_one({senderUserId:this.currentFriendName.targetId},doc=>{
                            if(doc.rows.length>0){
                                this.$store.commit('getSyncMessageStatus',{list:doc.rows[0]})
                            }
                        })
                    }
                    if(this.currentFriendName.conversationType=='GROUP'){
                        if(val[val.length-1].senderUserId==this.userData.data.uuid){
                            this.$store.commit('getConversationList',{
                                handle:'latest',
                                list:{
                                    targetId:this.currentFriendName.targetId,
                                    nickname:''
                                }
                            })
                        }
                    }
                    let obj = {}
                    for(let item of val){
                        message.select_one_msg({
                            messageUId:item.messageUId
                        },res=>{
                            if(res.rows.length==0){
                                this.axios.get(this.ajaxUrl + '/v1/search_friends',{
                                    params:{
                                        token:sessionStorage.usertoken,
                                        to_user:item.senderUserId
                                    }
                                }).then(res=>{
                                    if(res.data.status=='1'){
                                        obj.avatar = res.data.data.avatar
                                        obj.nickname = res.data.data.nickname
                                        obj.remark_name = res.data.data.remark_name
                                        obj.messageUId = item.messageUId
                                        obj.senderUserId = item.senderUserId
                                        obj.is_delete = false
                                        obj.targetId = item.targetId
                                        message.insert_msg(obj,function(msg){
                                            // console.log(msg)
                                        })
                                    }
                                })
                            }
                        })
                    }
                }
            },
            conversationList(val,oldval){
                this.isChange = true
            },
            currentFriendName(val, oldval){
                this.groupMemberInfo = {}
                this.message = ''
                let spans = $('.previewImg span')
                for(let i=0;i<spans.length;i++){
                    this.deleteImg(i,spans[i])
                }
                this.files = []
            }
        },
        mounted(){
            // 窗口置顶
            ipcRenderer.on('set-top-main',(ev,str)=>{
                if(str=='1'){
                    this.isAlwaysTop = true
                }else{
                    this.isAlwaysTop = false
                }
            })
            // 屏幕截图
            ipcRenderer.on('capture-screen-main',()=>{
                this.screenshot()
            })
            // 获取用户剩余认证天数
            this.axios(this.ajaxUrl + '/user/query',{
                params:{
                    token:sessionStorage.usertoken,
                    uuid:this.userData.data.uuid
                }
            }).then(res=>{
                if(res.data.status=='1'){
                    this.authDeadlineDay = res.data.data.auth_deadline_day
                    this.identyValidated = res.data.data.identy_validated
                    // 认证倒计时
                    let createTime = new Date(this.userData.data.create_time).getTime()
                    let deatTime = createTime + 10*24*60*60*1000
                    if(deatTime < new Date().getTime()){
                        $('.auth-dead-time').hide()
                        return
                    }
                    window.pageTimer = {} ; //定义计算器全局变量
                    window.pageTimer["timer"] = window.setInterval(function(){
                        // console.log('index')
                        let countDown = deatTime - new Date().getTime()
                        let days = Math.floor(countDown/(24*60*60*1000))
                        let lasthour = countDown%(24*60*60*1000)
                        let hours = Math.floor(lasthour/(60*60*1000))
                        let lastminute = lasthour%(60*60*1000)
                        let minutes = Math.floor(lastminute/(60*1000))
                        let lastSeconds = lastminute%(60*1000)
                        let seconds = Math.floor(lastSeconds/1000)
                        let html = `<i style="position:relative;top:1px;padding:0 4px;border-top-left-radius:5px;font-weight:600;border-bottom-left-radius:5px;line-height:27px;background:#fff;color:#ff5a5a;font-size:18px;font-style:normal;border:1px solid #4A4A4A;display:inline-block;">
                            ${days}</i>天
                            <i style="position:relative;top:1px;padding:0 4px;font-weight:600;line-height:27px;background:#fff;color:#ff5a5a;font-size:18px;font-style:normal;border:1px solid #4A4A4A;display:inline-block;">${hours}</i>时
                            <i style="position:relative;top:1px;padding:0 4px;font-weight:600;line-height:27px;background:#fff;color:#ff5a5a;font-size:18px;font-style:normal;border:1px solid #4A4A4A;display:inline-block;">${minutes}</i>分
                            <i style="position:relative;top:1px;padding:0 4px;font-weight:600;line-height:27px;background:#fff;color:#ff5a5a;font-size:18px;font-style:normal;border:1px solid #4A4A4A;display:inline-block;">${seconds}</i>秒`
                        $('.auth-dead-time .time').html(html)
                    },1000)
                }
            })
            $('.init').show()
            // 隐藏右键菜单
            document.addEventListener('click',()=>{
                this.handlestatus = false
            })
            // 初始化emoji表情
            new Emoji({_this:this})
            
            // 滚动加载消息
            loadingmore(this.$refs.middle,function(str){
                if(this.hasMsg && str==='top'){
                    getHistoryMessages(this.currentFriendName.targetId,
                        function(listMsg, hasMsg){
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
                                    str:'push-history'
                                })
                            })
                            this.$store.commit('hasMessage',hasMsg)
                            this.$refs.middle.scrollTop = 200
                        }.bind(this),
                        null,
                        this.currentFriendName.conversationType
                    )
                }
                if(str==='bottom'){
                    this.$store.commit('getAppLatestMsg',null)
                }
            }.bind(this))

            // 文件拖放
            document.addEventListener("dragenter", function(e){
                e.stopPropagation()
                e.preventDefault()
            }, false)
                       
            document.addEventListener("dragover", function(e){
                e.stopPropagation()
                e.preventDefault()
            }, false)

            document.addEventListener("dragleave", function(e){
                e.stopPropagation()
                e.preventDefault()
            }, false)
                       
            document.ondrop = e =>{
                e.stopPropagation()
                e.preventDefault()
                var files = e.dataTransfer.files
                if(files.length == 0) {
                    commons.alert("请选择文件！", "warning");
                }else{
                    if(e.target.tagName=='TEXTAREA'){
                        this.getFileCount(e)
                    }else{
                        return
                    }
                    files = null
                }
            }
            $('#talkarea .middle')[0].addEventListener('scroll',function(){
                // console.log(888)
                $('.handle-msg-menu').hide()
            })
        },
        store
    }
</script>
<style lang="scss" scoped>
    @import '../style/common.scss';
    @keyframes loading {
        from{
            transform:rotate(odeg) scale(1);
        }
        to{
           transform:rotate(360deg) scale(1.5);
        }
    }
    @keyframes playvoice {
        from{
            transform: scale(1);
        }
        to{
            transform: scale(1.5);
        }
    }
    #talkarea{
       height:100%;width:100%;
       display:flex;
       .handle-msg-menu{
           z-index:20000;background:#fff;
           border:1px solid #ddd;border-radius:4px;
           display:none;position:absolute;
        //    box-shadow:$div_shadow;
           .el-button{
               padding:5px 15px;display:block;
               border:0 none;color:#333;border-radius:0 none;
               font-size:14px;text-align:center;margin:0;
               &:hover{
                   background:#EEEFF2;
               }
           }
       }
    //    .img-preview::-webkit-scrollbar {/*滚动条整体样式*/
    //         width: 1px;
    //         height: 1px;
    //     }
    //     .img-preview::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
    //         border-radius: 10px;max-height:30px;
    //         background: #fff;
    //     }
    //     .img-preview::-webkit-scrollbar-track {/*滚动条里面轨道*/
    //         border-radius: 10px;
    //         background: #fff;
    //     }
    //     .img-preview:hover::-webkit-scrollbar-thumb{
    //         background:#ddd;
    //     }
       .img-preview{
            box-shadow:0 0 3px 1px rgba(0,0,0,0.3);
            text-align:center;
            background:#fff;
            position:absolute;
            border-top:1px solid #d8d8d8;
            left:50%;top:60px;
            transform: scale(0) translateX(-50%);
            min-height:200px;min-width:200px;
            max-height:86%;
            max-width:90%;
            z-index:10000;
            // overflow-y:auto;
            p.title{
                @include title_style;cursor:move;background:#fff;
                // border-bottom:1px solid #ccc;
            }
            .imgpreview-container{
               text-align:Center;
               width:auto;
               height:auto;
               max-height:400px;
               min-height:100px;
            //    vertical-align:bottom;
            //    line-height:200px;
               font-size:0px;
               overflow-y:auto;overflow-x:auto;
            //    position:relative;top:50%;transform:translateY(-50%);
           }
            .imgpreview-container::-webkit-scrollbar {/*滚动条整体样式*/
                width: 1px;
                height: 1px;
            }
            .imgpreview-container::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
                border-radius: 10px;max-height:30px;
                background: #fff;
            }
            .imgpreview-container::-webkit-scrollbar-track {/*滚动条里面轨道*/
                border-radius: 10px;
                background: #fff;
            }
            .imgpreview-container:hover::-webkit-scrollbar-thumb{
                background:#ddd;
            }
           .close{
                // background:#ccc;
                @include close_button;line-height:28px;
           }
           span.iconfont:not(.close){
               position:absolute;display:block;text-align:center;
               height:30px;width:30px;line-height:30px;
               border-radius:50%;cursor:pointer;display:none;
              
           }
           span.next{
               right:10px;top:50%;transform:translateY(-50%);
               background:rgba(0,0,0,0.5);color:#fff;
               opacity:0;
           }
           span.pre{
               left:10px;top:50%;transform:translateY(-50%);
               background:rgba(0,0,0,0.5);color:#fff;
               opacity:0;
           }
           &:hover{
               span.iconfont:not(.close){
                   display:block;
               }
           }
           span.download{
               bottom:10px;background:#ddd;
               left:50%;transform:translateX(-50%);
           }
       }
        .left{
            width:310px;height:100%;
        }
        .right{
            flex:1;display:flex;flex-direction:column;position:relative;
            background:#FFFFFF;
            border-bottom:$border_style;
            // border-right:1px solid #ddd;
            
            .init{
                width:100%;height:100%;background:#fff;
                border:1px solid #ccc;
                border-bottom:0 none;
                position:absolute;box-sizing:border-box;
                border-left:0 none;
                z-index:4999;text-align:center;
                img{
                    position:relative;top:40%;transform:translateY(-50%);
                    width:160px;
                }
                p{
                    position:absolute;top:63%;color:$min_font_color;font-size:14px;
                    text-align:Center;width:100%;
                }
            }
            .init-blank,.show-group-info{
                width:100%;height:100%;
                position:absolute;display:none;
                border:1px solid #ccc;border-bottom:0 none;
                border-left:0 none;box-sizing:border-box;
            }
            .show-group-info{
                transform:scale(0);
                z-index:5000;
                background:#fff;display:flex;
                flex-direction:column;
                ul{
                    flex:1;
                    margin:0;padding:10px;
                    li{
                        margin:0;list-style:none;padding:10px;
                        width:64px;float:left;box-sizing:border-box;
                        height:85px;
                        .nickname{
                            font-size:12px;display:inline-block;
                            @include text_ellipse;width:44px;
                            text-align:center;color:#ccc;
                        }
                    }
                }
                p.title{
                    @include title_style;border:0 none;background:#fff;
                    padding-top:30px;
                    span:nth-child(1){
                        float:left;margin-left:20px;max-width:300px;
                        @include text_ellipse;
                    }
                    span:nth-child(2){
                        float:left;margin-left:10px;
                    }
                }
                .btn{
                    height:100px;position:relative;
                    .el-button{
                        @include btn_success;position:absolute;left:50%;transform:translateX(-50%);
                        top:20px;
                    }
                }
            }
            .top{
                height:59px;position:relative;
                -webkit-app-region:drag;
                border:1px solid #ccc;border-bottom:1px solid rgb(216,216,216);
                border-left:0 none;
                span.firendname{
                    max-width:300px;display:inline-block;
                    overflow:hidden;font-weight:500;font-size:16px;
                    @include text_ellipse;
                }
                p{
                    position:absolute;z-index:10000;
                    height:26px;width:100%;
                    span{
                        float:right;display:inline-block;
                        height:100%;width:36px;line-height:26px;
                        color:#676767;font-size:12px;cursor:pointer;
                        text-align:Center;-webkit-app-region:no-drag;
                        // position:absolute;
                        &:hover{
                            background:#ccc;
                        }
                    }
                    span:first-child{
                        margin-top:2px;
                    }
                    span:first-child{
                        &:hover{
                            background:#F45454;color:#fff;
                            margin-right:-1px;width:37px;margin-top:-1px;
                            height:26px;line-height:30px;
                        }
                    }
                    .isTop{
                        background:#ccc;
                    }
                }
                .sending{
                    position:absolute;left:50%;transform:translateX(-50%);
                    color:#ccc;
                }
                >span{
                    line-height:60px;display:block;padding:0 10px;font-size:18px;
                    -webkit-app-region:no-drag;

                }
                .firendname{
                    float:left;
                    -webkit-app-region:no-drag;
                }
                .person{
                    float:right;cursor:pointer;
                    color:#4D4D4D;font-size:16px;
                    margin-top:15px;
                }
            }
            .middle::-webkit-scrollbar {/*滚动条整体样式*/
                width: 5px;
                height: 5px;
            }
            .middle::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
                border-radius: 10px;max-height:30px;
                // background: #ddd;
                background:#fff;
                opacity:0;
            }
            .middle::-webkit-scrollbar-track {/*滚动条里面轨道*/
                border-radius: 10px;
                background:#fff;;
            }
            .middle:hover::-webkit-scrollbar-thumb{
                background:#ddd;
            }
            .middle{
                overflow-y:auto;position:relative;
                overflow-x:hidden;
                border-right:1px solid #ccc;
                flex:1;
                position:relative;
                .auth-dead-time{
                    position:fixed;z-index:1999;top:60px;font-size:12px;
                    background:#F5F5F5;height:47px;
                    color:#4A4A4A;width:100%;padding-left:322px;right:1px;
                    box-sizing:border-box;
                    span.time{
                        background:#4A4A4A;color:#fff;
                        padding:5px 0px;border-radius:5px;font-size:14px;
                        padding-right:4px;
                    }
                    span.notice{
                        cursor:pointer;line-height:46px;position:relative;top:8px;
                        &:hover::after{
                            content:'请在指定的时间内进行实人认证，聊天会受到限制';
                            display:block;position:absolute;top:19px;left:-170px;
                            width:270px;font-size:12px;background:rgba(57,57,57,0.8289);
                            padding:5px 10px;height:26px;line-height:26px;
                            color:#fff;border-radius:5px;font-weight:400;
                        }
                        &:hover>span.triangle{
                            display:block;
                        }
                    }
                    span.triangle{
                        position:absolute;top:-7px;transform:rotate(-90deg);left:9px;
                        display:none;color:rgba(57,57,57,0.8289) !important;
                    }
                    span.icon-guanbi{
                        float:right;margin-right:10px;line-height:47px;
                        cursor:pointer;
                    }

                }
                .auth-deadline,{
                    position:fixed;z-index:1999;top:60px;
                    font-size:12px;background:#FFF3B5;overflow: hidden;
                    height:30px;width:100%;padding-left:322px;
                    right:1px;
                    color:#FF5A5A;line-height:30px;box-sizing:border-box;
                }
                span.close{
                    cursor:pointer;color:#333;display:none;
                    position:fixed;z-index:1999;top:67px;right:10px;
                }
                .toBottom{
                    position:fixed;right:0px;z-index:1999;
                    font-size:12px;background:rgba(139,139,139,0.7);padding:4px;
                    color:#fff;cursor: pointer;border-top-left-radius:10px;
                    border-bottom-left-radius:10px;

                    // display:none;
                }
                .loading{
                    width:100%;height:100%;overflow:hidden;
                    text-align:center;position:absolute;background:#ddd;
                    z-index:3000;
                    p{
                        margin:auto;position:relative;top:40%;
                    }
                    span{
                        display:inline-block;
                        animation:loading 0.72s infinite linear;
                    }
                }
                .currentloading{
                    width:100%;height:40px;line-height:40px;text-align:center;
                    position:absolute;top:60px;background:#ddd;z-index:3000;
                    display:none;
                    span{
                        display:inline-block;
                        animation:loading 0.72s infinite linear;
                    }
                }
                .conversation{
                    width:100%;min-height:30px;padding:10px 0;
                    div.location{
                        height:100px;width:100px;
                        // float:left;
                    }
                    .container-special-message{
                        width:100%;text-align:Center;
                        span{
                            font-size:12px;display:inline-block;max-width:90%;
                            color:#fff;background:#ddd;padding:4px 10px;
                            border-radius:5px;margin:auto;@include word_break;
                        }
                    }
                    p.file-message{
                        border:1px solid #ccc;font-size:14px;
                        // width:200px;
                        padding:10px;border-radius:5px;
                        position:relative;
                        span.iconfont{
                            color:#ccc;
                        }
                    }
                }
                
                .user{
                    span.content{
                        display:inline-block;background:#EBEBEB;
                        position:relative;padding:8px 10px;border-radius:5px;
                        word-break:break-all; max-width:310px;cursor:pointer;
                        font-size:14px;color:#555;text-align:left;
                        // height:24px;line-height:24px;
                    }
                    i:not(.voice){
                        position:absolute;color:#EBEBEB;top:16px;
                        transform:rotate(180deg);
                        // width:20px;
                        // display:none;
                    }
                    i.friendcontent{
                        left:45px;
                    }
                    i.voice{
                        display:inline-block;
                    }
                    i.usercontent{
                        color:#d8e6f7;transform:rotate(0deg);
                        right:45px;
                    }
                    i.timetriangle{
                        top:53px !important;
                    }
                    span.usercontent{
                        background:$to_message_color;text-align:left;
                        padding:8px 10px;border-radius:5px;
                    }
                    img:not(.msgImg){
                        width:36px;height:36px;border-radius:50%;
                        cursor:pointer;
                    }
                    .msgImg{
                        max-width: 202px;
                        max-height: 100px;
                        width: auto;
                        height: auto;
                        border-radius:5px;
                        border:1px solid rgba(155, 145, 145,0.1);
                        // min-width: 100px;
                        cursor:pointer;
                    }
                    .time{
                        float:right;font-size:12px;
                        color:$min_font_color;
                        // opacity:0;
                        display:none;
                    }
                }
                .fromMe,.fromFriend{
                    p.location{
                        width:190px;border:1px solid rgba(155, 145, 145,0.1);
                        border-bottom:0 none;font-size:14px;
                        padding:4px;background:#fff;
                        // border-top-left-radius:10px;
                        cursor:pointer;
                        // border-top-right-radius:10px;
                        // margin-bottom:30px;
                    }
                    div.content{
                        // margin-top:30px;
                        height:147px;width:200px;
                        position:relative;padding-left:10px;
                        >div{
                            height:100px;width:200px;
                        }
                        img{
                            border:1px solid rgba(155, 145, 145,0.1);  
                            border-top:0 none;
                        }
                    }
                    
                }
                div.fromFriend{
                    text-align:left;position:relative;
                    p.location{
                        margin-left:56px;
                    }
                    div.content{
                        left:50px;
                        height:100px;
                    }
                    div.content+span.nickname-avatar,div.content+img{
                        position:absolute;top:10px;
                    }
                    img:not(.msgImg){
                        float:left;margin:0 10px;
                    }
                    .nickname-avatar{
                        @include nickname_avatar;float:left;margin:0 10px;
                        height:36px;width:36px;line-height:36px;
                        font-size:14px;cursor:pointer;color:#fff;
                    }
                }
                div.fromMe{
                    text-align:right;position:relative;
                    p.file-message{
                        // float:left;
                        // left:100px;
                    }
                    p.location{
                        margin-right:56px;float:right;
                        text-align:left;
                        // margin-bottom:30px;
                        // position:relative;right:50px;
                    }
                    div.content{
                        left:100%;top:47px;
                        transform:translateX(-252px);
                        
                    }
                    div.content+span.nickname-avatar,div.content+img{
                        position:absolute;top:10px;right:0px;
                    }
                    img:not(.msgImg){
                        float:right;margin:0 10px;
                    }
                    .nickname-avatar{
                        @include nickname_avatar;
                        float:right;cursor:pointer;
                        margin:0 10px;height:36px;width:36px;line-height:36px;
                        font-size:14px;color:#fff;
                    }
                    span.content{
                        background:#d8e6f7;
                    }
                }
            }
            .bottom{
                height:160px;border-top:1px solid #e2e2e2;
                width:100%;position:relative;background:#FFFFFF;
                border-right:1px solid #ddd;box-sizing:border-box;
                // border-bottom:$border_style;
                .group-member-list{
                    border:1px solid #ccc;width:160px;bottom:160px;
                    max-height:200px;position:absolute;display:none;
                    z-index:10000;background:#fff;border-left:0 none;
                    ul{
                        width:100%;max-height:200px;overflow-y:auto;
                        overflow-x:hidden;
                    }
                    ul::-webkit-scrollbar {/*滚动条整体样式*/
                        width: 5px;
                        height: 5px;
                    }
                    ul::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
                        border-radius: 10px;max-height:30px;
                        background:#fff;
                        opacity:0;
                    }
                    ul::-webkit-scrollbar-track {/*滚动条里面轨道*/
                        border-radius: 10px;
                        background:#fff;;
                    }
                    ul:hover::-webkit-scrollbar-thumb{
                        background:#ddd;
                    }
                    
                    li{
                        position:relative;width:160px;
                        list-style:none;height:50px;
                        cursor:pointer;
                        img{
                            width:30px;height:30px;float:left;
                            border-radius:50%;margin:10px;cursor:pointer;
                        }
                        .nickname-avatar{
                            @include nickname_avatar;font-size:15px;
                            height:30px;width:30px;line-height:30px;
                            margin:10px;cursor:pointer;
                        }
                        span.nickname{
                            display:inline-block;height:100%;margin:0px;
                            line-height:50px;margin-left:10px;
                            float:left;width:80px;font-size:12px;
                            @include text_ellipse;
                        }
                        &:hover{
                            background:$hover_bagcolor;
                        }
                    }
                }
                .previewImg{
                    position:absolute;z-index:2000;bottom:160px;left:40px;
                    display:none;
                    ul::-webkit-scrollbar {/*滚动条整体样式*/
                        width: 5px;
                        height: 5px;
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
                        background:#ddd;
                    }
                    ul{
                        margin:0;padding:0;list-style:none;background:#fff;
                        padding:10px;border:1px solid #ccc;height:220px;
                        overflow-y:auto;border-top-right-radius:10px;border-top-left-radius:10px;
                    }
                    li{
                        padding:10px 0px;position:relative;
                        span{
                            display:none;
                        }
                    }
                }
                .panel{
                    height:30px;position:relative;
                    input.file{
                        position:absolute;padding:2px;width:20px;
                        cursor:pointer;top:3px;left:0px;
                        font-size:0;padding:6px 3px;
                        // display:none;
                        opacity:0;
                        background:#ccc;
                        
                    }
                    span.printscreen{
                        padding-left:4px;font-size:16px;
                    }
                    span.smileface{
                       padding-left:10px;padding-top:5px;
                    }
                    span.file{
                        position:relative;padding-top:5px;
                        i{
                            position:absolute;color:#c80f1e;top:-5px;
                            font-style:normal;left:25px;font-size:12px;
                        }
                    }
                    >span{
                        line-height:30px;padding:0 6px;cursor:pointer;
                        display:inline-block;transition:all 0.3s;
                        &:hover{
                            transform:scale(1.2);
                            input{
                                display:block;
                            }
                        }
                    }
                    
                    .not-empty-msg,.not-file-msg,.max-image-size{
                        position:absolute;left:200px;color:#E6503F;
                        font-size:12px;display:none;
                        &:hover{
                            transform: scale(1);
                        }
                    }
                    .emojilist::-webkit-scrollbar {/*滚动条整体样式*/
                        width: 5px;
                        height: 1px;
                    }
                    .emojilist::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
                        border-radius: 10px;max-height:30px;
                        background: #fff;
                    }
                    .emojilist::-webkit-scrollbar-track {/*滚动条里面轨道*/
                        border-radius: 10px;
                        background: #fff;
                    }
                    .emojilist{
                        position:absolute;bottom:30px;background:#fff;
                        width:275px;overflow:auto;height:200px;border:1px solid #ddd;
                        border-left:0 none;padding:10px;border-top-right-radius:5px;
                    }
                    .emojilist:hover::-webkit-scrollbar-thumb{
                        background:#ddd;
                    }
                }
                textarea{
                    width:100%;border:0 none;
                    resize:none;
                    height:80px;font-size:14px;
                    outline:none;padding:10px;background:#FFFFFF;
                    padding-top:0px;padding-bottom:0px;
                    box-sizing:border-box;margin-top:5px;
                    // border-bottom:1px solid #ccc;
                }
                textarea::-webkit-scrollbar {/*滚动条整体样式*/
                    width: 5px;
                    height: 1px;
                }
                textarea::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
                    border-radius: 10px;max-height:30px;
                    background: #fff;
                }
                textarea::-webkit-scrollbar-track {/*滚动条里面轨道*/
                    border-radius: 10px;
                    background: #fff;
                }
                textarea:hover::-webkit-scrollbar-thumb{
                    background:#ddd;
                }
                .ctrl-notice{
                    position:absolute;bottom:14px;right:80px;font-size:14px;
                    color:#ccc;
                }
                .sendmsg{
                    position:absolute;bottom:10px;right:10px;padding:6px 15px;
                    border:1px solid #fff;font-size:12px;border-radius:6px;
                    cursor:pointer;background:#94AEEC;color:#fff;
                }
            }
        }
        /deep/ #contentmenu{
            position:absolute;z-index:2000;
            span{
                min-width:30px;padding:4px 2px;
            }
        }
        .empty-message,.delete-friend,.not-friend{
            @include message_box;top:50%;display:none;
            height:120px;width:200px;left:50%;transform:translate(-50%,-50%);
            p.title{
                @include title_style;
                span:first-child{
                    font-weight:600;
                }
                .close{
                    @include close_button;
                }
            }
            p:nth-child(2){
                text-align:center;margin-top:20px;
            }
            .el-button{
                @include confirm_button;
            }
        }
        .delete-friend{
            width:300px;
            p.content{
                font-size:14px;
            }
        }
    }
</style>

