(function () {
    
  document.body.addEventListener('touchmove', function (e) {
      e.preventDefault(); //阻止默认的处理方式(阻止下拉滑动的效果)
  }, {passive: false}); //passive 参数不能省略，用来兼容ios和android

  $('.icon-music').on('click', function () {
      if ($(this).hasClass('active')) {
          $('.icon-music').removeClass('active');
          $('#back_music').get(0).play();
          obj.playMusic = true;
      } else {
          $('#back_music').get(0).pause();
          $('.icon-music').addClass('active');
          obj.playMusic = false;
      }
  });

  var startGame = 0;
  new resLoader({
      //resourceType : 'image', //资源类型，默认为图片
      baseUrl: './img', //基准url
      resources: {
          'bg': [
              '/game/bg-lv-1.png',
              '/game/bg-lv-2.png',
              '/game/bg-lv-3.png',
              '/game/plate-lv-1.png',
              '/game/plate-lv-2.png',
              '/game/plate-lv-3.png',
          ],
          'gameBegin': [
              '/level-bg.png',
              '/level-1.png',
              '/level-2.png',
              '/level-3.png',
              '/startup-logo.png'
          ],
          'gameOn': [
              '/game/level_icon_1_active.png',
              '/game/level_icon_2.png',
              '/game/level_icon_2_active.png',
              '/game/level_icon_3.png',
              '/game/level_icon_3_active.png',
              '/game/Lipstick_1.png',
              '/game/Sword_small_1.png',
              '/game/timebox_bg.png',
          ],
          'gameSuccess': [
              '/passGame.png',
              '/share/getAwards.png',
              '/share/close-btn.png'
          ],
          'gameFail': [
              '/gameOver-bg.png',
              '/share/shareTxt.png',
              '/share/share-btn.png',
          ],
      }, //资源路径数组
      onStart: null, //加载开始回调函数，传入参数total
      onProgress: function (t, e) {
          $(".progressBar-txt").html(Math.ceil(t / e * 100) + "%");
          console.log(t + "/" + e), console.log(t / e * 100 + "%");
          var i = t / e * 100;
          $(".progressBar-txt").css("width", i + "%");
          $(".progresstext span").text(i + "%");
          if (i == 100) {
              $('.resource-progress').hide();
          }
      }, //正在加载回调函数，传入参数currentIndex, total
      onComplete: function () {
          startGame++;
          startGame == 2 && obj.startUp();
      },
      onErrorHandle: function () {
          $(".resource-progress").hide();
          $('.alert').show();
          $('.alert-info-txt').html("您的网络不稳定,请稍后再试(错误代码:001)");
          return;
      }
  }).start();

  $.ajax({
      url: location.origin + '/kh/wx/WeChatSignServlet',
      // url: location.origin + '/khwx/servlet/WeChatSignServlet',
      dataType: 'json',
      data: {
          url: location.href
      },
      type: 'GET',
      async: true,
      success: function (data) {
          wx.config({
              debug: false, // 开启调试模式为true后可以通过alert弹窗将公众号签名等结果反馈出来
              appId: data.appId, // 必填，公众号的唯一标识
              timestamp: data.timestamp, // 必填，生成签名的时间戳
              nonceStr: data.nonceStr, // 必填，生成签名的随机串
              signature: data.signature,// 必填，签名，见附录1
              jsApiList: [
                  'onMenuShareTimeline',
                  'onMenuShareAppMessage',
                  'onMenuShareQQ',
                  'onMenuShareQZone',
                  'onMenuShareWeibo',
                  'hideMenuItems',
                  'hideAllNonBaseMenuItem',
                  'showMenuItems',
                  'showAllNonBaseMenuItem'
              ]
          });
          //默认关闭所有的功能
          wx.ready(function () {
              wx.hideAllNonBaseMenuItem();
          })
          //加载所有图片资源
          startGame++;
          startGame == 2 && obj.startUp();
      },
      error: function (e) {
          $('.alert').show();
          $('.alert-info-txt').html("您的网络不稳定,请稍后再试(错误代码:002)");
          console.log(e);
          return;
      },
  });

})();