import {
	defineStore
} from 'pinia'

const useAudio = defineStore('audio', {
	state: () => ({
		duration: 0,
		currentTime: 0,
		isPlaying: false,

		AudioContext: null,

		path: '',
		audioObj: uni.getStorageSync('playAudioObj') || {},

		sliderValue: 0,

		loop: true,

		audioList: [],
		audioIndex: -1,

		eventsBound: false
	}),

	getters: {
		getAudioObj: s => s.audioObj,
		getSliderValue: s => s.sliderValue,
		getDuration: s => s.duration,
		getCurrentTime: s => s.currentTime,
		getIsPlaying: s => s.isPlaying,
		getAudioContext: s => s.AudioContext,
		getUrl: s => s.path,
		getLoop: s => s.loop
	},

	actions: {
		isPathEqual(url) {
			return this.path === url
		},

		play() {
			this.AudioContext?.play()
			this.isPlaying = true
		},

		pause() {
			this.AudioContext?.pause()
			this.isPlaying = false
		},

		stop() {
			this.AudioContext?.stop()

			this.currentTime = 0
			this.duration = 0
			this.sliderValue = 0
			this.isPlaying = false
		},

		reset() {
			this.stop()

			this.audioObj = {}
			this.path = ''
			this.audioIndex = -1

			uni.removeStorageSync('playAudioObj')
		},

		setAudio(dataObj) {
			if (!dataObj) return
			const data = {
				title: dataObj.name,
				chapter_id: dataObj.id,
				path: dataObj.path,
				background: dataObj.cover,
				description: dataObj.description,
			}

			this.audioObj = data
			this.path = data.path

			this.audioIndex =
				this.audioList.findIndex(item => item.id === dataObj.id)

			uni.setStorageSync('playAudioObj', data)
		},

		tryGetDuration() {
			const duration = this.AudioContext?.duration

			if (!duration || isNaN(duration)) {
				setTimeout(() => {
					this.tryGetDuration()
				}, 300)
				return
			}

			this.duration = duration
		},

		_bindAudioEvents() {
			if (this.eventsBound) return

			const A = this.AudioContext

			A.onCanplay(() => {
				this.tryGetDuration()
			})

			A.onPlay(() => {
				this.isPlaying = true
			})

			A.onPause(() => {
				this.isPlaying = false
			})

			A.onTimeUpdate(() => {
				this.currentTime = A.currentTime

				if (this.duration > 0) {
					this.sliderValue =
						(A.currentTime / this.duration) * 100
				}
			})

			A.onStop(() => {
				this.currentTime = 0
				this.sliderValue = 0
				this.isPlaying = false
			})

			A.onEnded(() => {
				this.isPlaying = false

				// 单曲循环
				if (this.loop) {
					this.play()
					return
				}

				// 列表下一首
				if (this.audioList.length) {
					const nextIndex = this.audioIndex + 1

					if (nextIndex < this.audioList.length) {
						this.setAudio(
							this.audioList[nextIndex]
						)

						this.initAudio()
					}
				}
			})

			A.onError((err) => {
				console.error('音频错误', err)

				this.isPlaying = false
			})

			this.eventsBound = true
		},

		initAudio(startTime = 0) {
			if (!this.AudioContext) {
				this.AudioContext = uni.getBackgroundAudioManager()
			}
			const A = this.AudioContext

			this._bindAudioEvents()

			A.title = this.audioObj?.title || '音频'
			A.epname = '音频'
			A.singer = '课程'
			A.coverImgUrl =
				this.audioObj?.background || ''

			A.startTime = startTime

			A.src = this.path

			this.play()
		},

		setCurrentTime(value) {
			if (!this.AudioContext) return

			this.AudioContext.seek(value)
		},

		setVolume(volume) {
			this.AudioContext &&
				(this.AudioContext.volume = volume)
		},

		togglePlay() {
			this.isPlaying ?
				this.pause() :
				this.play()
		},

		toggleLoop() {
			this.loop = !this.loop
		},

		setAudioList(list = []) {
			this.audioList = list
		},

		playPrev() {
			if (!this.AudioContext) return

			const target = Math.max(
				this.currentTime - 5,
				0
			)

			this.setCurrentTime(target)
		},

		playNext() {
			if (!this.AudioContext) return

			const target = Math.min(
				this.currentTime + 5,
				this.duration
			)

			this.setCurrentTime(target)
		}
	}
})

export {
	useAudio
}