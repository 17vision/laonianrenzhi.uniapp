<template>
	<view class="agreement-page">
		<scroll-view scroll-y class="content" show-scrollbar>
			<!-- 用户服务协议 -->
			<view class="section">
				<view class="title">用户服务协议</view>
				<view class="text">欢迎使用本服务（包括移动应用与小程序，以下简称“本服务”）。请您在使用前仔细阅读并同意以下条款。</view>

				<view class="sub-title">一、服务说明</view>
				<view class="text">本服务由开发者提供，旨在为用户提供数据记录等相关功能。使用本服务即表示您已阅读并同意本协议全部内容。</view>

				<view class="sub-title">二、用户责任</view>
				<view class="text">您需确保所提交的信息真实、准确，不得利用本服务从事违法违规行为。如因违规操作造成法律责任，将由用户自行承担。</view>

				<view class="sub-title">三、服务变更与中断</view>
				<view class="text">我们有权在必要时对本服务的部分或全部功能进行调整、中止或终止，并会在合理范围内提前公告（如适用）。</view>

				<view class="sub-title">四、免责声明</view>
				<view class="text">本服务提供的数据仅供参考。因使用本服务产生的任何直接或间接损失，我们不承担责任。</view>

				<view class="sub-title">五、知识产权</view>
				<view class="text">本服务的所有内容（包括界面设计、文字、图片、程序代码等）均受相关法律保护，未经许可不得复制、传播或用于商业用途。</view>

				<view class="sub-title">六、其他</view>
				<view class="text">本协议未尽事宜，适用中华人民共和国相关法律法规。若因本协议产生争议，双方应友好协商解决。</view>
			</view>

			<!-- 隐私政策 -->
			<view class="section">
				<view class="title">隐私政策</view>
				<view class="text">我们非常重视您的个人信息保护。本隐私政策将说明我们如何收集、使用、存储和保护您的信息。</view>

				<view class="sub-title">一、信息收集</view>
				<view class="text">我们可能会收集账号信息、设备信息等必要数据，以提供核心功能。</view>

				<view class="sub-title">二、信息使用</view>
				<view class="text">您的信息仅用于提供和优化服务，不会用于未经授权的用途。未经您的同意，我们不会向任何第三方提供您的信息，法律规定除外。</view>

				<view class="sub-title">三、信息存储与保护</view>
				<view class="text">我们将采用符合行业标准的安全措施保护您的信息，防止数据泄露、丢失或被非法访问。</view>

				<view class="sub-title">四、您的权利</view>
				<view class="text">您可随时访问、更正或删除您的个人信息。如需撤回授权，可通过系统设置或相关入口进行操作（依据平台能力）。</view>

				<view class="sub-title">五、未成年人保护</view>
				<view class="text">我们不会主动收集14周岁以下未成年人的个人信息。如发现此类情况，请及时联系我们处理。</view>

				<view class="sub-title">六、政策更新</view>
				<view class="text">我们可能根据法律法规或服务变化更新本政策。更新后的内容将于本页面公布并即时生效。</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
//
</script>

<style scoped>
.agreement-page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #ffffff;
}

/* 滚动内容 */
.content {
	flex: 1;
	padding: 30rpx;
	box-sizing: border-box;
}

/* 每个章节 */
.section {
	margin-bottom: 40rpx;
}

/* 标题 */
.title {
	font-size: 36rpx;
	font-weight: 600;
	margin-bottom: 20rpx;
	color: #111;
	text-align: center;
}

/* 小标题 */
.sub-title {
	font-size: 30rpx;
	font-weight: bold;
	margin-top: 30rpx;
	margin-bottom: 10rpx;
	color: #333;
}

/* 正文 */
.text {
	font-size: 28rpx;
	line-height: 1.8;
	color: #555;
	text-align: justify;
}
</style>
