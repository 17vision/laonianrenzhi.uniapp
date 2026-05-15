<template>
	<view class="screen">
		<view class="form-box">
			<!-- 1.姓名 -->
			<view class="item">
				<text class="label">姓名</text>
				<input class="input" placeholder="请输入姓名" v-model="formData.username" />
			</view>

			<!-- 2.身份证号 -->
			<view class="item">
				<text class="label">身份证号码</text>
				<input class="input" placeholder="请输入身份证号码" type="idcard" v-model="formData.id_card" />
			</view>

			<!-- 3.手机号 -->
			<view class="item">
				<text class="label">手机号码</text>
				<input class="input" placeholder="请输入手机号码" type="tel" v-model="formData.phone" />
			</view>

			<!-- 4.出生日期 -->
			<picker mode="date" :value="formData.birth_date" start="1900-01-01" :end="maxDate" @change="handleBirthDateChange">
				<view class="item select-item">
					<text class="label">出生日期</text>
					<view class="select-box">
						<text :class="formData.birth_date ? 'value' : 'placeholder'">
							{{ formData.birth_date || '请选择出生日期' }}
						</text>
						<text class="arrow">›</text>
					</view>
				</view>
			</picker>

			<!-- 5.性别 -->
			<view class="item select-item" @click="openGenderSheet">
				<text class="label">性别</text>
				<view class="select-box">
					<text :class="showGenderText ? 'value' : 'placeholder'">
						{{ showGenderText || '请选择性别' }}
					</text>
					<text class="arrow">›</text>
				</view>
			</view>

			<!-- 6.年龄 -->
			<view class="item">
				<text class="label">年龄</text>
				<input class="input" placeholder="自动计算" v-model="formData.age" type="number" disabled />
			</view>

			<!-- 退休状态 -->
			<view class="item select-item" @click="openRetirementSheet">
				<text class="label">退休状态</text>
				<view class="select-box">
					<text :class="showRetirementText ? 'value' : 'placeholder'">
						{{ showRetirementText || '请选择退休状态' }}
					</text>
					<text class="arrow">›</text>
				</view>
			</view>

			<!-- 婚姻状态 -->
			<view class="item select-item" @click="openMaritalSheet">
				<text class="label">婚姻状态</text>
				<view class="select-box">
					<text :class="showMaritalText ? 'value' : 'placeholder'">
						{{ showMaritalText || '请选择婚姻状态' }}
					</text>
					<text class="arrow">›</text>
				</view>
			</view>

			<!-- 工作 -->
			<view class="item">
				<text class="label">工作</text>
				<input class="input" placeholder="请输入工作" v-model="formData.work" />
			</view>

			<!-- 病情 -->
			<view class="item">
				<text class="label">病情</text>
				<input class="input" placeholder="请输入病情" v-model="formData.illness" />
			</view>

			<!-- 住址 -->
			<view class="item">
				<text class="label">住址</text>
				<input class="input" placeholder="请输入住址" v-model="formData.address" />
			</view>
		</view>

		<view class="btn-group">
			<button class="btn btn-next" @click="handleNext" :disabled="loading">
				{{ loading ? '提交中...' : '提交保存' }}
			</button>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import { Request } from '@/api/request.js';

const maxDate = new Date().toISOString().split('T')[0];
const loading = ref(false);

// 表单
const formData = ref({
	username: '',
	id_card: '',
	phone: '',
	birth_date: '',
	gender: '',
	age: '',
	work: '',
	illness: '',
	address: '',
	retirement_status: '',
	marital_status: ''
});

// ---------------------- 选项 ----------------------
const genderOptions = [
	{ name: '男', value: 1 },
	{ name: '女', value: 2 }
];
const retirementOptions = [
	{ name: '未退休', value: 0 },
	{ name: '已退休', value: 1 }
];
const maritalOptions = [
	{ name: '单身', value: 1 },
	{ name: '已婚', value: 2 },
	{ name: '离异', value: 3 },
	{ name: '寡居', value: 4 }
];

const showGenderText = ref('');
const showRetirementText = ref('');
const showMaritalText = ref('');

// ---------------------- 选择器 ----------------------
const openSheet = ({ options, field, textRef }) => {
	uni.showActionSheet({
		itemList: options.map((i) => i.name),
		success: (res) => {
			const item = options[res.tapIndex];
			formData.value[field] = item.value;
			textRef.value = item.name;
		}
	});
};

