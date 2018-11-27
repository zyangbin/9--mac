import md5 from 'blueimp-md5'
import Vue from 'vue'
export class DOMController{
    constructor(params){
        const { el } = params
    }
    // 好友信息的显示位置
    static userInfoPosition(params){
        // console.log('userinfo-position')
        let { innerHeight, innerWidth } = window
        let { clientX, clientY, el } = params
        if((innerHeight-clientY)<270){
            clientY = clientY -270
        }
        if(clientY<=60){
            clientY = 60
        }
        if((innerWidth-clientX)<280){
            clientX = clientX - 280
        }
        el.css({
            left:clientX + 'px',
            top:clientY + 'px'
        })
    }
    // 关闭/显示弹窗口
    static toggleMessageBox(el,str){
        if(str=='show'){
            el.css({
                transform:'scale(1)'
            })
        }
        if(str=='hide'){
            el.css({
                transform:'scale(0)'
            })
        }
    }
    // 计算头像背景颜色
    static portraitColor(userid){
        var colors = ["#e97ffb", "#00b8d4", "#82b2ff", "#f3db73", "#f0857c"];
		var i = 0;

	    if (!userid) {
	        return colors[0];
	    }else{

	    	var str = "wu" + userid + "ye";

	    	var mdstr = md5(str)[0];
	    	mdstr = mdstr ? mdstr : "";
	    	if(mdstr)
	    		i = mdstr.toUpperCase().charCodeAt() % 5;

	    }
	    return colors[i];
       
    }
    // 滚动到底部
    static scrollToBottom(params){
        let { toBottom, _this } = params
        function toBottomFn(){
            _this.$nextTick(()=>{
                $('#talkarea .right .middle').scrollTop($('#talkarea .right .middle')[0].scrollHeight)
                let timer = setTimeout(()=>{
                    $('#talkarea .right .middle').scrollTop($('#talkarea .right .middle')[0].scrollHeight)
                    clearTimeout(timer)
                    _this = null
                },300)
            })
        }
        if(toBottom){
            toBottomFn()
        }else{
            let offsetHeight = $('#talkarea .right .middle')[0].scrollHeight
            let clientHeight = $('#talkarea .right .middle').height()
            let scrollTop = $('#talkarea .right .middle').scrollTop()
            if(scrollTop<(offsetHeight-clientHeight)){
                if(params.message){
                    _this.$store.commit('getAppLatestMsg',{
                        atBottom:false,
                        message:params.message
                    })
                }
                _this = null
                offsetHeight = 0
                clientHeight = 0
                scrollTop = 0
                return
            }else{
                if(params.message){
                    _this.$store.commit('getAppLatestMsg',{
                        atBottom:true,
                        message:params.message
                    })
                }
                toBottomFn()
            }
        }
    }
}