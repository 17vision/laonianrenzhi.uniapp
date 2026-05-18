<template>
	<view class="screen">
		<view class="top-box">
			<view class="title">时间认知</view>
			<view class="subtitle">请根据当前实际情况选择</view>
		</view>

		<view class="progress-wrap">
			<view class="progress-text">评估进度：1/8</view>
			<view class="progress">
				<view class="progress-bar" style="width: 12.5%"></view>
			</view>
		</view>

		<view class="card">
			<view class="item" v-for="field in formFields" :key="field.key">
				<text class="question">{{ field.label }}</text>
				<picker @change="(e) => onPickerChange(e, field)" :value="field.index" :range="field.options">
					<input class="picker" :placeholder="field.placeholder" v-model="field.userAnswer" readonly />
				</picker>
			</view>
		</view>

		<button class="btn-next" @click="handleNext">下一页</button>
	</view>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
const props = defineProps({ form: Object });
const emit = defineEmits(['go', 'submit']);

// 答案比较规则
const CompareType = {
	Equal: 1,
	Include: 2
};

// ==============================================
// 题目配置（统一格式）
// ==============================================
const formFields = ref([
	{
		key: 'year',
		label: '1. 现在是哪一年？',
		type: 'picker',
		placeholder: '请选择年份',
		required: true,
		total_score: 1,
		options: [],
		index: 0,
		compare_type: CompareType.Equal,
		value: '',
		module: 'time_perception',
		module_name: '时间定向力',
		userAnswer: ''
	},
	{
		key: 'month',
		label: '2. 现在是几月份？',
		type: 'picker',
		placeholder: '请选择月份',
		required: true,
		total_score: 1,
		options: [],
		index: 0,
		compare_type: CompareType.Equal,
		value: '',
		module: 'time_perception',
		module_name: '时间定向力',
		userAnswer: ''
	},
	{
		key: 'day',
		label: '3. 今天是几号？',
		type: 'picker',
		placeholder: '请选择日期',
		required: true,
		total_score: 1,
		options: [],
		index: 0,
		compare_type: CompareType.Equal,
		value: '',
		module: 'time_perception',
		module_name: '时间定向力',
		userAnswer: ''
	},
	{
		key: 'week',
		label: '4. 今天是星期几？',
		type: 'picker',
		placeholder: '请选择星期几',
		required: true,
		total_score: 1,
		options: [],
		index: 0,
		compare_type: CompareType.Equal,
		value: '',
		module: 'time_perception',
		module_name: '时间定向力',
		userAnswer: ''
	},
	{
		key: 'season',
		label: '5. 现在是什么季节？',
		type: 'picker',
		placeholder: '请选择季节',
		required: true,
		total_score: 1,
		options: [],
		index: 0,
		compare_type: CompareType.Equal,
		value: '',
		module: 'time_perception',
		module_name: '时间定向力',
		userAnswer: ''
	}
]);

// ==============================================
// 🔥 全局统一一个数组：questions
// ==============================================
const questions = ref([]);

// ================= 日期工具 =================
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth();
const currentDay = now.getDate();
const currentWeek = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][now.getDay()];

const getSeason = () => {
	const m = now.getMonth() + 1;
	if ([3, 4, 5].includes(m)) return '春季';
	if ([6, 7, 8].includes(m)) return '夏季';
	if ([9, 10, 11].includes(m)) return '秋季';
	return '冬季';
};

