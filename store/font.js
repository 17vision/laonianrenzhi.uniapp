import {
	defineStore
} from 'pinia'
export const useFontStore = defineStore('font', {
	state: () => ({
		mode: 'normal' // normal / large / xlarge
	}),
	actions: {
		setMode(m) {
			this.mode = m
			uni.setStorageSync('fontMode', m)
		},

		load() {
			const m = uni.getStorageSync('fontMode') || 'normal'
			this.setMode(m)
		}
	}
})