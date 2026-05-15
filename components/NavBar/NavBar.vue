<template>
	<view
		class="navbar"
		:class="{ border: showBorder }"
		:style="{ height: inner.navBarHeight + 'px', 'padding-top': inner.statusBarHeight + 'px', 'background-color': bgColor, 'border-color': borderColor }"
	>
		<view class="wrap" :style="{ 'padding-left': inner.menuRight + 'px', 'padding-right': inner.menuRight + 'px' }">
			<view class="left-wrap" :style="{ width: leftPartWidth + 'px' }">
				<view v-if="inner.onlyPage" class="icon" @tap="goHome">
					<view class="iconfont icon-home text-size-36" :style="{ color: iconColor }"></view>
				</view>

				<view v-else class="icon" @tap="goBack">
					<view class="iconfont icon-back text-size-36" :style="{ color: iconColor }"></view>
				</view>

				<slot name="left"></slot>
			</view>

			<view class="center-wrap" :style="{ 'padding-right': inner.menuWidth + 'px' }">
				<slot></slot>
				<view v-if="title" class="title" :style="{ color: titleColor, 'font-size': titleSize }">
					<text>{{ title }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { GetNavAndDevice } from '@/hooks/util.js';
import { onLoad } from '@dcloudio/uni-app';

const navAndDevice = GetNavAndDevice();

const inner = reactive({
	onlyPage: false,
	statusBarHeight: navAndDevice.navTop,
	navBarHeight: navAndDevice.navHeight + navAndDevice.navTop,
	menuRight: navAndDevice.navSafeX,
	menuWidth: navAndDevice.capsuleWidth,
	winWidth: navAndDevice.screenWidth,
	winHeight: navAndDevice.screenHeight
});

const props = defineProps({
	title: {
		type: String,
		default: ''
	},
	showBorder: {
		type: Boolean,
		default: false
	},
	borderColor: {
		type: String,
		default: '#F2F2F2'
	},
	bgColor: {
		type: String,
		default: ''
	},
	iconColor: {
		type: String,
		default: '#fff'
	},
	titleColor: {
		type: String,
		default: '#fff'
	},
	titleSize: {
		type: String,
		default: '36rpx'
	},
	leftWidth: {
		type: Number,
		default: 0
	}
});

const leftPartWidth = computed(() => {
	if (props.leftWidth > 0) {
		return props.leftWidth;
	}
	return inner.menuWidth;
});

onMounted(() => {
	const pages = getCurrentPages();
	inner.onlyPage = pages.length == 1;
});

const goHome = function () {
	// uni.switchTab({
	// 	url: '/pages/home/index'
	// });

	uni.navigateTo({
		url: '/pages/home/index'
	});
};

const goBack = function () {
	uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.border {
	border-bottom: 1upx solid;
}

.navbar {
	display: flex;
	box-sizing: border-box;
	width: 750upx;
	position: fixed;
	top: 0;
	left: 0;
	z-index: 99999;
	transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);

	.wrap {
		display: flex;
		flex-direction: row;
		align-items: center;
		box-sizing: border-box;
		width: 100%;

		.left-wrap {
			display: flex;
			height: 100%;

			.icon {
				display: flex;
				align-items: center;
				box-sizing: border-box;
				padding: 0 12rpx;
				height: 100%;
				font-size: 36rpx;
			}
		}

		.center-wrap {
			width: 100%;
			height: 100%;
			box-sizing: border-box;

			.title {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 100%;
				height: 100%;
				box-sizing: border-box;
				font-weight: 500;
				padding: 0 70rpx;

				text {
					overflow: hidden;
					text-overflow: ellipsis !important;
					white-space: nowrap;
				}
			}
		}
	}
}
</style>
