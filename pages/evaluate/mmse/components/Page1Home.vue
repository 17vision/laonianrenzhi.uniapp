<template>
	<view class="screen">
		<view class="top-box">
			<view class="title">认知筛查</view>
			<view class="desc">MMSE 简易智能精神状态检查 · 全输入版</view>
		</view>

		<view class="card">
			<view class="card-title">功能说明</view>
			<view class="card-list">
				<view class="item">
					<view class="dot"></view>
					全文字输入操作
				</view>
				<view class="item">
					<view class="dot"></view>
					分步计算 + 完整算式
				</view>
				<view class="item">
					<view class="dot"></view>
					随机倒计时自动终止
				</view>
				<view class="item">
					<view class="dot"></view>
					复述录音功能
				</view>
				<view class="item">
					<view class="dot"></view>
					手绘白板 + 自动判分
				</view>
			</view>
			<view class="card-tip">温馨提示：仅临床初步筛查使用，不做医疗诊断依据</view>
		</view>

		<button class="btn" @click="handleStart">
			<text>开始评估</text>
		</button>
	</view>
</template>

<script setup>
const emit = defineEmits(['go']);

const handleStart = () => {
	emit('go', 'q0');
};
</script>

<style lang="scss" scoped>
.screen {
	background: #ffffff;
	padding: 40rpx 32rpx;
	border-radius: 28rpx;
	box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.04);
	box-sizing: border-box;
	animation: fadeIn 0.4s ease forwards;
}

.top-box {
	margin-bottom: 40rpx;
	text-align: center;
}

.title {
	font-size: 44rpx;
	font-weight: 700;
	color: #1d2129;
	margin-bottom: 12rpx;
	letter-spacing: 2rpx;
}

.desc {
	font-size: 26rpx;
	color: #86909c;
	line-height: 1.4;
}

.card {
	background: #fafbfc;
	border-radius: 24rpx;
	padding: 32rpx;
	margin-bottom: 50rpx;
	border: 1rpx solid #f2f3f5;
}

.card-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 20rpx;
}

.card-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.item {
	display: flex;
	align-items: center;
	font-size: 28rpx;
	color: #4e5969;
	line-height: 1.5;
}

/* 小圆点替代 ✅ */
.dot {
	width: 12rpx;
	height: 12rpx;
	border-radius: 50%;
	background: #3b82f6;
	margin-right: 16rpx;
	flex-shrink: 0;
}

.card-tip {
	margin-top: 24rpx;
	padding-top: 20rpx;
	border-top: 1rpx solid #ebeef5;
	font-size: 24rpx;
	color: #f56c6c;
	line-height: 1.4;
}

.btn {
	width: 100%;
	border-radius: 20rpx;
	font-size: 32rpx;
	font-weight: 600;
	background: linear-gradient(135deg, #409eff, #2962ff);
	color: #fff;
	box-shadow: 0 8rpx 20rpx rgba(64, 158, 255, 0.3);
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
}

.btn:active {
	transform: scale(0.95);
	box-shadow: 0 4rpx 12rpx rgba(64, 158, 255, 0.25);
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(20rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
