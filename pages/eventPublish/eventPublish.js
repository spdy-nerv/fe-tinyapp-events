var { APIS } = require('../../const');
var util = require('../../utils/util');
var user = require('../../libs/user');
var { uploadPic } = require('../../libs/upload');
var { request } = require('../../libs/request');
var Q = require('../../libs/q/q');

Page({
  data:{
    // TMP
    eventId: '7cb097822e4511e79f5352540035fdcd',
    swiperHeight: 0,
    picPaths: [],
    eventName: '',
    address: '广西南宁大学东路100号',
    sYear: '',
    sMonth: '',
    sDate: '',
    eYear: '',
    eMonth: '',
    eDate: '',
    eventTypeList: [],
    eventTypeIndex: 0,
    roleList: [],
    moduleTypeList: [
        {
            moduleTypeId: 1,
            moduleTypeName: '详情模块'
        }, {
            moduleTypeId: 2,
            moduleTypeName: '评论模块'
        }, {
            moduleTypeId: 3,
            moduleTypeName: '报名模块'
        }, {
            moduleTypeId: 4,
            moduleTypeName: '投票模块'
        }, {
            moduleTypeId: 5,
            moduleTypeName: '问卷模块'
        }, {
            moduleTypeId: 6,
            moduleTypeName: '评价模块'
        }
    ],
    needDescriptionModule: false,
    descriptionModuleId: '',
    needEnrollModule: false,
    enrollModuleId: '',
    needVoteModule: false,
    voteModuleId: '',
    needTestModule: false,
    testModuleId: '',
    // 首次选择附加模块时需要确保已经生成eventId
    isFirstTapExt: true,
    startTime: '',
    endTime: '',
    allowViewId: []
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
    //user.login(null, this, true);
    /*
    this.setData({
      eventId: options.eventId
    });
    */
    // 如果有eventId，认为是修改，此时需要获取事件的基础信息
    if (this.data.eventId) {
        user.login(this.renderBaseInfo, this, true);
    }
    this.renderCal();
    this.renderEventType();
    this.renderEventRole();
  },

  renderBaseInfo: function() {
      var that = this;
      wx.showLoading({
        mask: true,
        title: '获取事件信息中'
      });
      request({
          url: APIS.GET_EVENT_BASE,
          method: 'POST',
          data: {
              eventId: this.data.eventId,
              sid: wx.getStorageSync('sid')
          },
          realSuccess: function(data) {
              that.setData({
                eventName: data.name,
                address: data.address
              });
              that.handlePicsLoad(data.pictureUrls);
              that.handleEventType(data.typeId);
              that.handleRole(data.allowViewId);
              that.handleModules(data.modules);
              wx.hideLoading();
          },
          loginCallback: this.renderBaseInfo,
          realFail: function(msg) {
            wx.hideLoading();
            wx.showToast({
                title: msg
            });
          }
      }, true, this);
  },

  handlePicsLoad: function(urls) {
    var filteredUrls = [];
    for (var i in urls) {
      if (urls[i]) {
        filteredUrls.push(urls[i]);
      }
    }
    this.setData({
      picPaths: filteredUrls,
      swiperHeight: filteredUrls.length > 0 ? 390 : 0
    });
  },

  // TODO
  handleEventType: function(typeId) {},

  // TODO
  handleRole: function(roleIdLists) {},

  handleModules: function(modules) {
    for (var i in modules) {
      var m = modules[i];
      switch(m.moduleType) {
        // 详情
        case '1':
          this.setData({
            needDescriptionModule: true,
            descriptionModuleId: m.moduleId,
            'moduleTypeList[0].isChecked': true
          });
          break;
        case '3':
          this.setData({
            needEnrollModule: true,
            enrollModuleId: m.moduleId,
            'moduleTypeList[2].isChecked': true
          });
          break;
        case '4':
          this.setData({
            needVoteModule: true,
            voteModuleId: m.moduleId,
            'moduleTypeList[3].isChecked': true
          });
          break;
        case '5':
          this.setData({
            needTestModule: true,
            testModuleId: m.moduleId,
            'moduleTypeList[4].isChecked': true
          });
          break;
      }
    }
  },

  renderCal: function() {
      var today = new Date();
      this.setData({
        sYear: today.getFullYear(),
        sMonth: today.getMonth() + 1,
        sDate: today.getDate(),
        eYear: today.getFullYear(),
        eMonth: today.getMonth() + 1,
        eDate: today.getDate()
      });
  },

  renderEventType: function() {
    var that = this;
    request({
      url: APIS.GET_EVENT_TYPE_LIST,
      method: 'GET', 
      realSuccess: function(data){
        var list = data.list;
        that.setData({
          eventTypeList: list
        });
      }
    }, false);
  },

  onChangeEventType: function(e) {
    this.setData({
      eventTypeIndex: +e.detail.value
    });
  },

  renderEventRole: function() {
    var that = this;
    request({
      url: APIS.GET_ROLE_LIST,
      method: 'GET', 
      realSuccess: function(data){
        var list = data.list;
        list = list.map(function(r) {
            r.isChecked = true;
            return r;
        });
        that.setData({
          roleList: list
        });
      }
    }, false);
  },

  onRoleToggle: function(e) {
      var list = this.data.roleList;
      var index= e.target.dataset.index;
      list[index].isChecked = !list[index].isChecked;
      this.setData({
          roleList: list
      });
  },

  onChooseEventPics: function() {
    if (this.data.picPaths.length >= 5) {
      wx.showToast({
        title: '最多只能上传5张图片！'
      });
      return;
    }

    var that = this;
    var count = 5 - this.data.picPaths.length;
    wx.chooseImage({
      count: count, // 最多可以选择的图片张数，默认9
      sizeType: ['compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function(res){
        // success
        var tempFilePaths = res.tempFilePaths;
        var pathArr = that.data.picPaths;
        pathArr = pathArr.concat(tempFilePaths);
        that.setData({
          picPaths: pathArr,
          swiperHeight: 390
        });
      }
    })
  },

  bindStartTimeChange: function(e) {
    var dateArr = e.detail.value.split('-');
    this.setData({
      sYear: +dateArr[0],
      sMonth: +dateArr[1],
      sDate: +dateArr[2]
    });
  },

  bindEndTimeChange: function(e) {
    var dateArr = e.detail.value.split('-');
    this.setData({
      eYear: +dateArr[0],
      eMonth: +dateArr[1],
      eDate: +dateArr[2]
    });
  },

  onInputName: function(e) {
      this.setData({
          eventName: e.detail.value
      });
  },

  onModuleTypeToggle: function(e) {

    // 第一次选择附件模块时触发事件保存
    if (this.data.isFirstTapExt) {
        this.saveEventBase(false);
    }

    var list = this.data.moduleTypeList;
    var index= e.target.dataset.index;
    list[index].isChecked = !list[index].isChecked;
    this.setData({
        moduleTypeList: list
    });
    switch(list[index].moduleTypeId) {
      case 1:
        this.setData({needDescriptionModule: list[index].isChecked});
        break;
      case 3:
        this.setData({needEnrollModule: list[index].isChecked});
        break;
      case 4:
        this.setData({needVoteModule: list[index].isChecked});
        break;
      case 5:
        this.setData({needTestModule: list[index].isChecked});
        break;
      }
  },

  // 保存基本信息
  // isPublish 是保存还是直接发布
  saveEventBase: function(isPublish = true) {
    var that = this;
    var tips = '';
    if (isPublish) {
        tips = '发布';
    } else {
        tips = '保存';
    }
    wx.showLoading({
        mask: true,
        title: '事件' + tips + '中，请稍候！'
    });

    var info = this.constructBaseInfo();
    if (!this.validateBaseInfo(info)) {
        return;
    }
      
    var fnArr = [];
    var localPicIndexArr = [];
    for (var i in this.data.picPaths) {
      var picPath = this.data.picPaths[i];
      // 本地临时图片才上传
      if (picPath.indexOf('wxfile://') == 0) {
        fnArr.push(uploadPic(this.data.picPaths[i]));
        localPicIndexArr.push(i);
      }
    }
    Q.all(fnArr)
    .then(function(picUrls) {
      var d = {};
      var picPaths = that.data.picPaths;
      for (var i in picUrls) {
        //info.eventPics.push(picUrls[i]);
        picPaths[localPicIndexArr[i]] = picUrls[i]
      }
      that.setData({
        picPaths: picPaths
      });
      info.eventPics = picPaths;
      d.data = info;
      d.sid = wx.getStorageSync('sid');
      if (that.data.eventId) {
          d.eventId = that.data.eventId;
      }
      request({
        url: APIS.ADD_EVENT_BASE,
        data: d,
        method: 'POST',
        realSuccess: function(data) {
          wx.hideLoading();
          wx.showToast({
            title: tips + '成功'
          });
          that.setData({
            isFirstTapExt: false,
            eventId: data.eventId
          });
        },
        loginCallback: function() {
            that.saveEventBase(isPublish);
        },
        realFail: function(msg, errCode) {
          wx.hideLoading();
          wx.showToast({
            title: msg
          });
        }
      }, true, that);
    })
    .catch(function(e) {
      wx.hideLoading();
      wx.showToast({
        title: e.errMsg || '评论发布失败，请稍后重试！'
      });
    });
      
  },

  constructBaseInfo: function() {
      var d = this.data;
      var info = {
          eventName: d.eventName,
          address: d.address,
          eventPics: [],
          startTime: d.sYear + '-' + d.sMonth + '-' + d.sDate + ' 00:00:00',
          endTime: d.eYear + '-' + d.eMonth + '-' + d.eDate + ' 23:59:59',
          typeId: d.eventTypeList[d.eventTypeIndex].typeId
      };
      var roleArr = [];
      for (var i in d.roleList) {
          if (d.roleList[i].isChecked) {
              roleArr.push(d.roleList[i].roleId);
          }
      }
      info.allowViewId = roleArr;
      // TMP
      info.createTime = info.startTime;

      this.setData({
        startTime: info.startTime,
        endTime: info.endTime,
        allowViewId: info.allowViewId
      });

      return info;
  },

  validateBaseInfo: function(info) {
      var flag = true;
      var tips = '';
      if (info.eventName == '') {
          flag = false;
          tips = '事件名称不能为空！'
      } else if (info.address == '') {
          flag = false;
          tips = '事件地址不能为空！'
      } else if (info.typeId == '') {
          flag = false;
          tips = '请选择事件类型！'         
      } else if (info.allowViewId.length == 0) {
          flag = false;
          tips = '请选择查看权限！'             
      }
      if (!flag) {
          wx.hideLoading();
          wx.showToast({
            title: tips
          });
          return false;
      }
      return true;
  },

  onTapPublish: function() {
      this.saveEventBase(true);
  },

  onDeletePreview: function(e) {
    var index = e.target.dataset.index;
    var paths = this.data.picPaths;
    paths.splice(index, 1);
    this.setData({
      picPaths: paths
    });
    if (this.data.picPaths.length == 0) {
        this.setData({
            swiperHeight: 0
        });
    }
  }
})