// pages/eventPoster/eventPoster.js
var { APIS } = require('../../const');
var util = require('../../utils/util');
var user = require('../../libs/user');
var { request } = require('../../libs/request');

Page({
  data:{
    eventId: '',
    poster: '',
    fromShare: 0
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      eventId: options.eventId || '',
      fromShare: options.fromShare || 0
    });
    user.login(this.getEventPoster, this, true);
  },

  getEventPoster: function() {
    request({
          url: APIS.GET_EVENT_POSTER,
          method: 'POST',
          data: {
              eventId: this.data.eventId,
              sid: wx.getStorageSync('sid')
          },
          realSuccess: function(data) {
              that.setData({
                poster: data.poster
              });
          },
          loginCallback: this.getEventPoster,
          realFail: function(msg) {
            //wx.hideLoading();
            wx.showToast({
                title: msg
            });
          }
      }, true, this);
  }
})