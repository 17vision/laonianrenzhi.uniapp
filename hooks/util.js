export const GetNavAndDevice = () => {
	let key = 'nav_device_storage';
	let object = uni.getStorageSync(key);
	if (object) {
		return object;
	}

	// safeArea 安全区域 （bottom 892 height 833 left 0 right 428 top 59 width 428）
	// safeAreaInsets 内部安全区域 （bottom 34 left 0 right 0 top 59）
	// pixelRatio 像素密度比列 3
	// system 系统 iOS 10.0.1
	// deviceModel 设备 iPhone 14 Pro Max
	// deviceType 设备类型 iphone
	// osName 操作系统 ios
	const {
		navigationBarHeight,
		statusBarHeight,
		screenWidth,
		screenHeight,
		pixelRatio,
		system,
		deviceModel,
		deviceType,
		osName
	} = uni.getSystemInfoSync();

	const navTop = navigationBarHeight || statusBarHeight;

	//#ifdef MP
	// top 胶囊距顶部的距离 63
	// left 胶囊左边距离左边的距离 334
	// right 胶囊右边距离左边的距离 421
	// width 胶囊的宽度 87
	// height 胶囊的高度 32
	const {
		top,
		left,
		width,
		height,
		right,
		bottom
	} = uni.getMenuButtonBoundingClientRect();
	const navWidth = left;
	const navHeight = height + (top - navTop) * 2;
	const navSafeX = screenWidth - right;
	const capsuleWidth = right - left;
	//#endif

	// #ifdef APP-PLUS
	const navWidth = screenWidth;
	const navHeight = 44;
	const navSafeX = 0;
	const capsuleWidth = 0;
	// #endif

	object = {
		navTop,
		navWidth,
		navHeight,
		navSafeX,
		capsuleWidth,
		screenWidth,
		screenHeight,
		pixelRatio,
		system,
		deviceModel,
		deviceType,
		osName
	};

	uni.setStorageSync(key, object);

	return object;
}
