// utils/audio.js
class AudioManager {
  constructor() {
    this.innerAudioContext = null;
    this.callbacks = {};
  }
  
  init(src, options = {}) {
    // 如果已存在，先销毁
    if (this.innerAudioContext) {
      this.innerAudioContext.destroy();
    }
    
    this.innerAudioContext = wx.createInnerAudioContext();
    this.innerAudioContext.src = src;
    
    // 配置
    if (options.loop !== undefined) this.innerAudioContext.loop = options.loop;
    if (options.volume !== undefined) this.innerAudioContext.volume = options.volume;
    if (options.autoplay) this.innerAudioContext.autoplay = true;
    
    // 绑定事件
    this.bindEvents(options);
    
    return this;
  }
  
  bindEvents(options) {
    const events = ['onPlay', 'onPause', 'onStop', 'onEnded', 'onError', 'onTimeUpdate'];
    
    events.forEach(event => {
      this.innerAudioContext[event]((res) => {
        // 执行回调
        if (options[event] && typeof options[event] === 'function') {
          options[event](res);
        }
        // 执行全局回调
        if (this.callbacks[event]) {
          this.callbacks[event](res);
        }
      });
    });
	
	// 初始化后回调
	if (options['onInitialize'] && typeof options['onInitialize'] === 'function') {
		options['onInitialize']()
	}
  }
  
  play() {
	console.log('xxxxxxxxxxxxxxxxxxxxxxxxxx play', this.innerAudioContext)
    this.innerAudioContext && this.innerAudioContext.play();
  }
  
  pause() {
    this.innerAudioContext && this.innerAudioContext.pause();
  }
  
  stop() {
    this.innerAudioContext && this.innerAudioContext.stop();
  }
  
  seek(position) {
    this.innerAudioContext && this.innerAudioContext.seek(position);
  }
  
  destroy() {
    this.innerAudioContext && this.innerAudioContext.destroy();
    this.innerAudioContext = null;
  }
  
  // 获取当前状态
  getStatus() {
    if (!this.innerAudioContext) return null;
    return {
      duration: this.innerAudioContext.duration,
      currentTime: this.innerAudioContext.currentTime,
      paused: this.innerAudioContext.paused,
      // buffered: this.innerAudioContext.buffered
    };
  }
}

// 单例导出
export const audioManager = new AudioManager();

// 使用示例
// audioManager.init('https://xxx.mp3', {
//   onPlay: () => console.log('播放'),
//   onTimeUpdate: () => console.log('进度更新')
// }).play();