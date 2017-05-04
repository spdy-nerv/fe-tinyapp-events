//declaration.js
var {
	APIS
} = require('../../const');
var user = require('../../libs/user');

var { request } = require('../../libs/request');
Page({
	data: {
		declaration:""
	},
	onLoad: function(options) {
		
		this.setData({
			declaration:options.declaration
		})
	},
	
	formSubmit: function(e) {
		var dec = e.detail.value.declaration;
		var that = this;
		this.setData({
			declaration:dec
		});
		wx.setStorageSync('declaration', this.data.declaration);
		wx.navigateBack({
		  delta: 1
		})
		/*wx.redirectTo({
		  url: '../myCard/myCard?declaration='+dec+'&type=0'
		});*/
	}
	
})