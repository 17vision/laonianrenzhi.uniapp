<template>
	<view class="screen active">
		<view class="title">指令执行</view>
		<view class="progress-wrap">
			<view class="progress-text">进度：7/8</view>
			<view class="progress">
				<view class="progress-bar" style="width: 87.5%"></view>
			</view>
		</view>

		<view class="card">
			<view class="bold text-center">举起右手,摸鼻子,眨眼睛</view>
			<input class="input" v-model="commandInput" placeholder="按顺序输入步骤，逗号分隔" />
		</view>

		<view class="card">
			<view class="bold">阅读执行：请闭上眼睛</view>
			<view class="select-group">
				<button class="select-btn" :class="readInput === '已完成' ? 'active' : ''" @click="readInput = '已完成'">已完成</button>
				<button class="select-btn" :class="readInput === '未完成' ? 'active' : ''" @click="readInput = '未完成'">未完成</button>
			</view>
		</view>

		<button class="btn" @click="handleNext">下一页</button>
	</view>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
	form: Object
});
const emit = defineEmits(['go', 'submit']);

// ==========================
// 全局统一枚举
// ==========================
const CompareType = {
	Equal: 1,
	Include: 2
};

// ==========================
// ✅ 题目结构 100% 对齐 questions
// ==========================
const formFields = ref([
	{
		key: 'command_3_steps',
		label: '三步指令执行',
		type: 'command',
		total_score: 3,
		compare_type: CompareType.Include,
		value: '举起右手,摸鼻子,眨眼睛',
		userAnswer: '',
		module: 'command_ability',
		module_name: '指令执行能力'
	},
	{
		key: 'command_close_eye',
		label: '闭眼指令执行',
		type: 'command',
		total_score: 1,
		compare_type: CompareType.Equal,
		value: '已完成',
		userAnswer: '',
		module: 'command_ability',
		module_name: '指令执行能力'
	}
]);

// 输入绑定
const commandInput = ref('');
const readInput = ref('');

// 统一校验
const validateAll = () => {
	if (!commandInput.value.trim()) return false;
	if (!readInput.value.trim()) return false;
	return true;
};

// ==========================
// ✅ 提交：自动加入 questions
// ==========================
const handleNext = () => {
	if (!validateAll()) {
		uni.showToast({ title: '请完成所有题目', icon: 'none' });
		return;
	}

	// 保存答案
	formFields.value[0].userAnswer = commandInput.value;
	formFields.value[1].userAnswer = readInput.value;

	// 合并到全局 questions（和你所有题目统一）
	const questions = props.form.questions || [];
	formFields.value.forEach((item) => {
		const idx = questions.findIndex((q) => q.key === item.key);
		if (idx >= 0) {
			questions[idx] = { ...questions[idx], ...item };
		} else {
			questions.push(item);
		}
	});

	emit('submit', { questions });
	emit('go', 'q8');
};

// ==========================
// ✅ 缓存恢复
// ==========================
const restoreCache = () => {
	if (!props.form?.questions) return;
	const questions = props.form.questions;

	formFields.value.forEach((field) => {
		const target = questions.find((q) => q.key === field.key);
		if (target) {
			field.userAnswer = target.userAnswer;
		}
	});

	commandInput.value = formFields.value[0].userAnswer || '';
	readInput.value = formFields.value[1].userAnswer || '';
};

onMounted(() => restoreCache());
watch(() => props.form, restoreCache, { deep: true });
</script>

<style lang="scss" scoped>
.screen {
	background: #fff;
	padding: 32rpx 28rpx;
	border-radius: 24rpx;
}
.title {
	font-size: 38rpx;
	font-weight: 700;
	text-align: center;
	margin: 20rpx 0;
}
.progress-wrap {
	margin: 20rpx 0;
}
.progress-text {
	font-size: 24rpx;
	color: #86909c;
}
.progress {
	height: 10rpx;
	background: #edf1f5;
	border-radius: 999rpx;
}
.progress-bar {
	height: 100%;
	background: linear-gradient(90deg, #3b82f6, #22c55e);
}
.card {
	background: #fff;
	border-radius: 20rpx;
	padding: 26rpx;
	margin: 20rpx 0;
}
.bold {
	font-weight: 600;
	font-size: 28rpx;
	text-align: center;
	margin-bottom: 15rpx;
}
.text-center {
	text-align: center;
}

/* 选择按钮样式 */
.select-group {
	display: flex;
	gap: 20rpx;
	margin-top: 20rpx;
}
.select-btn {
	flex: 1;
	height: 80rpx;
	line-height: 80rpx;
	text-align: center;
	border-radius: 16rpx;
	background: #f7f8fa;
	font-size: 28rpx;
	border: 2rpx solid transparent;
}
.select-btn.active {
	background: #3b82f6;
	color: #fff;
	border-color: #2563eb;
}

.input {
	width: 100%;
	height: 84rpx;
	padding: 0 22rpx;
	border-radius: 14rpx;
	font-size: 28rpx;
	box-sizing: border-box;
	background: #f7f8fa;
	margin: 10rpx 0;
}
.btn {
	width: 100%;
	border-radius: 18rpx;
	font-size: 30rpx;
	margin: 18rpx 0;
	background: linear-gradient(135deg, #3b82f6, #2563eb);
	color: #fff;
	height: 88rpx;
	line-height: 88rpx;
}
</style>
