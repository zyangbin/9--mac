let RongIMVoice = RongIMLib.RongIMVoice;
RongIMVoice.init()
export function playVoice(voice){
    if(voice){
        var duration = voice.length/1024;    // 音频持续大概时间(秒)
        RongIMVoice.preLoaded(voice, function(){
            RongIMVoice.play(voice,duration);
        });
    }else{
        console.error('请传入 amr 格式的 base64 音频文件');
    }
}