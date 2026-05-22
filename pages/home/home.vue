```vue
<template>
	<view class="container">
		<!-- 加载骨架 -->
		<view v-if="loading" class="loading-box">
			<view class="skeleton-card" v-for="i in 3" :key="i"></view>
		</view>

		<template v-else>
			<!-- 问候卡片 -->
			<view class="greeting-card" v-if="userStore.info?.firstName">
				<view class="greeting-left">
					<view class="avatar">👋</view>

					<view class="text-box">
						<view class="name">{{ greetingName }}</view>

						<view class="tip">
							您当前共有
							<text class="num">{{ taskCount }}</text>
							项待办事项
						</view>
					</view>
				</view>

				<view class="voice-btn" @tap="playVoice">🔊</view>
			</view>

			<!-- 训练任务 -->
			<view class="task-list" v-if="trainList.length">
				<view class="task-card task-card-1" v-for="(item, index) in trainList" :key="index">
					<!-- 顶部 -->
					<view class="task-card-header">
						<view class="task-tag">
							<text class="tag-dot"></text>
							本周训练任务
						</view>

						<view class="task-icon">🎮</view>
					</view>

					<!-- 课程 -->
					<view class="task-course" v-for="(course, i) in item.course_plan?.items" :key="i">
						<view class="course-left">
							<view class="course-name">
								{{ course.course_name || '-' }}
							</view>

							<view class="course-meta">
								<view class="diff-box">
									<text class="meta-label">难度</text>

									<text class="diff-tag" :class="{
											easy: course.difficulty_str === '简单',
											middle: course.difficulty_str === '中等',
											hard: course.difficulty_str === '困难'
										}">
										{{ course.difficulty_str || '未设置' }}
									</text>
								</view>

								<view class="time-box">⏱ {{ Number(course.duration || 0) / 60 }}分钟</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 评估任务 -->
			<view class="task-list" v-if="latestAssess">
				<view class="task-card" @click="goDetail(latestAssess)">
					<view class="task-card-header">
						<view class="task-tag orange">
							<text class="tag-dot"></text>
							评估任务
						</view>
						
						<view class="task-icon">📝</view>
					</view>
					<view class="task-title">
						{{ latestAssess.template?.name }}
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view class="empty-box" v-if="!trainList.length && !latestAssess">
				<image class="no-img" src="/static/image/home/no-todo-task.png" mode="widthFix"></image>

				<view class="empty-title">暂无待办任务</view>

				<view class="empty-desc">今天没有新的训练与评估安排</view>
			</view>

			<!-- 快速入口 -->
			<view class="quick-access">
				<view class="section-title">⚡ 快速入口</view>

				<view class="button-group">
					<button class="btn btn-primary" @tap="handleTraining">训练计划</button>

					<button class="btn btn-outline" @tap="handleEvaluate">评估任务</button>
				</view>
			</view>
		</template>
	</view>
</template>

<script setup>
	import { computed, ref } from 'vue';
	import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';

	import { playTTS } from '@/utils/tts.js';
	import { Request } from '@/api/request.js';
	import { useUser } from '@/store/user.js';

	const userStore = useUser();

	const loading = ref(false);

	const trainList = ref([]);

	const assessList = ref([]);

	// 问候语
	const greetingText = computed(() => {
		const hour = new Date().getHours();

		if (hour < 12) return '上午好';

		if (hour < 18) return '下午好';

		return '晚上好';
	});

	const greetingName = computed(() => {
		const name = userStore.info?.firstName || '';

		return name ? `${greetingText.value}，${name}` : greetingText.value;
	});

	const voiceText = computed(() => {
		const name = userStore.info?.firstName || '您好';

		const task = taskCount.value;

		if (!task) {
			return `${greetingText.value}，${name}。今天暂无待办任务，祝您今天心情愉快。`;
		}

		return `${greetingText.value}，${name}。您当前共有${task}项待办事项，请记得及时完成训练与评估。`;
	});

	const playVoice = () => {
		playTTS(voiceText.value);
	};
	// 训练数量
	const trainCount = computed(() => {
		return trainList.value.reduce((sum, item) => {
			return sum + (item.course_plan?.items?.length || 0);
		}, 0);
	});

	// 总任务数
	const taskCount = computed(() => {
		return trainCount.value + assessList.value.length;
	});

	// 最新评估
	const latestAssess = computed(() => {
		if (!assessList.value.length) return null;

		return assessList.value[0];
	});

	// 跳转
	const handleTraining = () => {
		uni.switchTab({
			url: '/pages/training/training'
		});
	};

	const handleEvaluate = () => {
		uni.switchTab({
			url: '/pages/evaluate/evaluate'
		});
	};

	const goDetail = (item) => {
		uni.navigateTo({
			url: `/pages/evaluate/mmse/mmse?id=${item.id}`
		});
	};

	// 获取数据
	const init = async () => {
		try {
			loading.value = true;

			const [assessRes, trainRes] = await Promise.all([
				Request(
					'get',
					'/api/follow-up-plans', {
						page: 1,
						limit: 1
					}, {
						redirect: false
					}
				),
				Request(
					'get',
					'/api/patient-plans', {
						page: 1,
						limit: 10
					}, {
						redirect: false
					}
				)
			]);

			assessList.value = assessRes?.data || [];

			trainList.value = trainRes?.data || [];
		} finally {
			loading.value = false;

			uni.stopPullDownRefresh();
		}
	};

	// 下拉刷新
	onPullDownRefresh(() => {
		init();
		
		// setTimeout(() => {
		// 	uni.stopPullDownRefresh()
		// }, 1000)
	});

	onShow(() => {
		setTimeout(init, 1000);
	});
</script>

<style lang="scss" scoped>
	$color1: #754800;
	$color2: #A26B15;
	$color3: #333333;

	.container {
		padding: 0 24rpx;
	}

	/* ================= 加载骨架 ================= */

	.loading-box {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.skeleton-card {
		height: 220rpx;

		border-radius: 28rpx;

		background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%);

		background-size: 400% 100%;

		animation: skeleton 1.4s ease infinite;
	}

	@keyframes skeleton {
		0% {
			background-position: 100% 50%;
		}

		100% {
			background-position: 0 50%;
		}
	}

	/* ================= 问候卡片 ================= */

	.greeting-card {
		background: linear-gradient(135deg, #ffffff, #f8fbff);
		border-radius: 32rpx;
		padding: 34rpx;
		margin-top: 30rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;

		margin-bottom: 28rpx;

		box-shadow: 0 10rpx 30rpx rgba(15, 23, 42, 0.06);

		animation: fadeUp 0.4s ease;
	}

	.greeting-left {
		display: flex;
		align-items: center;

		flex: 1;
		min-width: 0;
	}

	.avatar {
		width: 88rpx;
		height: 88rpx;

		border-radius: 50%;

		background: linear-gradient(135deg, #dbeafe, #bfdbfe);

		display: flex;
		align-items: center;
		justify-content: center;

		font-size: 42rpx;

		margin-right: 24rpx;

		flex-shrink: 0;
	}

	.text-box {
		flex: 1;
		min-width: 0;
	}

	.name {
		font-size: 42rpx;
		font-weight: 700;

		color: #1e293b;

		line-height: 1.5;
	}

	.tip {
		font-size: 28rpx;

		color: #64748b;

		margin-top: 10rpx;

		line-height: 1.6;
	}

	.num {
		color: #2563eb;

		font-size: 34rpx;
		font-weight: 700;

		margin: 0 6rpx;
	}

	.voice-btn {
		width: 72rpx;
		height: 72rpx;

		border-radius: 24rpx;

		background: #eff6ff;

		display: flex;
		align-items: center;
		justify-content: center;

		font-size: 34rpx;
	}

	/* ================= 卡片 ================= */

	.task-card,
	.task-item {
		position: relative;

		background: #fff;

		border-radius: 30rpx;

		padding: 30rpx;

		margin-bottom: 26rpx;

		border: 1rpx solid #edf2f7;

		box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.05);

		overflow: hidden;

		transition: all 0.2s ease;

		animation: fadeUp 0.4s ease;
	}

	.task-card:active,
	.task-item:active {
		transform: scale(0.98);
	}

	.task-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 8rpx;
		background: linear-gradient(90deg, #4181ED, #6BA1E7);
	}
	
	.task-card-1::before {
		background: linear-gradient(90deg, #FFAA50, #FF7D1E);
	}

	/* ================= 顶部 ================= */

	.task-card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;

		margin-bottom: 26rpx;
	}

	.task-tag {
		height: 62rpx;
		padding: 0 30rpx;
		border-radius: 999rpx;
		background: linear-gradient(135deg, #FFEACB, #FBBE80);
		display: flex;
		align-items: center;
		gap: 10rpx;
		color: #7D4500;
		font-size: 26rpx;
		font-weight: bold;
		box-shadow: 0 8rpx 20rpx rgba(59, 130, 246, 0.25);
	}

	.task-tag.orange {
		background: linear-gradient(135deg, #689EFF, #2466EE);

		color: #FFFFFF;

		box-shadow: none;
	}

	.tag-dot {
		width: 12rpx;
		height: 12rpx;

		border-radius: 50%;

		background: #fff;
	}

	.task-icon {
		width: 78rpx;
		height: 78rpx;

		border-radius: 24rpx;

		background: linear-gradient(135deg, #eff6ff, #dbeafe);

		display: flex;
		align-items: center;
		justify-content: center;

		font-size: 38rpx;
	}

	/* ================= 课程 ================= */

	.task-course {
		display: flex;
		align-items: center;
		justify-content: space-between;

		padding: 26rpx 0;

		border-bottom: 1rpx solid #f1f5f9;
	}

	.task-course:last-child {
		border-bottom: none;

		padding-bottom: 0;
	}

	.course-left {
		flex: 1;
		min-width: 0;
	}

	.course-name {
		font-size: 36rpx;
		font-weight: 700;

		color: #0f172a;

		line-height: 1.5;

		margin-bottom: 18rpx;

		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.course-meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;

		gap: 16rpx;
	}

	.meta-label {
		font-size: 24rpx;

		color: #94a3b8;
	}

	.diff-box {
		display: flex;
		align-items: center;

		gap: 10rpx;
	}

	.diff-tag {
		padding: 8rpx 18rpx;

		border-radius: 999rpx;

		font-size: 24rpx;
		font-weight: 600;
	}

	.diff-tag.easy {
		background: #dcfce7;
		color: #16a34a;
	}

	.diff-tag.middle {
		background: #fef3c7;
		color: #d97706;
	}

	.diff-tag.hard {
		background: #fee2e2;
		color: #dc2626;
	}

	.time-box {
		padding: 8rpx 18rpx;

		border-radius: 999rpx;

		background: #f8fafc;

		font-size: 24rpx;

		color: #475569;
	}

	/* ================= 评估任务 ================= */

	.task-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.task-left {
		flex: 1;
		min-width: 0;
	}

	.task-title {
		font-size: 36rpx;
		font-weight: 700;

		color: #1e293b;

		line-height: 1.5;

		margin-top: 12rpx;
	}

	/* ================= 空状态 ================= */
	.empty-box {
		padding-top: 129rpx;
		text-align: center;

		.no-img {
			width: 282rpx;
			height: 282rpx;
		}

		.empty-title {
			font-size: 38rpx;
			font-weight: bold;
			color: $color1;
			margin-top: 46rpx;
		}

		.empty-desc {
			font-size: 28rpx;
			color: $color2;
			margin-top: 11rpx;
		}
	}

	/* ================= 快速入口 ================= */

	.quick-access {
		margin-top: 70rpx;
	}

	.section-title {
		display: block;
		font-size: 36rpx;
		font-weight: 700;
		color: $color3;
		margin-bottom: 24rpx;
	}

	.button-group {
		display: flex;
		gap: 24rpx;
	}

	.btn {
		position: relative;
		flex: 1;
		height: 94rpx;
		border-radius: 20rpx;
		font-size: 32rpx;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		overflow: hidden;
		transition: all 0.2s;
	}

	.btn:active {
		transform: scale(0.97);
	}

	.btn:active::after {
		left: 140%;
	}

	.btn-primary {
		background: linear-gradient(135deg, #FFAA50, #FF7D1E);
		color: #fff;
		box-shadow: 0 7rpx 7rpx rgba(255, 140, 24, 0.50);
	}

	.btn-outline {
		background: #fff;
		color: #FF6700;
		border: 2rpx solid #FFBC8A;
	}

	/* ================= 动画 ================= */

	@keyframes fadeUp {
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
```