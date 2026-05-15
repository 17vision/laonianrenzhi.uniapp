<template>
	<view class="resource-page">
		<!-- 顶部标签栏 -->
		<view class="tab-bar">
			<view class="tab-item" :class="{ active: activeTab === item }" v-for="item in tabList" :key="item" @tap="switchTab(item)">
				{{ item }}
			</view>
		</view>

		<!-- 内容列表 -->
		<view class="content-list">
			<view class="content-item" v-for="(item, index) in contentList" :key="index">
				<view class="item-icon">
					<image :src="item.icon" class="icon-img" mode="widthFix"></image>
				</view>
				<view class="item-info">
					<text class="item-title">{{ item.title }}</text>
					<view class="item-bottom">
						<text class="item-type">{{ item.type }}</text>
						<view class="item-view">
							<text class="view-text">{{ item.count }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import {onPullDownRefresh} from '@dcloudio/uni-app'

// 标签
const tabList = ref(['认知训练', '日常照护', '疾病科普', '家属支持']);
const activeTab = ref('认知训练');

// 列表数据（可替换成你的接口）
const contentList = ref([
	{
		icon: '/static/icon1.png',
		title: '居家记忆训练指南',
		type: '认知训练',
		count: '1250次浏览'
	},
	{
		icon: '/static/icon2.png',
		title: '防跌倒安全知识',
		type: '日常照护',
		count: '890次浏览'
	},
	{
		icon: '/static/icon3.png',
		title: '照护者心理调适',
		type: '家属支持',
		count: '560次浏览'
	}
]);

const switchTab = (tabName) => {
	activeTab.value = tabName;
};

onPullDownRefresh(async () => {
	uni.stopPullDownRefresh();
});
</script>

<style scoped>
/* 页面整体 */
.resource-page {
	padding: 30rpx;
	background-color: #FFF8F2;
	min-height: 100vh;
	box-sizing: border-box;
}

/* 标签栏 */
.tab-bar {
	display: flex;
	flex-wrap: nowrap;
	gap: 20rpx;
	margin-bottom: 30rpx;
	overflow-x: auto;
}

.tab-item {
	padding: 18rpx 36rpx;
	background-color: #ffffff;
	color: #666;
	border-radius: 50rpx;
	font-size: 28rpx;
	white-space: nowrap;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.04);
	transition: all 0.2s ease;
}

.tab-item.active {
	background: #4a7eff;
	color: #fff;
	font-weight: 500;
}

/* 列表 */
.content-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.content-item {
	background: #fff;
	border-radius: 24rpx;
	padding: 32rpx;
	display: flex;
	align-items: center;
	gap: 28rpx;
	box-shadow: 0 3rpx 15rpx rgba(0, 0, 0, 0.04);
	transition: transform 0.2s;
}

.content-item:active {
	transform: scale(0.98);
}

/* 图标 */
.item-icon {
	width: 88rpx;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #f5f7fa;
	border-radius: 20rpx;
}

.icon-img {
	width: 50rpx;
	height: 50rpx;
}

/* 信息 */
.item-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.item-title {
	font-size: 32rpx;
	font-weight: 500;
	color: #222;
	line-height: 1.3;
}

.item-bottom {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.item-type {
	font-size: 24rpx;
	color: #999;
	background-color: #f5f7fa;
	padding: 6rpx 14rpx;
	border-radius: 10rpx;
}

.item-view {
	font-size: 24rpx;
	color: #bbb;
}
</style>
