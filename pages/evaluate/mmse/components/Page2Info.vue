<template>
	<view class="screen">
		<view class="top-box">
			<view class="title">基本信息</view>
			<view class="subtitle">请填写被评估人信息</view>
		</view>

		<view class="form-box">
			<view class="item" v-for="field in formFields" :key="field.key">
				<text class="label">{{ field.label }}</text>

				<input v-if="field.type === 'input'" class="input" :placeholder="field.placeholder" v-model="formData[field.key]" />

				<input v-else-if="field.type === 'number'" class="input" :placeholder="field.placeholder" v-model="formData[field.key]" type="number" />

				<view v-else-if="field.type === 'picker'" class="input picker-input" @click="openPicker(field)">
					<input class="input" :placeholder="field.placeholder" :value="formData[`${field.key}Text`]" readonly />
				</view>
			</view>
		</view>

		<view class="btn-group">
			<button class="btn btn-back" @click="emit('go', 1)">返回</button>
			<button class="btn btn-next" @click="handleNext">下一步</button>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useUser } from '@/store/user.js';
import { GetUserinfo } from '@/api/fly.js';

const userStore = useUser();
const props = defineProps({ form: Object });
const emit = defineEmits(['go', 'submit']);

// 表单配置
const formFields = ref([
	{
		key: 'username',
		label: '姓名',
		type: 'input',
		placeholder: '请输入姓名',
		required: true,
		autoFill: 'username' // 对应用户信息字段
	},
	{
		key: 'age',
		label: '年龄',
		type: 'number',
		placeholder: '请输入年龄',
		required: true,
		autoFill: 'age' // 对应用户信息字段
	},
	{
		key: 'academic',
		label: '学历',
		type: 'picker',
		placeholder: '请选择学历',
		required: true,
		options: [
			{ name: '文盲', value: 1 },
			{ name: '小学', value: 2 },
			{ name: '中学及以上', value: 3 }
		]
	},
	{
		key: 'doctor',
		label: '医护人员',
		type: 'input',
		placeholder: '请输入医护人员',
		required: false
	}
]);

// 表单数据
const formData = ref({});

// 初始化表单默认值
const initForm = () => {
	formFields.value.forEach((field) => {
		if (formData.value[field.key] === undefined) {
			formData.value[field.key] = '';
		}
		if (field.type === 'picker') {
			formData.value[`${field.key}Text`] = '';
		}
	});
};

// 获取用户信息并自动填充
const getUserInfo = async () => {
	if (!userStore.logined) return;
	try {
		const userInfo = await GetUserinfo();
		if (!userInfo) return;

		// 自动填充：有值才覆盖，不覆盖已填写内容
		formFields.value.forEach((field) => {
			const userKey = field.autoFill;
			const fieldKey = userInfo.patient[userKey];
			if (userKey && userInfo.patient[userKey]) {
				// 只有为空时才自动填（不覆盖用户已输入）
				if (!formData.value[field.key]) {
					formData.value[field.key] = fieldKey;
				}
			}
		});
	} catch (e) {
		console.error('获取用户信息失败', e);
	}
};

// 选择器同步显示文本
const syncPickerText = () => {
	formFields.value.forEach((field) => {
		if (field.type !== 'picker') return;
		const val = formData.value[field.key];
		if (!val) return;

		const opt = field.options.find((o) => o.value == val);
		if (opt) formData.value[`${field.key}Text`] = opt.name;
	});
};

// 打开选择器
const openPicker = (field) => {
	uni.showActionSheet({
		itemList: field.options.map((i) => i.name),
		success: (res) => {
			const item = field.options[res.tapIndex];
			formData.value[field.key] = item.value;
			formData.value[`${field.key}Text`] = item.name;
		}
	});
};

// 加载父级传入数据
const loadParentData = () => {
	const info = props.form?.info || {};
	formData.value = { ...formData.value, ...info };
	syncPickerText();
};

// 下一步提交
const handleNext = () => {
	for (const field of formFields.value) {
		if (!field.required) continue;
		const val = formData.value[field.key]?.toString().trim();
		if (!val) {
			uni.showToast({
				title: `请${field.type === 'picker' ? '选择' : '输入'}${field.label}`,
				icon: 'none'
			});
			return;
		}
	}

	const submitData = {};
	formFields.value.forEach((field) => {
		submitData[field.key] = formData.value[field.key];
		if (field.type === 'picker') {
			submitData[`${field.key}_text`] = formData.value[`${field.key}Text`];
		}
	});

	emit('submit', { info: submitData });
	emit('go', 'q1');
};

// 生命周期
onMounted(async () => {
	initForm();
	loadParentData();
	await getUserInfo(); // 自动填充姓名、医护
});

watch(
	() => props.form,
	() => loadParentData(),
	{ deep: true }
);
</script>

<style lang="scss" scoped>
.screen {
	background: #ffffff;
	padding: 40rpx 32rpx;
	border-radius: 28rpx;
	box-sizing: border-box;
}

.top-box {
	text-align: center;
	margin-bottom: 40rpx;
}

.title {
	font-size: 44rpx;
	font-weight: 700;
	color: #1d2129;
	margin-bottom: 12rpx;
}

.subtitle {
	font-size: 26rpx;
	color: #86909c;
}

.form-box {
	display: flex;
	flex-direction: column;
	gap: 28rpx;
	margin-bottom: 50rpx;
}

.item {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.label {
	font-size: 28rpx;
	color: #4e5969;
	font-weight: 500;
}

.input {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	padding: 0 28rpx;
	border-radius: 16rpx;
	font-size: 28rpx;
	background: #f7f8fa;
	box-sizing: border-box;
	border: none;
}

.picker-input {
	position: relative;

	&::after {
		content: '>';
		position: absolute;
		right: 28rpx;
		top: 50%;
		transform: translateY(-50%);
		color: #c0c4cc;
		font-size: 32rpx;
	}
}

.btn-group {
	display: flex;
	gap: 20rpx;
}

.btn {
	flex: 1;
	border-radius: 18rpx;
	font-size: 30rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
}

.btn-back {
	background: #94a3b8;
	color: #fff;
}

.btn-next {
	background: linear-gradient(135deg, #409eff, #2962ff);
	color: #fff;
	box-shadow: 0 6rpx 16rpx rgba(64, 158, 255, 0.25);
}

.btn:active {
	transform: scale(0.96);
}
</style>
