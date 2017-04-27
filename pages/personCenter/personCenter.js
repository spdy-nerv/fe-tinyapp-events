//personCenter.js
var { APIS } = require('../../const');
var user = require('../../libs/user');
var { request } = require('../../libs/request');
Page({
  data: {
    nick:"",  //昵称
	  headerImg:"",
	  isCertification:false,   //是否认证
	  roleName:"",
	  isUp:false //弹窗
  },
  onLoad: function () {
  	wx.showLoading({
	      mask: true,
	      title: '数据加载中'
	    });
	    user.login(this.onLoadData, this, true);
  },
  onLoadData: function(){
  	var that = this;
  	var params = {
  		sid: wx.getStorageSync('sid')
  	};
  	 request({
      url: APIS.MY_CENTER,
      data: params,
      method: 'POST',
      realSuccess: function(data){
        that.setData({
        	nick:							data.nick,
        	headerImg:				data.headerImg,
        	isCertification:	data.isCertification,
        	roleName:					data.roleName
        });
        wx.hideLoading();
      },
      realFail: function(msg) {
        wx.hideLoading();
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },
  
  toMyCard: function(e){
  	//弹出认证提示
  	if(!this.data.isCertification){
  		wx.showModal({
				 title: '温馨提示！',
				 content: '您还没有身份认证，点击确认去认证',
				 success: function(res) {
				  if (res.confirm) {
				   wx.navigateTo({
						  url: '../verify/verify'
						});
				  }
				 }
			})
  		
  	}else{
  		wx.navigateTo({
			  url: '../myCard/myCard'
			});
  	}
  }
})
