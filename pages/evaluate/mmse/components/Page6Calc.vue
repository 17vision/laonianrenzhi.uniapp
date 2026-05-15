<template>
	<view class="screen active">
		<view class="title">计算能力</view>
		<view class="progress-wrap">
			<view class="progress-text">评估进度：4/8</view>
			<view class="progress">
				<view class="progress-bar" style="width: 50%"></view>
			</view>
		</view>

		<view class="card">
			<view class="tip">
				{{ calcConfig.start }} 连续减 {{ calcConfig.minus }}，请在倒计时结束前完成
			</view>

			<view class="count-down">{{ calcCountdownText }}</view>

			<!-- 全部题目 + 序号 + 输入框 -->
			<view class="item-list">
				<view class="item" v-for="(item, idx) in calcSteps" :key="idx">
					<view class="formula">{{ idx + 1 }}. {{ item.formula }}</view>
					<input
						v-model.number="userCalc[idx]"
						class="input"
						placeholder="输入答案"
						type="number"
						:disabled="timeEndDisabled"
					/>
				</view>
			</view>

			<button class="btn-submit" :disabled="timeEndDisabled" @click="finishCalc">
				确认提交所有答案
			</button>
		</view>

		<button class="btn-next" v-show="showNext" @click="handleNext">下一页</button>
	</view>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';

const props = defineProps({ form: Object });
const emit = defineEmits(['go', 'submit']);

// 比较规则
const CompareType = { Equal: 1, Include: 2 };

// 随机计算配置
const calcConfig = ref({ start: 100, minus: 7, steps: 5 });
const calcSteps = ref([]);
const standardAnswers = ref([]);

// 生成随机题目（核心修复：公式和答案同步正确生成）
const generateRandomCalc = () => {
	const start = Math.floor(Math.random() * 40) + 80;
	const minus = Math.floor(Math.random() * 6) + 5;
	const steps = 5;

	calcConfig.value = { start, minus, steps };

	const value = [];
	const formulaList = [];
	let current = start;

	for (let i = 0; i < steps; i++) {
		const prev = current;
		current -= minus;
		value.push(current);
		formulaList.push({ formula: `${prev} - ${minus} = ?` });
	}

	standardAnswers.value = value;
	calcSteps.value = formulaList; // 存成对象数组，模板直接读取
};

// 统一题目结构
const question = ref({
	key: 'calculation_task',
	label: '连续减法',
	type: 'calculation',
	compare_type: CompareType.Equal,
	total_score: 5,
	value: [],
	userAnswer: [],
	calcConfig: {},
	module: 'calculation_ability',
	module_name: '计算能力'
});

// 全局统一数组
const questions = ref([]);

// 状态
const userCalc = ref([0, 0, 0, 0, 0]);
const calcCountdownText = ref('30 秒');
const showNext = ref(false);
const timeEndDisabled = ref(false);

let timer = null;
let timeLeft = 30;

// 倒计时
const startCountdown = () => {
	clearInterval(timer);
	timeLeft = 30;
	calcCountdownText.value = timeLeft + ' 秒';
	timeEndDisabled.value = false;

	timer = setInterval(() => {
		timeLeft--;
		calcCountdownText.value = timeLeft + ' 秒';
		if (timeLeft <= 0) finishCalc();
	}, 1000);
};

// 结束答题
const finishCalc = () => {
	clearInterval(timer);
	calcCountdownText.value = '已结束';
	timeEndDisabled.value = true;
	showNext.value = true;
};

// 从缓存恢复（彻底修复公式不显示问题）
const initFromQuestions = () => {
	if (!props.form?.questions) {
		generateRandomCalc();
		return;
	}

	questions.value = props.form.questions;
	const target = questions.value.find(q => q.key === 'calculation_task');

	if (target) {
		calcConfig.value = target.calcConfig || { start: 100, minus: 7, steps: 5 };
		standardAnswers.value = target.value || [];
		userCalc.value = target.userAnswer || [0, 0, 0, 0, 0];

		// 正确重新生成公式数组（对象格式，模板直接渲染）
		const list = [];
		let cur = calcConfig.value.start;
		for (let i = 0; i < 5; i++) {
			list.push({ formula: `${cur} - ${calcConfig.value.minus} = ?` });
			cur -= calcConfig.value.minus;
		}
		calcSteps.value = list;
	} else {
		generateRandomCalc();
	}
};

// 提交到统一数组
const handleNext = () => {
	question.value = {
		key: 'calculation_task',
		label: '连续减法',
		type: 'calculation',
		compare_type: CompareType.Equal,
		total_score: 5,
		value: standardAnswers.value,
		userAnswer: userCalc.value.map(v => isNaN(v) ? 0 : v),
		calcConfig: calcConfig.value,
		module: 'calculation_ability',
		module_name: '计算能力'
	};

	const idx = questions.value.findIndex(q => q.key === question.value.key);
	if (idx >= 0) questions.value[idx] = question.value;
	else questions.value.push(question.value);

	emit('submit', { questions: questions.value });
	emit('go', 'q5');
};

onMounted(() => {
	initFromQuestions();
	startCountdown();
});

onUnmounted(() => clearInterval(timer));

watch(() => props.form, () => initFromQuestions(), { deep: true });
</script>

<style lang="scss" scoped>
.screen {
	background: #fff;
	padding: 30rpx;
	border-radius: 24rpx;
}

.title {
	font-size: 40rpx;
	font-weight: bold;
	text-align: center;
	margin-bottom: 20rpx;
	color: #222;
}

.progress-wrap {
	margin-bottom: 30rpx;
}

.progress-text {
	font-size: 24rpx;
	color: #666;
	margin-bottom: 8rpx;
}

.progress {
	height: 10rpx;
	background: #f1f1f1;
	border-radius: 20rpx;
	overflow: hidden;
}

.progress-bar {
	height: 100%;
	background: linear-gradient(90deg, #409eff, #2962ff);
}

.card {
	padding: 30rpx;
	border-radius: 20rpx;
	background: #fafbfc;
}

.tip {
	font-size: 26rpx;
	color: #333;
	text-align: center;
	margin-bottom: 16rpx;
	font-weight: 500;
}

.count-down {
	font-size: 32rpx;
	color: #f53f3f;
	font-weight: bold;
	text-align: center;
	margin-bottom: 30rpx;
}

.item-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.item {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.formula {
	font-size: 30rpx;
	font-weight: 500;
	color: #3b82f6;
}

.input {
	height: 80rpx;
	border-radius: 14rpx;
	background: #fff;
	border: 2rpx solid #eee;
	padding: 0 20rpx;
	font-size: 28rpx;
}

.btn-submit {
	width: 100%;
	height: 80rpx;
	border-radius: 16rpx;
	background: #22c55e;
	color: #fff;
	font-size: 30rpx;
	font-weight: 500;
	margin-top: 30rpx;
	border: none;
}

.btn-submit[disabled] {
	background: #ccc;
}

.btn-next {
	width: 100%;
	height: 80rpx;
	border-radius: 16rpx;
	background: #409eff;
	color: #fff;
	font-size: 30rpx;
	font-weight: 500;
	margin-top: 20rpx;
	border: none;
}
</style>