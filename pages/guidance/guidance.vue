<template>
	<view class="container">
		<!-- 顶部标签栏 -->
		<view class="tab-bar">
			<view class="tab-item" :class="{ active: req.group_id === group.id }" v-for="group in groups" :key="group.id" @tap="switchTab(group)">
				{{ group.name }}
			</view>
		</view>

		<!-- 内容列表 -->
		<view class="content-list">
			<view class="content-item" v-for="(item, index) in resources" :key="index" @tap="playResource(item)">
				<view class="item-icon">
					<image :src="item.cover" class="icon-img" mode="aspectFill"></image>
				</view>

				<view class="item-info">
					<text class="item-title">{{ item.name }}</text>
					<view class="item-bottom">
						<view class="">
							<text class="item-type" v-if="item.description">{{ item.description }}</text>
						</view>
						<view class="item-view">
							<text class="view-text">{{ item.view_count }} 次浏览</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="load-status">
			<text v-if="loading">加载中...</text>

			<text v-else-if="!hasMore && resources.length">没有更多了</text>
		</view>
	</view>

	<view v-if="player && player.path" class="popup-box" @tap="hidePlayer">
		<view style="text-align: center" @tap.stop="null">
			<video
				v-if="player.type === 1"
				class="video"
				id="playerVideo"
				:src="player.path"
				show-fullscreen-btn
				enable-play-gesture
				controls
				autoplay
				@loadedmetadata="videoReady"
			></video>
			<audio v-if="player.type === 2" class="audio" :src="player.path" :poster="player.cover" :name="player.name" :author="''" controls></audio>
		</view>
	</view>
</template>

<script setup>
import { reactive, ref, nextTick } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { Request } from '@/api/request.js';

const loading = ref(false);

const hasMore = ref(true);

const req = reactive({
	hasData: true,
	page: 1,
	limit: 10,
	group_id: 0
});

const groups = ref([]);
const resources = ref([]);

const popup = ref(null);
const player = ref({
	type: 0,
	path: '',
	cover: '',
	name: ''
});

onLoad(() => {
	fetchGroups();
	hasMore.value = true;
	req.page = 1;
	fetchResources(true);
});

function fetchGroups() {
	Request('get', '/api/resources/groups', '').then((res) => {
		groups.value = [{ id: 0, name: '全部' }].concat(res.map((item) => ({ id: item.id, name: item.name })));
	});
}

function fetchResources(refresh = false) {
	if (loading.value || !hasMore.value) return;

	loading.value = true;

	const data = { ...req };

	if (!data.group_id) {
		delete data.group_id;
	}

	Request('get', '/api/resources', data)
		.then((res) => {
			const list = res.data || [];

			if (refresh) {
				resources.value = list;
			} else {
				resources.value.push(...list);
			}
			hasMore.value = list.length >= req.limit;
		})
		.finally(() => {
			loading.value = false;

			uni.stopPullDownRefresh();
		});
}

function playResource(value) {
	if (value.type === 2) {
		uni.navigateTo({
			url: '/pages/guidance/part/play-page?id=' + value.id
		});
		return;
	}
	player.value = { ...value };

	if (value.type === 1) {
		nextTick(() => {
			setTimeout(() => {
				const ctx = uni.createVideoContext('playerVideo');

				ctx.requestFullScreen();
			}, 300);
		});
	}
}

function videoReady() {
	setTimeout(() => {
		const ctx = uni.createVideoContext('playerVideo');

		ctx.requestFullScreen();
	}, 100);
}

const switchTab = (group) => {
	req.group_id = group.id;
	req.page = 1;

	hasMore.value = true;

	resources.value = [];

	fetchResources(true);
};

function hidePlayer() {
	player.value.path = '';
}

onPullDownRefresh(async () => {
	req.page = 1;
	hasMore.value = true;

	fetchResources(true);
	uni.stopPullDownRefresh();
});
onReachBottom(() => {
	if (loading.value) return;

	if (!hasMore.value) return;

	req.page++;

	fetchResources();
});
</script>

<style lang="scss" scoped>
/* 页面整体 */
.container {
	padding: 0 24rpx;
	min-height: 100vh;
}

.popup-box {
	position: fixed;
	left: 0;
	bottom: 0;
	width: 100vw;
	z-index: 9999;
	background-color: #fff;
	padding: 72rpx 0rpx 0 0rpx;
	border-top-left-radius: 30rpx;
	border-top-right-radius: 30rpx;

	&::after {
		content: '';
		position: absolute;
		background-color: rgba(0, 0, 0, 0.81);
		width: 750rpx;
		height: 100vh;
		left: 0;
		bottom: 0;
		z-index: 1;
	}

	.video,
	.audio {
		width: 750rpx;
		position: relative;
		z-index: 666;
	}
}

/* 标签栏 */
.tab-bar {
	display: flex;
	flex-wrap: nowrap;
	gap: 20rpx;
	margin-top: 32rpx;
	overflow-x: auto;
	padding-bottom: 20rpx;

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
		background: linear-gradient(135deg, #ffaa50, #ff7d1e);
		color: #fff;
		box-shadow: 0 7rpx 7rpx rgba(255, 140, 24, 0.5);
		font-weight: 500;
	}
}

/* 列表 */
.content-list {
	display: flex;
	flex-direction: column;
	margin: 38rpx 0 0;
	gap: 20rpx;

	.content-item {
		background: #fff;
		border-radius: 30rpx;
		padding: 20rpx 25rpx 20rpx 20rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 3rpx 15rpx rgba(255, 229, 206, 1);
		transition: transform 0.2s;
		position: relative;
		overflow: hidden;
		// border-right: 4px solid #FFAA50;

		&::before {
			content: '';

			position: absolute;

			right: 0rpx;
			top: 0rpx;

			width: 16rpx;
			height: 100%;

			background: linear-gradient(180deg, #ffb15d 0%, #ff7d1e 100%);

			border-radius: 0 30rpx 30rpx 0;

			z-index: 1;
		}

		.icon-img {
			display: flex;
			width: 170rpx;
			height: 170rpx;
			border-radius: 30rpx;
		}

		/* 信息 */
		.item-info {
			flex: 1;
			display: flex;
			flex-direction: column;
			margin-left: 35rpx;
			position: relative;
			z-index: 22;

			.item-title {
				font-size: 36rpx;
				font-weight: bold;
				color: #333333;
			}

			.item-bottom {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-top: 28rpx;

				.item-type {
					padding: 8rpx 10rpx;
					font-size: 26rpx;
					font-weight: bold;
					border-radius: 10rpx;
					color: #ff7d1e;
					background-color: #ffebd2;
					display: -webkit-box;
					-webkit-line-clamp: 3;
					-webkit-box-orient: vertical;
					&.item-type-1 {
						color: #ff7d1e;
						background-color: #ffebd2;
					}

					&.item-type-2 {
						color: #28a064;
						background-color: #dcfaeb;
					}

					&.item-type-3 {
						color: #a05ac8;
						background-color: #f0e1ff;
					}
				}

				.item-view {
					font-size: 22rpx;
					color: #999999;
				}
			}
		}
	}
}
.load-status {
	text-align: center;
	padding: 30rpx;
	color: #999;
	font-size: 24rpx;
}
</style>