// 初始化下拉选项
const initOptions = () => {
	const yf = formFields.value.find((f) => f.key === 'year');
	const mf = formFields.value.find((f) => f.key === 'month');
	const wf = formFields.value.find((f) => f.key === 'week');
	const sf = formFields.value.find((f) => f.key === 'season');
	const df = formFields.value.find((f) => f.key === 'day');

	yf.options = ['请选择'];
	for (let i = currentYear - 10; i <= currentYear + 10; i++) yf.options.push(i + '年');
	yf.value = `${currentYear}年`;

	mf.options = ['请选择', ...Array.from({ length: 12 }, (_, i) => `${i + 1}月`)];
	mf.value = `${currentMonth + 1}月`;

	wf.options = ['请选择', '星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
	wf.value = currentWeek;

	sf.options = ['请选择', '春季', '夏季', '秋季', '冬季'];
	sf.value = getSeason();

	refreshDayList();
	df.value = String(currentDay);
};

// 刷新日期
function refreshDayList() {
	const df = formFields.value.find((f) => f.key === 'day');
	const y = parseInt(formFields.value.find((f) => f.key === 'year')?.userAnswer) || currentYear;
	const m = parseInt(formFields.value.find((f) => f.key === 'month')?.userAnswer) || currentMonth + 1;
	const days = new Date(y, m, 0).getDate();
	df.options = ['请选择', ...Array.from({ length: days }, (_, i) => `${i + 1}`)];
}

// 选择器事件
const onPickerChange = (e, field) => {
	const idx = Number(e.detail.value);
	field.index = idx;
	field.userAnswer = idx === 0 ? '' : field.options[idx];

	if (field.key === 'year' || field.key === 'month') {
		refreshDayList();
		const df = formFields.value.find((f) => f.key === 'day');
		df.index = 0;
		df.userAnswer = '';
	}
};

// ==============================================
// ✅ 从统一数组反显
// ==============================================
const initFromQuestions = () => {
	if (!props.form?.questions) return;
	questions.value = props.form.questions;

	formFields.value.forEach((field) => {
		const q = questions.value.find((x) => x.key === field.key);
		if (q) {
			field.userAnswer = q.userAnswer || '';
			field.index = field.options.findIndex((o) => o === field.userAnswer) || 0;
		}
	});
	refreshDayList();
};

// ==============================================
// ✅ 提交：全部写入统一数组 questions
// ==============================================
const handleNext = () => {
	for (const f of formFields.value) {
		if (f.required && !f.userAnswer) {
			uni.showToast({ title: f.placeholder, icon: 'none' });
			return;
		}
	}

	const newItems = formFields.value.map((f) => ({
		key: f.key,
		label: f.label,
		type: f.type,
		total_score: f.total_score,
		compare_type: f.compare_type,
		value: f.value, // 正确答案
		userAnswer: f.userAnswer, // 用户答案
		module: f.module,
		module_name: f.module_name
	}));

	// 覆盖或新增
	newItems.forEach((item) => {
		const i = questions.value.findIndex((x) => x.key === item.key);
		if (i >= 0) questions.value[i] = item;
		else questions.value.push(item);
	});

	// 🔥 只提交一个数组
	emit('submit', { questions: questions.value });
	emit('go', 'q2');
};

onMounted(() => {
	initOptions();
	initFromQuestions();
});

watch(
	() => props.form,
	() => initFromQuestions(),
	{ deep: true }
);
</script>

<style lang="scss" scoped>
.screen {
	background: #fff;
	padding: 40rpx 32rpx;
	border-radius: 28rpx;
	box-sizing: border-box;
}

.top-box {
	text-align: center;
	margin-bottom: 30rpx;
}

.title {
	font-size: 44rpx;
	font-weight: 700;
	color: #1d2129;
}

.subtitle {
	font-size: 26rpx;
	color: #86909c;
	margin-top: 8rpx;
}

.progress-wrap {
	margin-bottom: 36rpx;
}

.progress-text {
	font-size: 24rpx;
	color: #6b7280;
}

.progress {
	height: 12rpx;
	background: #f3f4f6;
	border-radius: 999rpx;
	overflow: hidden;
	margin-top: 10rpx;
}

.progress-bar {
	height: 100%;
	background: linear-gradient(90deg, #409eff, #2962ff);
	border-radius: 999rpx;
}

.card {
	background: #fafbfc;
	border-radius: 24rpx;
	padding: 32rpx;
	border: 1rpx solid #f2f3f5;
}

.item {
	margin-bottom: 32rpx;
	display: flex;
	flex-direction: column;
	gap: 14rpx;
}

.question {
	font-size: 28rpx;
	color: #374151;
	font-weight: 500;
}

.picker {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	padding: 0 28rpx;
	border-radius: 16rpx;
	font-size: 28rpx;
	background: #fff;
	border: 2rpx solid #f0f2f5;
	color: #333;
	box-sizing: border-box;
	pointer-events: none !important;
}

.picker::placeholder {
	color: #c0c4cc;
}

.btn-next {
	width: 100%;
	border-radius: 20rpx;
	font-size: 32rpx;
	font-weight: 600;
	background: linear-gradient(135deg, #409eff, #2962ff);
	color: #fff;
	box-shadow: 0 8rpx 20rpx rgba(64, 158, 255, 0.25);
	border: none;
	margin-top: 20rpx;
}

.btn-next:active {
	transform: scale(0.96);
}
</style>
