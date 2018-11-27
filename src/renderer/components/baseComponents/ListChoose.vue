<template>
    <div id="list-choose">
        <div class="list-option">
            <el-input type="text" class="search" placeholder="搜索联系人" 
                size="mini" clearable=""
                prefix-icon="iconfont icon-shousuo">
            </el-input>
            <ul>
                <li v-for = "(item,idx) in listMembers" 
                    :key="idx"  :data-uuid="item.uuid"
                    :class="{letterFirst:idx==0 || (idx>0 && sortMail[idx].firstLetter!=sortMail[idx-1].firstLetter)}">
                    <p v-if=" idx==0 || (idx>0 && sortMail[idx].firstLetter!=sortMail[idx-1].firstLetter)"
                        class="letter-sort">
                        {{item.firstLetter}}
                    </p>
                    <img :src="item.avatar" alt=""  v-move v-if="item.avatar!=null" @click="showMemberInfo($event, item)">
                    <span v-if="item.avatar==null" class="nickname-avatar" 
                        :style="{background: portraitColor(item.uuid),float:'left'}" @click="showMemberInfo($event, item)">
                        {{item.remark_name ? item.remark_name[0] : item.nickname[0].toUpperCase()}}

                    </span>
                    <el-checkbox name="type" @change="isChoose($event,item)" v-model="isChooseArr[idx]"></el-checkbox>
                    <span class="nickname">{{item.remark_name || item.nickname}}</span>
                </li>
            </ul>
        </div>
        <div class="list-choosed">
            <p>
                {{ choosedArr.length>0 ? '已选择'+ choosedArr.length +'个联系人 ' : '请选择需要添加的联系人'}}
            </p>
            <!--
            <ul>
                <li v-for="item of choosedArr" :key="item.uuid">
                    <img :src="item.avatar" alt=""  v-move v-if="item.avatar!=null" @click="showMemberInfo($event, item)">
                    <span v-if="item.avatar==null" class="nickname-avatar" 
                        :style="{background: portraitColor(item.uuid),float:'left'}" @click="showMemberInfo($event, item)">
                        {{item.remark_name ? item.remark_name[0] : item.nickname[0].toUpperCase()}}

                    </span>
                    <span class="nickname">{{item.remark_name || item.nickname}}</span>
                    <span class="close iconfont icon-guanbi" @click="notChoose(item)">
                    </span>
                </li>
            </ul> -->
            <el-button class="confirm">确定</el-button>
            <el-button class="cancel">取消</el-button>
        </div>
    </div>
</template>
<script>
    import { DOMController } from '../../class/DOMController'
    export default {
        data(){
            return{
                choosedArr:[]
            }
        },
        props:['listMembers'],
        methods:{
            // 计算头像背景颜色
            portraitColor(uuid){
                return DOMController.portraitColor(uuid)
            },
            // 展示好友头像信息
            showMemberInfo
        }
    }
</script>
<style lang="scss" scoped>
    @import '../../style/common.scss';
    #list-choose{
        position:fixed;top:0px;left:-150%;
        width:539px;height:420px;background:#fff;
        box-shadow:0 0 3px 1px rgba(0,0,0,0.3);
        .list-option{
            position:absolute;height:400px;width:238px;
            background:#fff;border-right:$border_style;
            top:0px;left:0px;
            padding-top:20px;
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
                margin:0;padding:0 10px;
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
                        position:absolute;
                        padding-left:20px;
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
                    }
                    span.nickname{
                        display:inline-block;height:100%;margin:0px;
                        line-height:50px;margin-left:10px;
                        float:left;width:100px;font-size:12px;
                        @include text_ellipse;
                    }
                }
            }
            >.el-input{
                width:200px;margin-left:18px;margin-bottom:20px;
            }
        }
        .list-choosed{
            position:absolute;
            border-left:1px solid #ddd;
            left:238px;top:0px;
            width:300px;height:420px;
            p{
                padding:20px 0px 15px 20px;
                background:#fff;color:#333;
                font-size:14px;
            }
            .el-button{
                position:absolute;bottom:10px;
            }
            >.confirm{
                right:25px;@include btn_success;
            }
            >.cancel{
                right:95px;@include btn_default;
            }
        }
    }
</style>


