import {
	Request,
	BaseURL,
	Header,
	UploadImage
} from './request.js';


// 小程序登录注册
const WxCodeQuery = (data) => {
	return Request('post', '/jtour-yjy-client/sso/customer/queryCustomerPhoneByCode', data);
}

const WxCodeLogin = (data) => {
	return Request('post', '/jtour-yjy-client/sso/customer/wechatLoginByOldMemberV3', data);
}

const WxMiniLogin = (data) => {
	return Request('post', '/jtour-yjy-client/sso/customer/wechatLoginV3', data);
}

// 获取自己的信息
const GetUserinfo = (data) => {
	return Request('get', '/userinfo', data);
}

// 更新用户信息
const UpdateUser = (data) => {
	return Request('put', '/users', data);
}

const GetValidTheme = (data) => {
	return Request('post', '/jtour-yjy-client/mpApp/getValidTheme', data);
}

// 生图
const GenerateTheme = (data) => {
	return Request('post', '/jtour-yjy-client/mpApp/generateTheme', data);
}

// 获取相册
const GetThemeUserRecord = (data) => {
	return Request('post', '/jtour-yjy-client/mpApp/getThemeUserRecord', data);
}

// 获取节点信息
const GetPoiList = (data) => {
	return Request('get', '/afanti-api/intelligentGuide/getPoiList', data);
}

// 获取信息点的具体信息
const GetScenicDetail = (data) => {
	return Request('get', '/afanti-api/intelligentGuide/getScenicDetails', data);
}

// 获取信息点的具体信息
const GetPoiDetail = (data) => {
	return Request('get', '/afanti-api/intelligentGuide/getPoiDetails', data);
}

export {
	WxCodeQuery,
	WxCodeLogin,
	WxMiniLogin,
	GetUserinfo,
	UpdateUser,
	GetValidTheme,
	UploadImage,
	GenerateTheme,
	GetThemeUserRecord,
	GetPoiList,
	GetScenicDetail,
	GetPoiDetail
}