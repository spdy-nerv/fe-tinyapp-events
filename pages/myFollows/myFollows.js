//myFollows .js
var { APIS } = require('../../const');
var user = require('../../libs/user');
var { request } = require('../../libs/request');
var { validate } = require('../../libs/validate');

Page({
  data: {
		footerConfig: { 
      pagePersonal: true
    },
  	isNoData:"",
  	list:[]
  	
  },
  onLoad: function () {
  	wx.showLoading({
	      mask: true,
	      title: '数据加载中'
	    });
	    user.login(this.onLoadData, this, false);
  },
  onLoadData: function(){
  	var that = this;
  	var params = {
  		sid: wx.getStorageSync('sid'),
  		offset:1,
			size:20
  	};
  	 request({
      url: APIS.MY_FOLLOWS,
      data: params,
      method: 'POST',
      realSuccess: function(data){
      	console.log("我的关注",data);
      	that.setData({
      		list:data.list
      	});
      	if(data.list.length==0){
      		that.setData({
	      		isNoData:"暂时没有关注任何事件！"
	      	});
      	}
        wx.hideLoading();
      },
      realFail: function(msg) {
        wx.hideLoading();
        wx.showToast({
          title: msg
        });
      }
    }, false);
  }
})
