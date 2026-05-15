<template>
	<view class="canvas-container">
		<canvas
			class="drawing-canvas"
			canvas-id="signatureCanvas"
			@touchstart="handleTouchStart"
			@touchmove="handleTouchMove"
			@touchend="handleTouchEnd"
			:style="{ width: canvasWidth, height: canvasHeight }"
		></canvas>
		<view class="button-container">
			<image class="icon" src="../../static/sq-sign/clean.png" @click="clearCanvas"></image>
		</view>
	</view>
</template>

<script>
// 全局变量重置为画布完整区域，避免局部裁剪
let contentX = 0;
let contentY = 0;
let contentWidth = 0;
let contentHeight = 0;

export default {
	name: 'SqSign',
	emits: ['click'],
	props: {
		image: {
			type: String,
			default: ''
		},
		isShow: {
			type: Boolean,
			default: false
		},
		canvasWidth: {
			type: String,
			default: '100%'
		},
		canvasHeight: {
			type: String,
			default: '300rpx'
		},
		currentColor: {
			type: String,
			default: '#000000'
		},
		lineWidth: {
			type: Number,
			default: 1
		}
	},
	mounted() {
		const context = uni.createCanvasContext('signatureCanvas', this);
		context.lineWidth = this.lineWidth;
		context.strokeStyle = this.currentColor;
		// 初始化画布完整宽高（用于导出全画布）
		const query = uni.createSelectorQuery().in(this);
		query
			.select('.drawing-canvas')
			.boundingClientRect((rect) => {
				contentWidth = rect.width;
				contentHeight = rect.height;
			})
			.exec();
	},
	methods: {
		handleTouchStart(e) {
			const { x, y } = e.touches[0];
			this.lastX = x;
			this.lastY = y;
			// 初始化笔迹坐标
			if (contentX === 0) contentX = x;
			if (contentY === 0) contentY = y;
		},
		handleTouchMove(e) {
			const { x, y } = e.touches[0];
			const context = uni.createCanvasContext('signatureCanvas', this);
			context.beginPath();
			context.moveTo(this.lastX, this.lastY);
			context.lineTo(x, y);
			context.stroke();
			context.closePath();
			context.draw(true);

			this.lastX = x;
			this.lastY = y;

			// 扩展笔迹包围盒
			contentX = Math.min(contentX, x);
			contentY = Math.min(contentY, y);
			contentWidth = Math.max(contentWidth, x);
			contentHeight = Math.max(contentHeight, y);
		},
		handleTouchEnd() {},
		clearCanvas() {
			// 清空时重置所有坐标
			contentX = 0;
			contentY = 0;
			contentWidth = 0;
			contentHeight = 0;
			const context = uni.createCanvasContext('signatureCanvas', this);
			context.clearRect(0, 0, 10000, 10000);
			context.draw(true);
		},

		// ======================================
		// ✅ 新增：图片回显方法（关键）
		// ======================================
		loadImage(imgUrl) {
			return new Promise((resolve, reject) => {
				if (!imgUrl) return reject('no url');

				const ctx = uni.createCanvasContext('signatureCanvas', this);

				uni.downloadFile({
					url: imgUrl,
					success: (res) => {
						if (res.statusCode === 200) {
							ctx.drawImage(res.tempFilePath, 0, 0, contentWidth, contentHeight);
							ctx.draw(true);
							resolve();
						} else {
							reject('download fail');
						}
					},
					fail: reject
				});
			});
		},

		saveSignature() {
			const that = this;
			return new Promise((resolve, reject) => {
				uni.getSystemInfo({
					success: (res) => {
						const pixelRatio = res.pixelRatio || 2;

						uni.canvasToTempFilePath(
							{
								canvasId: 'signatureCanvas',
								x: contentX,
								y: contentY,
								width: contentWidth - contentX || 0,
								height: contentHeight - contentY || 0,
								destWidth: (contentWidth - contentX || 0) * pixelRatio,
								destHeight: (contentHeight - contentY || 0) * pixelRatio,

								success: (res) => {
									const tempFilePath = res.tempFilePath;

									// 返回 base64 + 伪File对象
									uni.getFileSystemManager().readFile({
										filePath: tempFilePath,
										encoding: 'base64',
										success: (data) => {
											const base64 = 'data:image/png;base64,' + data.data;
											const result = {
												base64: base64,
												tempPath: tempFilePath
											};
											that.$emit('click', result);
											resolve(result);
										},
										fail: reject
									});
								},
								fail: reject
							},
							that
						);
					},
					fail: reject
				});
			});
		}
	}
};
</script>

<style lang="less">
.canvas-container {
	background: #fff;
	border-radius: 18rpx;
}
.drawing-canvas {
	width: 100%;
	background: #fff;
	border-radius: 18rpx;
	border: 2rpx dashed #3b82f6;
}
.button-container {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	background: #fff;
}

.icon {
	margin: 10rpx 20rpx;
	display: flex;
	width: 50rpx;
	height: 50rpx;
}
</style>
