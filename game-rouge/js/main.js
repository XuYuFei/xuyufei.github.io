var obj = {
  ctx: null,
  piUnit: 0,//单位弧度
  width: 0,//canvas的长和宽
  height: 0,
  centerX: 0,//中心点坐标
  centerY: 0,
  crashAngle: 0,//碰撞的角度
  zoom: 0, //图像整体缩放大小
  retry: 0,//重复玩耍次数

  isGaming: false,//是否正在游戏
  playMusic: false,//是否开启音乐

  levelGrade: 0,//当前游戏等级
  //移动步长和总距离
  moveStep: 10,
  movingLength: 0,
  maxMoveLength: 0,
  moving: false,

  reduceSecondObj: {
      INNER: null,
      seconds: 0
  },
  rotatingConfig: {
      oRandom: 0,//临时随机变量-----与时间相关---用来获取当前的最大转速
      nowSpeed: 0,//当前速度
      isFastChangeRotationAccelerationSpeed: false,//快速旋转
      isMustFastChangeRotationAccelerationSpeed: false//必须快速旋转------目前还不明白这个参数的意义
  },
  rotatingParams: [   //根据当前游戏等级来选择不同的旋转参数
      {
          ROTAION_SPEED_ARRAY: [-3, -2, -1, 1, 2, 5],   //旋转速度
          rotationAccelerationSpeed: 0.05,                   //加速度
          levelArray: [0, 7, -2, 30]                    //半径(无用)    当前等级口红个数    起始旋转速度  关卡时间
      }, {
          ROTAION_SPEED_ARRAY: [-4, -2, -1, 1, 2, 4],
          rotationAccelerationSpeed: 0.06,
          levelArray: [0, 10, 1.7, 40]
      }, {
          ROTAION_SPEED_ARRAY: [-4, -2, -1.5, 1.5, 2, 4],
          rotationAccelerationSpeed: 0.06,
          levelArray: [0, 13, -1.2, 60]
      }, {
          ROTAION_SPEED_ARRAY: [-5, -3, -1.5, 0, 3, 5],
          rotationAccelerationSpeed: .09,
          levelArray: [0, 13, .06, 60]
      }, {
          ROTAION_SPEED_ARRAY: [-.07, -.06, -.03, .03, .06, .07],
          rotationAccelerationSpeed: .004,
          levelArray: [0, 13, .06, 60]
      }, {
          ROTAION_SPEED_ARRAY: [-.08, -.06, -.03, .03, .06, .08],
          rotationAccelerationSpeed: .004,
          levelArray: [0, 13, .06, 60]
      }
  ],
  //存储上靶的口红----实际存储的是上靶对应的角度
  rotatingLipsticks: [],
  usedLipstickCount: 0,//存储已经使用过的个数
  img: {
      plate: {
          obj: null,
          src: './img/game/CircleCenter_1.png',
          width: 300,
          height: 300,
          sr: 6
      },
      lipstick_big: {
          obj: null,
          src: './img/game/Lipstick_1.png',
          width: 22,
          height: 90,
          sr: 2
      },
      lipstick: {
          obj: null,
          src: './img/game/Sword_small_1.png',
          width: 60,
          height: 15,
          sr: 1.6
      },
      usedLipstick: {
          obj: null,
          src: './img/game/Sword_small_1.png',
          width: 50,
          height: 50,
      },
  },
  staticImg: [],
  rotateWaitNum: 0,       //该关卡的口红个数
  rotateSpeed: 0,         //旋转速度
  rotateAngle: 0,         //旋转角度
  INNER: null,
  initialize: function (id) {
      var canvas = document.getElementById(id);
      if (canvas.getContext) {
          this.ctx = canvas.getContext('2d');
      } else {
          alert('当前不支持canvas,请更换浏览器再做尝试!');
          return;
      }
      //保证宽高比最大为0.65
      var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
          h = window.innerHeight;
      w / h > 0.65 && (w = h * .65);
      //设置rem的基本长度单位
      var t = w / 6.5;
      // $('html').css('font-size', t);

      canvas.width = w * 2;
      canvas.height = h * 2;
      $('canvas,.container').width(w);
      $('canvas,.container').height(h);

      this.piUnit = Math.PI / 180;
      this.width = Math.floor(canvas.width);
      this.height = Math.floor(canvas.height);
      this.centerX = Math.floor(this.width / 2);
      this.centerY = Math.floor(this.height / 2);
      this.levelGrade = 0;
      this.rotatingLipsticks = [];

      $.each(this.img, function (i, item) {
          item.obj = new Image();
          item.obj.src = item.src;
          //重新计算宽高
          var width = item.width, height = item.height;
          if (width > height) {
              item.width = Math.floor(t * item.sr);
              item.height = Math.floor(height * item.width / width);
          } else {
              item.height = Math.floor(t * item.sr);
              item.width = Math.floor(width * item.height / height);
          }
      });


      this.rotateSpeed == 0 && (this.rotateSpeed = this.rotatingParams[this.levelGrade].levelArray[2]);
      this.rotateAngle = 0;
      this.moving = false, this.isGaming = false;

      //最大移动距离
      this.maxMoveLength = this.height / 2 - this.img.plate.height / 2 - this.img.lipstick_big.height;
      this.moveStep = this.maxMoveLength / 20;//可以控制发射的速度---更改游戏的难易程度
      //碰撞角度
      this.crashAngle = 180 * this.img.lipstick_big.width / Math.PI / (this.img.plate.height / 2 + this.img.lipstick_big.height);

      this.INNER !== null && (window.cancelAnimationFrame(this.INNER), this.INNER = null);
      this.reduceSecondObj.INNER !== null && (window.clearInterval(this.reduceSecondObj.INNER), this.reduceSecondObj.INNER = null);
      var self = this;

      var r = "ontouchend" in document ? "touchend" : "click";
      $('#canvas').on(r, function (t) {
          t.preventDefault();
          self.launch();
      });

      $(".share-details").on('click', function () {
          $(this).toggle();
      });
      $('.share-details-close').on('click', function () {
          $('.share-details').hide();
      });

      $("#share-btn-ok").click(function () {
          //临时开启分享功能
          wx.showMenuItems({
              menuList: [
                  "menuItem:share:appMessage",
                  "menuItem:share:timeline",
                  'menuItem:onMenuShareTimeline',
                  "menuItem:share:qq",
                  "menuItem:share:weiboApp",
                  'menuItem:share:QZone'
              ] // 要显示的菜单项，所有menu项见附录3
          });
          self.shareTo();
          $('.share-details').show();
      });
      $("#share-btn-close").on('click', function () {
          self.closePage();
      })


  },
  startUp: function () {
      obj.initialize('canvas');
      //异步--加载所有的图片完成之后才能继续游戏
      var thisObj = this, asyncNum = 0;
      Object.keys(thisObj.img).forEach(function (k) {
          thisObj['img'][k]['obj'].onload = function () {
              asyncNum++;
              if (asyncNum == 4) {
                  $('.startup').show();
                  thisObj.goToNextLevel();
              }
          }
      })
  },
  launch: function () {
      if (!this.moving) {
          this.moving = true;
          this.usedLipstickCount++;
      }
  },
  reduceSeconds: function () {
      var thisObj = this;
      thisObj.reduceSecondObj.seconds = this.rotatingParams[thisObj.levelGrade].levelArray[3];
      reduceSec();
      if (this.isGaming) {
          thisObj.reduceSecondObj.INNER = setInterval(reduceSec, 1000);
      }

      function reduceSec() {
          thisObj.reduceSecondObj.seconds--;
          if (thisObj.reduceSecondObj.seconds == 10) {
              thisObj.playMusic && thisObj.audioPlay('Countdown_10s_audio');
          }
          if (thisObj.reduceSecondObj.seconds == 0) {
              thisObj.closeGame();
              return;
          }
          $('#timeBox').html(thisObj.reduceSecondObj.seconds);
      }
  },
  goToNextLevel: function () {
      var levelNum = this.levelGrade + 1;
      this.INNER !== null && (window.cancelAnimationFrame(this.INNER));
      this.reduceSecondObj.INNER !== null && (window.clearInterval(this.reduceSecondObj.INNER));
      var thisObj = this;
      $('.startup').show();
      //设置启动画面里的等级
      $('.level-grade').attr('src', './img/level-' + levelNum + '.png');
      //设置主游戏背景图片
      $(".main").css("background-image", 'url(./img/game/bg-lv-' + levelNum + '.png)');
      //设置西瓜种类
      this.img.plate.obj.src = './img/game/plate-lv-' + levelNum + '.png';
      this.img.plate.sr = './img/game/plate-lv-' + levelNum + '.png';

      $('.main,.gameClose,.success-grade').hide();
      $("#grade-txt").html(levelNum);//这个时候的grade是上一关的等级
      $("#timeBox").html(thisObj.rotatingParams[levelNum].levelArray[3]);
      $('.level-hearts>img').each(function (item, node) {
          if (item < levelNum) {
              node.src = './img/game/level_icon_' + (item + 1) +
                  '_active.png';
          } else {
              node.src = './img/game/level_icon_' + (item + 1) +
                  '.png';
          }
      });
      //播放背景音乐
      // document.getElementById('back_music').play();
      //停止倒计时的配音
      this.playMusic && document.getElementById('Countdown_10s_audio').pause();
      //判断是否为第一关卡---手动启动
      if (levelNum == 1) {
          $('.click-begin').show();
          $('.click-begin').click(function (e) {
              doPlay();
              $(this).hide();
              $(this).unbind(e);
          });

      } else {
          setTimeout(doPlay, 2000);
      }

      //开始游戏
      function doPlay() {
          $('.main').show();
          $('.startup').hide();
          //配置下一关的参数
          thisObj.goToNextConfig();
          thisObj.reduceSeconds();
          //重新开始游戏
          if (thisObj.isGaming) {
              thisObj.INNER = window.requestAnimationFrame(function () {
                  thisObj.isGaming && thisObj.drawImgs();
              });
          }
      }
  },
  goToNextConfig: function () {
      this.isGaming = true;
      this.moving = false;
      this.rotatingLipsticks = [];
      this.usedLipstickCount = 1;//发射的口红个数
      this.rotateWaitNum = this.rotatingParams[this.levelGrade].levelArray[1];
      this.rotateSpeed = this.rotatingParams[this.levelGrade].levelArray[2];
      this.rotateAngle = 0;
  },
  calculateIncrement: function () {
      var dt = new Date();
      //每2s改变一次随机数----用来获取下次的最大旋转角度
      (dt.getSeconds() % 2 == 0) && (this.rotatingConfig.oRandom = Math.floor(Math.random() * 6));

      var param = this.rotatingParams[this.levelGrade];
      this.rotatingConfig.nowSpeed = param.ROTAION_SPEED_ARRAY[this.rotatingConfig.oRandom];

      /*var t = this.getParams(this.levelA);
      this.nowSpeed = t.ROTAION_SPEED_ARRAY[this.oRandom];
      //e---- 剩余 球的个数
      var e = parseInt(t.levelArray[1] - n);*/

      /*3 == this.level && e <= 3 ?
          this.last_3_changeSpeed.call(this, e) :*/

      this.rotateSpeed >= this.rotatingConfig.nowSpeed ?

          this.rotatingConfig.isFastChangeRotationAccelerationSpeed ?
              this.rotateSpeed -= 2 * param.rotationAccelerationSpeed :
              this.rotateSpeed -= param.rotationAccelerationSpeed :

          this.rotatingConfig.isFastChangeRotationAccelerationSpeed ?
              this.rotateSpeed += 2 * param.rotationAccelerationSpeed :
              this.rotateSpeed += param.rotationAccelerationSpeed;

      return this.rotateSpeed;
  },
  drawImgs: function () {
      //判断是否需要进入下一关卡
      if (this.rotatingLipsticks.length == this.rotateWaitNum) {//靶子上面的口红数量与当前等级的最大可用数值一致的时候
          var self = this;
          self.isGaming = false;
          setTimeout(function () {
              self.playMusic && $("#success_audio")[0].play();
          }, 10);
          //关卡结束
          setTimeout(function () {
              $('.success-grade').show();
              $('#grade-txt').html(self.levelGrade + 1);
              $('.main,.gameClose').hide();
              if (self.levelGrade == 2) {
                  $('.getAward').show();
                  $('.getAward-btn').click(function () {
                      window.open('./pages/deliveryPro.html', '_self');
                  });
                  $('#getAward-close').click(function () {
                      self.closePage();
                  })
              } else {
                  self.levelGrade++;
                  setTimeout(function () {
                      $('.success-grade').hide();
                      self.goToNextLevel();
                  }, 1000);
              }
          }, 700);
      }

      //设置旋转角度
      var increment = this.calculateIncrement();
      this.rotateAngle += increment;
      if (this.rotateAngle >= 360) {
          this.rotateAngle -= 360;
      } else if (this.rotateAngle <= -0) {
          this.rotateAngle += 360;
      }
      this.drawAct();
      var thisObj = this;
      thisObj.INNER = window.requestAnimationFrame(function () {
          thisObj.isGaming && thisObj.drawImgs();
      });
  },
  drawAct: function () {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.save();
      this.drawPlate();
      this.drawLipstickArray();
      if (this.moving) {
          this.drawMovingLipStick();
      } else {
          if (this.rotatingLipsticks.length !== this.rotateWaitNum)
              this.drawStaticLipStick();
      }
  },
  drawPlate: function () {
      this.ctx.save();
      this.ctx.translate(this.centerX, this.centerY);
      this.ctx.rotate(this.piUnit * 90);
      this.ctx.rotate(this.piUnit * this.rotateAngle);

      this.ctx.drawImage(this.img.plate.obj, -this.img.plate.width / 2, -this.img.plate.height / 2, this.img.plate.width, this.img.plate.height);

      this.drawRotatingLipsticks();
      this.ctx.restore();
  },
  drawRotatingLipsticks: function () {
      this.ctx.save();
      this.ctx.globalCompositeOperation = 'destination-over';
      for (var i = 0; i < this.rotatingLipsticks.length; i++) {
          this.ctx.save();
          this.ctx.rotate(-this.piUnit * this.rotatingLipsticks[i]);

          this.ctx.translate(this.img.plate.width / 2, 0);
          this.ctx.rotate(-90 * this.piUnit);

          this.ctx.drawImage(this.img.lipstick_big.obj, -this.img.lipstick_big.width / 2, -(this.img.lipstick_big.height * .3), this.img.lipstick_big.width, this.img.lipstick_big.height);

          this.ctx.restore();
      }
      this.ctx.restore();
  },
  drawLipstickArray: function () {
      var level = this.levelGrade;

      this.ctx.save();
      var maxWaiteNum = this.rotatingParams[level].levelArray[1];
      var usedNum = this.usedLipstickCount;
      //显示所有的口红
      this.ctx.translate(0, this.height - this.img.lipstick.height * maxWaiteNum * 2);
      this.ctx.save();
      for (var i = 0; i < maxWaiteNum; i++) {
          this.ctx.save();
          this.ctx.translate(0, this.img.lipstick.height * i * 2);
          // this.ctx.rotate(Math.PI / 2);
          if (i < usedNum) {//已使用的口红-----间隔5像素
              // this.ctx.drawImage(this.img.usedLipstick.obj, 5, -(this.img.lipstick.height + 5) * (i + 1), this.img.usedLipstick.width, this.img.usedLipstick.height);
          }
          else {//未使用
              this.ctx.drawImage(this.img.lipstick.obj, 5, -this.img.lipstick.height, this.img.lipstick.width, this.img.lipstick.height);
          }
          this.ctx.restore();
      }
      this.ctx.restore();
      this.ctx.restore();
  },
  drawStaticLipStick: function () {
      this.ctx.save();
      this.ctx.translate(this.centerX, this.height);

      this.ctx.drawImage(this.img.lipstick_big.obj, -this.img.lipstick_big.width / 2, -(5 + this.img.lipstick_big.height), this.img.lipstick_big.width, this.img.lipstick_big.height);
      this.ctx.restore();
  },
  drawMovingLipStick: function () {
      this.ctx.save();
      this.ctx.translate(this.centerX, this.height + 5);
      //计算移动的距离
      this.movingLength += this.moveStep;
      this.ctx.globalCompositeOperation = 'destination-over';
      this.ctx.drawImage(this.img.lipstick_big.obj, -this.img.lipstick_big.width / 2, -(this.movingLength + this.img.lipstick_big.height), this.img.lipstick_big.width, this.img.lipstick_big.height);
      this.ctx.restore();

      if (this.movingLength >= this.maxMoveLength) { //+ this.img.lipstick_big.height * .3
          //碰撞检测
          var self = this;
          if (!this.isCrash(this.rotateAngle)) {
              setTimeout(function () {
                  self.playMusic && $('#insert_audio')[0].play();
              }, 1);
              this.rotatingLipsticks.push(this.rotateAngle);
          }
          else {
              this.isGaming = false;
              self.isGaming = false;
              setTimeout(function () {
                  self.closeGame();
              }, 700);
          }
          this.movingLength = 0;
          this.moving = false;
      }
  },
  resetGame: function () {
      this.levelGrade--;
      this.goToNextLevel();
  },
  closeGame: function () {
      document.getElementById('back_music').pause();
      window.clearInterval(this.reduceSecondObj.INNER);
      window.cancelAnimationFrame(this.INNER);

      var self = this;
      if (self.retry == 0) {
          $('.gameClose,.share-desc-txt,#share-btn-ok').show();
          $('.startup,.main,.share-details').hide();
      } else {
          $('.gameClose').show();
          $('.main,.share-desc-txt,#share-btn-ok,.share-details').hide();
      }

      console.log(!self.retry, self.levelGrade + 1);
  },
  isCrash: function (angle) {
      //比较当前角度与所有角度之间的范围，当小于间隔的时候则不能插入
      for (var i = 0; i < this.rotatingLipsticks.length; i++) {
          var item = this.rotatingLipsticks[i];
          if (Math.abs(angle - item) < this.crashAngle) {
              return true;
          }
      }
      return false;
  },
  closePage: function () {
      document.getElementById('back_music').pause();
      wx.closeWindow();
  },
  audioPlay: function (obj) {
      document.getElementById(obj).play();
      /*console.log(obj)
      wx.ready(function () {
          document.getElementById(obj).pause()
          document.getElementById(obj).play();
      });*/
  },
  shareTo: function () {
      var self = this;
      var shareBaseMsg = {
          title: '口红机', // 分享标题
          desc: '我正在抽奖玩游戏,快来一起玩呀...', // 分享描述
          link: location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: location.origin + '/game' + '/img/startup-logo.png',
          // imgUrl: 'http://testgame.ngrok.xiaomiqiu.cn/doudou/img/startup-logo.png', // 分享图标
          success: successShareFunc,
          error: function (e) {
          }
      };

      wx.ready(function () {
          wx.onMenuShareTimeline(shareBaseMsg);
          wx.onMenuShareAppMessage(shareBaseMsg);
          wx.onMenuShareQQ(shareBaseMsg);
          wx.onMenuShareQZone(shareBaseMsg);
      });

      function successShareFunc() {
          wx.hideAllNonBaseMenuItem();
          self.retry++;
          self.levelGrade = 0;
          $('.share-details').hide();
          self.goToNextLevel();
      }
  },
};