const openGenderSheet = () => openSheet({ options: genderOptions, field: 'gender', textRef: showGenderText });
const openRetirementSheet = () => openSheet({ options: retirementOptions, field: 'retirement_status', textRef: showRetirementText });
const openMaritalSheet = () => openSheet({ options: maritalOptions, field: 'marital_status', textRef: showMaritalText });

// ---------------------- 出生日期 ----------------------
const handleBirthDateChange = (e) => {
	formData.value.birth_date = e.detail.value;
	formData.value.age = calculateAge(e.detail.value);
};

// 年龄计算
const calculateAge = (birth) => {
	const today = new Date();
	const birthDate = new Date(birth);
	let age = today.getFullYear() - birthDate.getFullYear();
	const m = today.getMonth() - birthDate.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
	return age;
};

// ---------------------- 提交 + 强校验 ----------------------
const handleNext = async () => {
	const { username, id_card, phone, birth_date, gender, age, work, illness, address, retirement_status, marital_status } = formData.value;

	// 基础非空校验
	if (!username?.trim()) return uni.showToast({ title: '请输入姓名', icon: 'none' });
	if (!id_card?.trim()) return uni.showToast({ title: '请输入身份证号码', icon: 'none' });
	if (!phone?.trim()) return uni.showToast({ title: '请输入手机号码', icon: 'none' });
	if (!birth_date) return uni.showToast({ title: '请选择出生日期', icon: 'none' });
	if (!gender) return uni.showToast({ title: '请选择性别', icon: 'none' });
	if (!age) return uni.showToast({ title: '年龄不能为空', icon: 'none' });
	if (!address?.trim()) return uni.showToast({ title: '请输入住址', icon: 'none' });
	if (retirement_status === '') return uni.showToast({ title: '请选择退休状态', icon: 'none' });
	if (!marital_status) return uni.showToast({ title: '请选择婚姻状态', icon: 'none' });

	// 格式强校验
	const idReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
	if (!idReg.test(id_card)) return uni.showToast({ title: '身份证格式错误', icon: 'none' });

	const phoneReg = /^1[3-9]\d{9}$/;
	if (!phoneReg.test(phone)) return uni.showToast({ title: '手机号格式错误', icon: 'none' });

	// 防重复提交
	if (loading.value) return;
	loading.value = true;

	try {
		await Request('post', '/api/patients', formData.value);
		uni.showToast({ title: '提交成功', icon: 'success' });
		uni.switchTab({
			url: '/pages/mine/mine'
		});
	} catch (err) {
		uni.showToast({ title: '提交失败', icon: 'error' });
	} finally {
		loading.value = false;
	}
};
</script>

<style lang="scss" scoped>
.screen {
	background: #ffffff;
	padding: 40rpx 32rpx;
	border-radius: 28rpx;
	box-sizing: border-box;
	animation: fadeIn 0.4s ease forwards;
	min-height: 100vh;
}

.form-box {
	display: flex;
	flex-direction: column;
	gap: 32rpx;
	margin-bottom: 60rpx;
}

.item {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.label {
	font-size: 28rpx;
	color: #2c3e50;
	font-weight: 600;
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
	border: 1px solid #e4e7ed;
	transition: all 0.2s;

	&:focus {
		border-color: #409eff;
		background-color: #fff;
	}

	&:disabled {
		background: #f1f5fa;
		color: #666;
	}
}

/* 统一选择框样式 */
.select-item {
	cursor: pointer;
}

.select-box {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	padding: 0 28rpx;
	border-radius: 16rpx;
	font-size: 28rpx;
	background: #f7f8fa;
	box-sizing: border-box;
	border: 1px solid #e4e7ed;
	display: flex;
	justify-content: space-between;
	align-items: center;
	transition: all 0.2s;

	&:active {
		background-color: #eef5ff;
		border-color: #409eff;
	}
}

.select-box .placeholder {
	color: #999;
}

.select-box .value {
	color: #2c3e50;
}

.arrow {
	font-size: 36rpx;
	color: #c0c4cc;
	font-weight: bold;
}

/* 按钮 */
.btn-group {
	display: flex;
	gap: 20rpx;
}

.btn {
	flex: 1;
	height: 88rpx;
	border-radius: 18rpx;
	font-size: 32rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	transition: all 0.3s;
}

.btn-next {
	background: linear-gradient(135deg, #409eff, #2962ff);
	color: #fff;
	box-shadow: 0 8rpx 20rpx rgba(64, 158, 255, 0.25);

	&:disabled {
		background: #ccc;
		box-shadow: none;
	}
}

.btn:active {
	transform: scale(0.96);
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
