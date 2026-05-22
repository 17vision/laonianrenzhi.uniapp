<template>
	<view class="container">
		<!-- 顶部标签栏 -->
		<view class="tab-bar">
			<view class="tab-item" :class="{ active: req.group_id === group.id }" v-for="group in groups"
				:key="group.id" @tap="switchTab(group)">
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
						<text class="item-type">{{ item.description }}</text>
						<view class="item-view">
							<text class="view-text">{{ item.view_count }} 次浏览</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>

	<view v-if="player && player.path" class="popup-box" @tap="hidePlayer">
		<view style="text-align: center;" @tap.stop="null">
			<video v-if="player.type === 1" class="video" :src="player.path" controls></video>
			<audio v-if="player.type === 2" class="audio" :src="player.path" :poster="player.cover" :name="player.name" :author="''" controls></audio>
		</view>
					
	</view>
</template>

<script setup>
	import { reactive, ref } from 'vue';
	import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
	import { Request } from '@/api/request.js'

	const loading = ref(false)

	const req = reactive({
		hasData: true,
		page: 1,
		limit: 20,
		group_id: 0
	})

	const groups = ref([])
	const resources = ref([])

	const popup = ref(null)
	const player = ref({
		type: 0,
		path: '',
		cover: '',
		name: ''
	})

	onLoad(() => {
		fetchGroups()

		fetchResources()
	})

	function fetchGroups() {
		Request('get', '/api/resources/groups', '').then((res) => {
			groups.value = [{ id: 0, name: '全部' }].concat(res.map((item) => ({ id: item.id, name: item.name })))
		})
	}

	function fetchResources() {
		if (loading.value) {
			return
		}
		loading.value = true

		const data = { ...req }
		if (!data.group_id) {
			delete data.group_id
		}

		Request('get', '/api/resources', data).then((res) => {
			loading.value = false
			resources.value = res.data
		})
	}

	function playResource(value) {
		player.value = { ...value }
	}

	const switchTab = (group) => {
		req.group_id = group.id
		req.page = 1;
		resources.value = [];

		fetchResources()
	};
	
	function hidePlayer() {
		player.value.path = ''
	}

	onPullDownRefresh(async () => {
		uni.stopPullDownRefresh();
	});
</script>

<style lang="scss" scoped>
	/* 页面整体 */
	.container {
		padding: 0 24rpx;
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
			background-color: rgba(0,0,0,0.81);
			width: 750rpx;
			height: 100vh;
			left: 0;
			bottom: 0;
			z-index: 1;
		}
		
		.video,.audio {
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
			background: linear-gradient(135deg, #FFAA50, #FF7D1E);
			color: #fff;
			box-shadow: 0 7rpx 7rpx rgba(255, 140, 24, 0.50);
			font-weight: 500;
		}
	}

	/* 列表 */
	.content-list {
		display: flex;
		flex-direction: column;
		margin-top: 38rpx;
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
			// border-right: 4px solid #FFAA50;

			&:before {
				content: '';
				position: absolute;
				right: 0;
				top: 0;
				width: 60rpx;
				height: 208rpx;
				background: linear-gradient(180deg, #FFAA50 0%, #FF7D1E 100%);
				border-top-right-radius: 130rpx;
				border-bottom-right-radius: 130rpx;
				border-radius: 30rpx;
				z-index: 1;
			}

			&:after {
				content: '';
				position: absolute;
				right: 8rpx;
				top: 0;
				width: 52rpx;
				height: 208rpx;
				border-radius: 16rpx;
				background: #fff;
				z-index: 2;
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
						color: #FF7D1E;
						background-color: #FFEBD2;

						&.item-type-1 {
							color: #FF7D1E;
							background-color: #FFEBD2;
						}

						&.item-type-2 {
							color: #28A064;
							background-color: #DCFAEB;
						}

						&.item-type-3 {
							color: #A05AC8;
							background-color: #F0E1FF;
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
</style>