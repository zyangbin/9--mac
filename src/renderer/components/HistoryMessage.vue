<template>
    <div id="historymsg" ref="history" :style="{transform:scale}">
        <p class="close">
            <span class="close iconfont icon-guanbi" @click="closehispage"></span>
        </p>
        <div class="user">
            <img :src="$store.state.currentFriendName.imgurl" alt="">
            <span>{{$store.state.currentFriendName.targetName}}</span>
        </div>
        <form>
            <input type="text" placeholder="搜索">
            <i class="iconfont icon-sousuo"></i>
        </form>
        <hr>
        <div class="history">
            <p ref="list">
                <span class="iconfont icon-shouye-xiaoxi now" @click="changecontent($event)">全部</span>
                <span class="iconfont icon-icon--" @click="changecontent($event)">文件</span>
                <span class="iconfont icon-tupian" @click="changecontent($event)">图片与视频</span>
                <span class="iconfont icon-lianjie" @click="changecontent($event)">链接</span>
            </p>
            <ul>
                <li v-for= "(item,idx) in conversationlist" :key="idx">
                    <p class="userinfo">
                        <img :src="item.imgurl">
                        <span>{{item.userId}}</span>
                        <span>{{item.time}}</span>
                    </p>
                    <p class="content">
                        {{item.content}}
                    </p>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
    import store from '../store/store'
    export default {
        data(){
            return {
                currentcontent:'',
                conversationlist:[
                    {
                        userId:'刘德华',
                        content:'约吗',
                        imgurl:'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1534855391283&di=97b5f8f2b3a0603aa3ce517f64782cc3&imgtype=0&src=http%3A%2F%2Fimg.zybus.com%2Fuploads%2Fallimg%2F140610%2F1-140611145K8.jpg',
                        time:'2018-8-23'
                    },{
                        userId:'凤姐',
                        imgurl:'http://p.nanrenwo.net/uploads/allimg/170112/8450-1F112115438.png',
                        content:'不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班',
                        time:'2018-8-23'
                    },{
                        userId:'凤姐',
                        imgurl:'http://p.nanrenwo.net/uploads/allimg/170112/8450-1F112115438.png',
                        content:'不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班',
                        time:'2018-8-23'
                    },{
                        userId:'凤姐',
                        imgurl:'http://p.nanrenwo.net/uploads/allimg/170112/8450-1F112115438.png',
                        content:'不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班',
                        time:'2018-8-23'
                    },{
                        userId:'凤姐',
                        imgurl:'http://p.nanrenwo.net/uploads/allimg/170112/8450-1F112115438.png',
                        content:'不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班',
                        time:'2018-8-23'
                    },{
                        userId:'凤姐',
                        imgurl:'http://p.nanrenwo.net/uploads/allimg/170112/8450-1F112115438.png',
                        content:'不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班不约，我要上班',
                        time:'2018-8-23'
                    },{
                        userId:'刘德华',
                        content:'约吗',
                        imgurl:'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1534855391283&di=97b5f8f2b3a0603aa3ce517f64782cc3&imgtype=0&src=http%3A%2F%2Fimg.zybus.com%2Fuploads%2Fallimg%2F140610%2F1-140611145K8.jpg',
                        time:'2018-8-23'
                    },{
                        userId:'刘德华',
                        content:'约吗',
                        imgurl:'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1534855391283&di=97b5f8f2b3a0603aa3ce517f64782cc3&imgtype=0&src=http%3A%2F%2Fimg.zybus.com%2Fuploads%2Fallimg%2F140610%2F1-140611145K8.jpg',
                        time:'2018-8-23'
                    }
                ]
            }
        },
        props:['conversationId'],
        computed:{
            hisId(){
                return this.$store.state.conversationId
            },
            scale(){
                return this.hisId!='' ? 'scale(1)' : 'scale(0)'
            }
        },
        methods:{
            changecontent(ev){
                for(let item of this.$refs.list.children){
                    item.classList.remove('now')
                }
                ev.target.classList.add('now')
            },
            closehispage(){
                this.$store.commit('getHistoryMessage','')
            }
        },
        store
    }
</script>
<style lang="scss" scoped>
    #historymsg{
        width:500px;height:96%;border:1px solid #ccc;
        border-radius:10px;background:#fff;display:flex;
        flex-direction:column;box-shadow: 5px 5px 10px #888888;
        position:absolute;left:300px;top:0px;z-index:2000;
        transition:all 0.3s;transform:scale(0);
        p.close{
            padding:10px 0;
            span{
                padding:2px;background:#ccc;border-radius:50%;color:#c80f1e;
                cursor:pointer;margin-left:10px;font-size:12px;font-weight:500;
            }
        }
        .user{
            
            img{
                width:40px;height:40px;vertical-align:middle;
                margin-left:40px;border-radius:6px;
            }
            span{
                vertical-align:middle;margin-left:14px;
            }

        }
        form{
            width:100%;height:60px;
            text-align:center;line-height:60px;
            input{
                width:82%;border-radius:4px;padding:4px;
                border:1px solid #ccc;padding-left:30px;
                background:#ffd2d2;
            }
            i{
                position:absolute;
                left:7%;
            }
        }
        .history{
            flex:1;display:flex;flex-direction:column;
            >p{
                height:80px;display:flex;line-height:80px;border-bottom:1px solid #ccc;
                span{
                    flex:1;text-align:center;cursor:pointer;
                }
                .now{
                    color:#58bc58;
                }
            }
            ul{
                flex:1;overflow-y:auto;
                li{
                    .userinfo{
                        font-size:14px;color:#ccc;
                        img{
                            width:40px;height:40px;vertical-align:middle;
                            margin-left:40px;border-radius:6px;float:left;
                        }
                        span:nth-child(2){
                            margin-left:10px;
                        }
                        span:nth-child(3){
                            float:right;margin-right:10px;
                        }
                    }
                    list-style:none;border-bottom:1px solid #ccc;
                    padding:10px 0;
                    .content{
                        padding-left:88px;
                    }
                    
                }
            }
        }
        
    }
</style>

