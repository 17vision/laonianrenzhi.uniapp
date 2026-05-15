<template>
	<view class="screen active">
		<view class="title">地点认知</view>
		<view class="progress-wrap">
			<view class="progress-text">进度：2/8</view>
			<view class="progress">
				<view class="progress-bar" style="width: 25%"></view>
			</view>
		</view>

		<view class="card">
			<view class="item" v-for="field in formFields" :key="field.key">
				<text>{{ field.label }}</text>

				<!-- 统一输入框 -->
				<input
					v-if="field.type === 'input'"
					class="input"
					:placeholder="field.placeholder"
					v-model="field.userAnswer"
				/>

				<!-- 多行输入框 -->
				<textarea
					v-else-if="field.type === 'textarea'"
					class="textarea"
					:placeholder="field.placeholder"
					v-model="field.userAnswer"
				/>
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
// 比较规则枚举（前后端通用）
// ==========================
const CompareType = {
	Equal: 1,		// 相等
	Include: 2		// 相似，近义词
};

// ==============================================
// 题目配置（统一格式）
// ==============================================
const formFields = ref([
	{
		key: 'province',
		label: '1. 所在省市',
		type: 'input',
		placeholder: '请输入省市',
		required: true,
		total_score: 1,
		answer: '',
		compare_type: CompareType.Equal,
		module: 'location_cognition',
		module_name: '地点定向力',
		userAnswer: ''
	},
	{
		key: 'district',
		label: '2. 所在区县',
		type: 'input',
		placeholder: '请输入区县',
		required: true,
		total_score: 1,
		answer: '',
		compare_type: CompareType.Equal,
		module: 'location_cognition',
		module_name: '地点定向力',
		userAnswer: ''
	},
	{
		key: 'street',
		label: '3. 所在街道',
		type: 'input',
		placeholder: '请输入街道',
		required: true,
		total_score: 1,
		answer: '',
		compare_type: CompareType.Equal,
		module: 'location_cognition',
		module_name: '地点定向力',
		userAnswer: ''
	},
	{
		key: 'place',
		label: '4. 当前场所',
		type: 'textarea',
		total_score: 1,
		placeholder: '输入场所',
		required: true,
		answer: '',
		compare_type: CompareType.Equal,
		module: 'location_cognition',
		module_name: '地点定向力',
		userAnswer: ''
	}
]);

// ==============================================
// 🔥 全局统一数组：所有题目都在这里
// ==============================================
const questions = ref([]);

// ==============================================
// 从统一数组反显
// ==============================================
const initFromQuestions = () => {
	if (!props.form?.questions) return;
	questions.value = props.form.questions;

	formFields.value.forEach(field => {
		const target = questions.value.find(q => q.key === field.key);
		if (target) {
			field.userAnswer = target.userAnswer || '';
		}
	});
};

onMounted(() => {
	initFromQuestions();
});

watch(
	() => props.form,
	() => initFromQuestions(),
	{ deep: true }
);

// ==============================================
// ✅ 提交：全部写入统一数组
// ==============================================
const handleNext = () => {
	for (const field of formFields.value) {
		if (field.required && !field.userAnswer) {
			uni.showToast({ title: field.placeholder, icon: 'none' });
			return;
		}
	}

	const newItems = formFields.value.map(field => ({
		key: field.key,
		label: field.label,
		type: field.type,
		total_score: field.total_score,
		compare_type: field.compare_type,
		answer: field.answer,
		userAnswer: field.userAnswer,
		module: field.module,
		module_name: field.module_name
	}));

	// 更新到统一数组
	newItems.forEach(item => {
		const index = questions.value.findIndex(q => q.key === item.key);
		if (index >= 0) {
			questions.value[index] = item;
		} else {
			questions.value.push(item);
		}
	});

	// 只提交一个数组
	emit('submit', { questions: questions.value });
	emit('go', 'q3');
};
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
	color: #1d2129;
	margin: 20rpx 0;
}
.progress-wrap {
	margin: 20rpx 0;
}
.progress-text {
	font-size: 24rpx;
	color: #86909c;
	margin-bottom: 8rpx;
}
.progress {
	height: 10rpx;
	background: #edf1f5;
	border-radius: 999rpx;
	overflow: hidden;
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
	border: 1rpx solid #f0f2f5;
}
.item {
	margin: 18rpx 0;
	display: flex;
	flex-direction: column;
	gap: 10rpx;
	font-size: 28rpx;
	color: #4e5969;
}
.input {
	width: 100%;
	height: 84rpx;
	padding: 0 22rpx;
	border-radius: 14rpx;
	font-size: 28rpx;
	background: #f7f8fa;
	box-sizing: border-box;
	border: none;
}
.textarea {
	width: 100%;
	padding: 22rpx;
	border-radius: 14rpx;
	font-size: 28rpx;
	background: #f7f8fa;
	box-sizing: border-box;
	border: none;
	min-height: 160rpx;
}

.btn {
	width: 100%;
	border-radius: 18rpx;
	font-size: 30rpx;
	font-weight: 600;
	margin: 18rpx 0;
	background: linear-gradient(135deg, #3b82f6, #2563eb);
	color: #fff;
	border: none;
}
</style>