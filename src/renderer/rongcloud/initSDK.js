let networkStatus = {}
window.networkStatus = networkStatus
networkStatus.status = 'success'
export function initSDK(RongIMLib, params, callbacks, protobuf){	
	var appKey = params.appKey;
	var token = params.token;

	var RongIMClient = RongIMLib.RongIMClient;

	var config = {};

	//初始化
	var config = {};
	if(protobuf){
		config.protobuf = protobuf;
	}

	RongIMClient.init(appKey,null,config);

	
	// 连接状态监听器
	RongIMClient.setConnectionStatusListener({
		onChanged: function (status) {
		    switch (status) {
		        case RongIMLib.ConnectionStatus.CONNECTED:
					// console.log("链接成功")
					networkStatus.status = 'success'
		            break;
		        case RongIMLib.ConnectionStatus.CONNECTING:
		            // console.log('正在链接');
		            break;
		        case RongIMLib.ConnectionStatus.DISCONNECTED:
		            // console.log('断开连接');
		            break;
		        case RongIMLib.ConnectionStatus.KICKED_OFFLINE_BY_OTHER_CLIENT:
		            // console.log('其他设备登录');
		            break;
		          case RongIMLib.ConnectionStatus.DOMAIN_INCORRECT:
		            // console.log('域名不正确');
		            break;
				case RongIMLib.ConnectionStatus.NETWORK_UNAVAILABLE:
				    // console.log(networkStatus)
					// console.log('网络不可用')
					// let timer = window.setTimeout(()=>{

					// })
					networkStatus.status = 'faile'
					// 重新连接
					var callback = {
						onSuccess: function(userId) {
							console.log("Reconnect successfully." + userId)
							networkStatus.status = 'success'
						},
						onTokenIncorrect: function() {
							console.log('token无效')
						},
						onError:function(errorCode){
							console.log(errorcode)
						}
					}
					var config = {
						// 默认 false, true 启用自动重连，启用则为必选参数
						auto: true,
						// 重试频率 [100, 1000, 3000, 6000, 10000, 18000] 单位为毫秒，可选
						url: 'cdn.ronghub.com/RongIMLib-2.2.6.min.js',
						// 网络嗅探地址 [http(s)://]cdn.ronghub.com/RongIMLib-2.2.6.min.js 可选
						rate: [100, 1000, 3000, 6000, 10000]
					}
					RongIMClient.reconnect(callback, config)
					
		        	break
		        }
		}
	});

	/*
	文档：http://www.rongcloud.cn/docs/web.html#3、设置消息监听器

	注意事项：
		1：为了看到接收效果，需要另外一个用户向本用户发消息
		2：判断会话唯一性 ：conversationType + targetId
		3：显示消息在页面前，需要判断是否属于当前会话，避免消息错乱。
		4：消息体属性说明可参考：http://rongcloud.cn/docs/api/js/index.html
	*/
	RongIMClient.setOnReceiveMessageListener({
		// 接收到的消息
		onReceived: function (message) {
		    // 判断消息类型
			// console.log("新消息: " + message.targetId);
			callbacks.receiveNewMessage && callbacks.receiveNewMessage(message);
		}
	});

	//开始链接
	RongIMClient.connect(token, {
		onSuccess: function(userId) {
			callbacks.getCurrentUser && callbacks.getCurrentUser({userId:userId});
			// console.log("链接成功，用户id：" + userId);
		},
		onTokenIncorrect: function() {
			// console.log('token无效');
		},
		onError:function(errorCode){
			// console.log(errorCode);
		}
	})
}
 