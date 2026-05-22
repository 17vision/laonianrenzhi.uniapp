<template>
	<view class="container evaluate-page">
		<!-- loading -->
		<view v-if="loading" class="loading-wrap">
			<view class="loading-card" v-for="i in 3" :key="i"></view>
		</view>

		<template v-else>
			<!-- 待完成 -->
			<view v-if="pendingList.length" class="px-24 pt-30">
				<view class="section-title">
					<text>待完成评估</text>
					<text class="section-count">{{ pendingList.length }}</text>
				</view>

				<view class="task-card" v-for="item in pendingList" :key="item.id" @tap="goDetail(item)">
					<!-- 顶部 -->
					<view class="task-top">
						<view class="task-tag">
							<view class="dot"></view>
							<text>评估任务</text>
						</view>

						<view class="task-action">✎</view>
					</view>

					<!-- 标题 -->
					<view class="task-title">
						{{ item.template?.name || '未命名量表' }}
					</view>

					<!-- 底部 -->
					<view class="task-bottom">
						<view class="deadline">截止：{{ formatDate(item.stop_at) }}</view>

						<view class="status wait">待完成</view>
					</view>
				</view>
			</view>
		
			<!-- 空状态 -->
			<view class="empty-box" v-if="!pendingList.length && !historyList.length">
				<image class="no-img" src="/static/image/evaluate/no-evaluate-record.png" mode="widthFix"></image>
			
				<view class="empty-title">暂无评估记录</view>
			
				<view class="empty-desc">查看是否有评估任务</view>
			</view>

			<!-- 历史记录 -->
			<view v-if="historyList.length">
				<view class="section-title history-header">
					<text>历史评估</text>
				</view>

				<view class="history-card" v-for="item in historyList" :key="item.id">
					<view class="history-left">
						<view class="history-line"></view>
					</view>

					<view class="history-right">
						<view class="history-name">
							{{ item.template?.name }}
						</view>

						<view class="history-time">
							{{ formatDate(item.finished_at || item.updated_at) }}
						</view>
					</view>

					<view class="history-status success">已完成</view>
				</view>
			</view>
		</template>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';

import { Request } from '@/api/request.js';

const loading = ref(false);

const list = ref([]);

const pendingList = computed(() => {
	return list.value.filter((item) => !item.finished);
});

const historyList = computed(() => {
	return list.value.filter((item) => item.finished);
});

const getList = async () => {
	try {
		loading.value = true;

		const res = await Request('get', '/api/follow-up-plans', {
			page: 1,
			limit: 20
		});

		list.value = res.data || [];
	} catch (e) {
		uni.showToast({
			title: '加载失败',
			icon: 'none'
		});
	} finally {
		loading.value = false;
	}
};

const refresh = async () => {
	await getList();
	uni.stopPullDownRefresh();
};

onShow(() => {
	getList();
});

onPullDownRefresh(() => {
	refresh();
});

const formatDate = (date) => {
	if (!date) return '--';

	return date.replace(/T/g, ' ');
};

const goDetail = (item) => {
	uni.navigateTo({
		url: `/pages/evaluate/mmse/mmse?id=${item.id}`
	});
};
</script>

<style lang="scss" scoped>
$color1: #754800;
$color2: #A26B15;
$color3: #333333;
	
// .evaluate-page {
// 	min-height: 100vh;
// 	background: #f5f7fb;
// 	padding: 24rpx;
// 	box-sizing: border-box;
// }

/* 区块标题 */
.section-title {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;

	text {
		font-size: 32rpx;
		font-weight: 700;
		color: #222;
	}
}

.section-count {
	font-size: 24rpx !important;
	color: #999 !important;
	font-weight: 400 !important;
}

/* 卡片 */
.task-card {
	background: #fff;
	border-radius: 28rpx;
	padding: 28rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
}

.task-top {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.task-tag {
	height: 44rpx;
	padding: 0 20rpx;
	background: linear-gradient(90deg, #ffcc8a, #ffb65c);
	border-radius: 999rpx;

	display: flex;
	align-items: center;

	text {
		font-size: 24rpx;
		color: #8b4d00;
		font-weight: 600;
	}
}

.dot {
	width: 12rpx;
	height: 12rpx;
	border-radius: 50%;
	background: #fff;
	margin-right: 10rpx;
}

.task-action {
	width: 52rpx;
	height: 52rpx;
	border-radius: 16rpx;
	background: #f5f7fb;

	display: flex;
	align-items: center;
	justify-content: center;

	font-size: 28rpx;
	color: #666;
}

.task-title {
	font-size: 36rpx;
	font-weight: 700;
	color: #222;
	margin-bottom: 24rpx;
}

.task-bottom {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.deadline {
	font-size: 24rpx;
	color: #999;
}

.status {
	height: 44rpx;
	padding: 0 18rpx;
	border-radius: 999rpx;

	display: flex;
	align-items: center;
	justify-content: center;

	font-size: 22rpx;
	font-weight: 600;
}

.wait {
	background: rgba(255, 181, 90, 0.15);
	color: #ff9800;
}

.success {
	background: rgba(76, 175, 80, 0.12);
	color: #4caf50;
}

/* 历史记录 */
.history-header {
	margin-top: 40rpx;
}

.history-card {
	position: relative;
	background: #fff;
	border-radius: 24rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;

	display: flex;
	align-items: center;
}

.history-left {
	width: 20rpx;
	display: flex;
	justify-content: center;
}

.history-line {
	width: 6rpx;
	height: 72rpx;
	border-radius: 999rpx;
	background: #4caf50;
}

.history-right {
	flex: 1;
	padding-left: 16rpx;
}

.history-name {
	font-size: 30rpx;
	font-weight: 600;
	color: #222;
	margin-bottom: 8rpx;
}

.history-time {
	font-size: 24rpx;
	color: #999;
}

/* loading */
.loading-card {
	height: 220rpx;
	background: #fff;
	border-radius: 28rpx;
	margin-bottom: 24rpx;
	opacity: 0.6;
}

.empty-box {
		padding-top: 129rpx;

		text-align: center;

		.no-img {
			width: 282rpx;
			height: 282rpx;
			margin-top: 46rpx;
		}

		.empty-title {
			font-size: 38rpx;
			font-weight: bold;
			color: $color1;
		}

		.empty-desc {
			font-size: 28rpx;
			color: $color2;
			margin-top: 11rpx;
		}
	}
</style>
