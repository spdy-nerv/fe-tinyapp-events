//personCenter.js
var { APIS } = require('../../const');
var user = require('../../libs/user');
var { request } = require('../../libs/request');
Page({
  data: {
  	footerConfig: {
      pagePersonal: true
    },
    nick:"",  //昵称
	  headerImg:"",
	  isCertification:true,   //是否认证
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
        if(!that.data.isCertification){
        	 wx.showToast({
                title: '您尚未身份认证！2秒后跳转认证界面！',
                duration: 2000,
                mask: true
            });
            setTimeout(function() {
                wx.navigateTo({
                url: '../verify/verify'
                });
            }, 2000);
        }
        
      },
      realFail: function(msg) {
        wx.hideLoading();
        wx.showToast({
          title: msg
        });
      }
    }, true);
  },
  //我的卡片
  toMyCard: function(e){
  		wx.navigateTo({
			  url: '../myCard/myCard'
			});
  },
  //我的关注
  toMyFollows: function(e){
  	wx.navigateTo({
			  url: '../myFollows/myFollows'
		});
  },
  //我的发布
  toMyPublic: function(e){
  	console.log(this.data.isCertification);
  	//弹出认证提示
  	if(!this.data.isCertification){
  		this.showModal();
  	}else{
  		wx.navigateTo({
			  url: '../myPublished/myPublished'
			});
  	}
  },
  
  showModal: function(){
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
  }
})
