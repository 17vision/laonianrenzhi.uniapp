<template>
	<view class="play-page">
		<!-- 背景图片 -->
		<video v-if="isVideoBg" class="bg-image" :src="audio.background" object-fit="cover" autoplay loop muted :controls="false" />

		<image v-else class="bg-image" :src="audio.background" mode="aspectFill" />
		<view class="bg-mask"></view>

		<!-- 顶部操作栏 -->
		<view class="header">
			<view class="back-btn" @tap="goBack">
				<image src="/static/image/guidance/icon-back.svg" mode=""></image>
			</view>
		</view>
		<view class="content">
			<view class="title">{{ initAudio.audioObj?.title }}</view>
		</view>
		<!-- 播放控制区域 -->
		<view class="player-controls">
			<view class="progress-bar">
				<slider
					:interval="10000"
					circular
					activeColor="#fff"
					style="margin: 2px 4px"
					backgroundColor="#ffffff80"
					:step="0.01"
					block-size="10"
					:value="initAudio.getSliderValue"
					@change="sliderChange"
				/>
			</view>

			<view class="time-info">
				<text>{{ formatSeconds(initAudio.currentTime) }}</text>
				<text>{{ formatSeconds(initAudio.duration) }}</text>
			</view>

			<view class="control-buttons">
				<view class=""></view>
				<view class="btn-center">
					<image class="btn-prev" src="/static/image/guidance/houtui5s.svg" @tap="initAudio.playPrev" mode=""></image>
					<view class="btn-play-box" @tap="initAudio.togglePlay">
						<image v-if="initAudio.getIsPlaying" src="/static/image/guidance/zanting.svg" mode=""></image>
						<image v-else src="/static/image/guidance/bofang.svg" mode=""></image>
					</view>
					<image class="btn-next" src="/static/image/guidance/kuaijin5s.svg" @tap="initAudio.playNext" mode=""></image>
				</view>
				<view class=""></view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue';
import { Request } from '@/api/request.js';
import { onLoad } from '@dcloudio/uni-app';
import { formatSeconds } from '@/utils/index.js';
import { useAudio } from '@/store/audio.js';

const initAudio = useAudio();

const audio = computed(() => {
	return initAudio.audioObj || {};
});

onLoad(async (option) => {
	const res = await Request('get', '/api/resources/' + option.id);

	if (!res) return;
	if (!initAudio.getUrl || !initAudio.isPathEqual(res.path)) {
		initAudio.stop();

		initAudio.setAudio({
			...res
		});

		initAudio.initAudio();
	}
});

const sliderChange = (e) => {
	const value = e.detail.value;

	const currentTime = (value / 100) * initAudio.duration;

	initAudio.setCurrentTime(currentTime);
};

const goBack = () => {
	uni.navigateBack().catch(() => {
		uni.switchTab({
			url: '/pages/home/home'
		});
	});
};

const isVideoBg = computed(() => {
	const bg = audio.value.background;

	return /\.(mp4|mov|webm)$/i.test(bg || '');
});
</script>

<style lang="scss" scoped>
.play-page {
	position: relative;
	width: 100vw;
	height: 100vh;
	overflow: hidden;

	.bg-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
	}

	.bg-mask {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.3);
		z-index: 2;
	}

	.header {
		position: relative;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: calc(var(--status-bar-height) + 30rpx) 40rpx 0;
		z-index: 3;

		image {
			margin-top: 20rpx;
			width: 80rpx;
			height: 80rpx;
		}
	}

	.content {
		position: absolute;
		padding: 0 40rpx;
		bottom: 380rpx;
		z-index: 3;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 40rpx;
		width: 100%;
		overflow: auto;

		.my-swiper {
			height: 100%; // 根据需要设置高度
		}

		.swiper-item {
			display: flex;
			justify-content: center;
			align-items: center;
		}

		.title {
			font-size: 48rpx;
			color: #fff;
			font-weight: bold;
			margin-bottom: 20rpx;
			overflow: hidden;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
		}

		image {
			margin-top: 12rpx;
		}

		.subtitle {
			font-size: 32rpx;
			color: rgba(255, 255, 255, 0.8);
		}

		.text {
			margin: 12rpx 0;
			color: #fff;
		}
	}

	.player-controls {
		position: absolute;
		bottom: 100rpx;
		left: 0;
		width: 100%;
		padding: 0 40rpx;
		z-index: 3;

		.progress-bar {
			width: 100%;
		}

		.time-info {
			display: flex;
			justify-content: space-between;
			margin-bottom: 60rpx;

			text {
				font-size: 24rpx;
				color: rgba(255, 255, 255, 0.8);
			}
		}

		.control-buttons {
			display: flex;
			justify-content: space-between;
			align-items: center;

			image {
				width: 48rpx;
				height: 48rpx;

				&.btn-play {
					width: 80rpx;
					height: 80rpx;
				}

				&.active {
					filter: brightness(0) saturate(100%) invert(53%) sepia(93%) saturate(1352%) hue-rotate(220deg) brightness(101%) contrast(96%);
				}
			}

			.btn-center {
				display: flex;
				justify-content: space-between;
				align-items: center;
				gap: 80rpx;
			}

			.btn-play-box {
				width: 90rpx;
				height: 90rpx;
				background: #fff;
				border-radius: 25rpx;
				display: flex;
				justify-content: center;
				align-items: center;

				image {
					width: 40rpx;
					height: 40rpx;
				}
			}

			.btn-next {
			}
		}
	}

	.popup-box {
		background-color: #fff;
		border-radius: 30rpx;
		height: 500rpx;
		padding: 30rpx 0;

		.list {
			height: 100%;
			overflow-y: auto;
		}

		.item-box {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 24rpx 40rpx;
			border-bottom: 1px solid rgba(0, 100, 255, 0.08);
			transition: all 0.2s ease;

			.item-title {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin: 20rpx 0;
				padding: 10rpx 0;
				transition: all 0.3s ease; // 交互时更顺滑
			}

			.item-time {
				font-size: 24rpx;
				color: #999;
				font-weight: 400;
			}

			&.action {
				color: #7b68ee;
				background-color: #d9d9d980;
				cursor: pointer;
			}
		}
	}
}
</style>
