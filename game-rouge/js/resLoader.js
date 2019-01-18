(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
      //AMD
      define(factory);
  } else if (typeof exports === 'object') {
      //Node, CommonJS之类的
      module.exports = factory();
  } else {
      //浏览器全局变量(root 即 window)
      root.resLoader = factory(root);
  }
}(this, function () {
  var isFunc = function (f) {
      return typeof f === 'function';
  }

  //构造器函数
  function resLoader(config) {
      this.option = {
          //resourceType : 'image', //资源类型，默认为图片
          baseUrl: './', //基准url
          resources: [], //资源路径数组
          onStart: null, //加载开始回调函数，传入参数total
          onProgress: null, //正在加载回调函数，传入参数currentIndex, total
          onComplete: null, //加载完毕回调函数，传入参数total
          onErrorHandle: null
      };
      if (config) {
          for (i in config) {
              this.option[i] = config[i];
          }
      }
      else {
          alert('参数错误！');
          return;
      }
      this.status = 0; //加载器的状态，0：未启动   1：正在加载   2：加载完毕
      this.total = 0; //资源总数
      for (item in this.option.resources) {
          this.total += this.option.resources[item].length
      }
      this.currentIndex = 0; //当前正在加载的资源索引
      this.imgObjs = [];
  };

  resLoader.prototype.start = function () {
      this.status = 1;
      var _this = this;
      var baseUrl = this.option.baseUrl;

      for (indexa in this.option.resources) {
          for (indexb in this.option.resources[indexa]) {
              var r = this.option.resources[indexa][indexb], url = '';
              if (r.indexOf('http://') === 0 || r.indexOf('https://') === 0) {
                  url = r;
              } else {
                  url = baseUrl + r;
              }
              var subUrl = url.split(".");
              if (subUrl[subUrl.length - 1].split("?")[0] == 'png' || subUrl[subUrl.length - 1].split("?")[0] == 'jpg') {
                  var image = new Image();
                  image.onload = function () {
                      _this.loaded();
                  };
                  image.onerror = function () {
                      // _this.errorHandle()
                      isFunc(_this.option.onErrorHandle) && _this.option.onErrorHandle();
                  };
                  image.src = url;
                  this.option.resources[indexa][indexb] = image;
              } else {
                  console.log(url)
                  var audio = new Audio();
                  audio.src = url;
                  audio.oncanplay = function () {
                      _this.loaded();
                  }
                  audio.onerror = function () {
                      // _this.errorHandle();
                      isFunc(_this.option.onErrorHandle) && _this.option.onErrorHandle();
                  }
              }
          }
      }
      if (isFunc(this.option.onStart)) {

          this.option.onStart(this.total);
      }
  }

  resLoader.prototype.loaded = function () {
      ++this.currentIndex;
      if (isFunc(this.option.onProgress)) {
          this.option.onProgress(this.currentIndex, this.total);
      }
      //加载完毕
      if (this.currentIndex === this.total) {
          if (isFunc(this.option.onComplete)) {
              this.option.onComplete(this.option.resources);
          }
      }
  }
  resLoader.prototype.errorHandle = function () {
      alert('网络不通，请稍后再试...')
      /*$("#errorText").html("您的网络正在开小差，稍后再试:008")
      $("#errorBtn").html("返回首页")
      $(".chargebacksFailAlertBox").css("display", "block")
      $(".chargebacksFailAlertBox").addClass("hidden")
      $("#app").css("display", "none")
      $("#errorBox").css("display", "block")
      $("#levelSwitchBox").addClass("hidden")*/
  }

  //暴露公共方法
  return resLoader;
}));
