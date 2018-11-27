import $ from 'jquery'
var config = {
    size: 24, // 大小, 默认 24, 建议18 - 58
    url: "http://f2e.cn.ronghub.com/sdk/emoji-48.png", // Emoji 背景图片
    lang: "zh", // Emoji 对应名称语言, 默认 zh
  }
RongIMLib.RongIMEmoji.init(config)
var list = RongIMLib.RongIMEmoji.list
let positionArr = []
for(let item of list){
  let positionX = $(item.node).css('backgroundPosition').split('px')[0]
  positionArr.push(positionX)
}
export default {
  list,
  positionArr
}