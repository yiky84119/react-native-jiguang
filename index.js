import { NativeModules, DeviceEventEmitter } from "react-native";

const JPushModule = NativeModules.JPushModule
const JAnalyticsModule = NativeModules.JAnalyticsModule;
// const listeners = {};

const noop = () => {};

export const setJSExceptionHandler = (customHandler = noop, allowedInDevMode = false) => {
    if (typeof allowedInDevMode !== "boolean" || typeof customHandler !== "function") {
        return;
    }
    const allowed = allowedInDevMode ? true : !__DEV__;
    if (allowed) {
        // 设置错误处理函数
        global.ErrorUtils.setGlobalHandler(customHandler);
        // 改写 console.error，保证报错能被 ErrorUtils 捕获并调用错误处理函数处理
        console.error = (message, error) => global.ErrorUtils.reportError(error);
    }
};

const listeners = {}
const receiveCustomMsgEvent = 'receivePushMsg'
const receiveNotificationEvent = 'receiveNotification'
const openNotificationEvent = 'openNotification'
const connectionChangeEvent = 'connectionChange'

const getRegistrationIdEvent = 'getRegistrationId' // Android Only
const openNotificationLaunchAppEvent = 'openNotificationLaunchApp' // iOS Only
const networkDidLogin = 'networkDidLogin' // iOS Only
const receiveExtrasEvent = 'receiveExtras' // Android Only

class JAnalytics {
    /**
     * 初始化插件
     *
     * @param {object} params = {
     *  appKey?: String       //极光控制台上注册的应用 appKey
     * }
     *
     * NOTE:
     * 当前版本 appKey 可以不传，iOS 中 params 中没有找到 appKey 字段
     * 会在 JiGuangConfig.plist 中获取 appKey 这个字段
     */
    static setup(params) {
        JAnalyticsModule.setup(params);
    }

    /**
     * 开始记录页面停留
     *
     * @param {object} params = {
     *  pageName: Stirng   // 页面名称，用于标识页面
     * }
     *
     */
    static startLogPageView(params) {
        JAnalyticsModule.startLogPageView(params);
    }

    /**
     * 停止记录页面停留
     *
     * @param {object} params = {
     *  pageName: Stirng   // 页面名称，用于标识页面
     * }
     */
    static stopLogPageView(params) {
        JAnalyticsModule.stopLogPageView(params);
    }

    /**
     * 上报位置信息 iOS Only
     *
     * @param {object} params = {
     *  latitude: float   // 经度
     *  longitude: float  // 纬度
     * }
     */
    static uploadLocation(params) {
        JAnalyticsModule.uploadLocation(params);
    }

    /**
     * 开启Crash日志收集，默认是关闭状态.
     */
    static crashLogON() {
        JAnalyticsModule.crashLogON();
    }

    /**
     * 手动将捕获到的错误日志交给原生层上报(仅ios)
     *
     * @param {object} params = {
     *  name: string       //error.name
     *  message: string    //error.message
     * }
     */
    static collectRNCrash(params) {
        if(Platform.OS === "ios"){
            JAnalyticsModule.collectCrash(params);
        }
    }

    /**
     * 开启js错误错误日志采集上报(仅ios)
     *
     * 如果开发者没有手动捕获错误日志，则使用此api即可
     *
     */
    static rnCrashLogON(){
        if(Platform.OS === "ios"){
            setJSExceptionHandler((e, isFatal) => {
                var param = {
                    name: e.name+"",
                    message:e.message+""
                }
                JAnalyticsModule.collectCrash(param)
            }, true);
        }
    }

    /**
     * 设置是否打印sdk产生的Debug级log信息, 默认为NO(不打印log)
     *
     * @param {object} params = {
     *  enable: Boolean //
     * }
     */
    static setDebug(params) {
        JAnalyticsModule.setDebug(params);
    }

    /**
     * 上报事件
     * 除了 extra 其他都是必填
     * @param {object} event 可以为如下 5 种事件
     *
     * loginEvent = {
     *  type: 'login',  // 必填
     *  extra: Object,  // 附加键值对，格式 {String: String}
     *  method: String，  // 填自己的登录方法
     *  success: Boolean
     * }
     *
     * registerEvent = {
     *  type: 'register',  // 必填
     *  extra: Object,  // 附加键值对，格式 {String: String}
     *  method: String，  // 填自己的登录方法
     *  success: Boolean
     * }
     *
     * purchaseEvent = {
     *  type: 'purchase', // 必填
     *  extra: Object,  // 附加键值对，格式 {String: String}
     *  goodsType: String,
     *  goodsId: String,
     *  goodsName: String,
     *  success: Boolen,
     *  price: float,
     *  currency: String, // CNY, USD
     *  count: int
     * }
     *
     * browseEvent = {
     *  type: 'browse',
     *  id: String,
     *  extra: Object,  // 附加键值对，格式 {String: String}
     *  name: String,
     *  contentType: String,
     *  duration: float
     * }
     *
     * countEvent = {
     *  type: 'count',
     *  extra: Object,  // 附加键值对，格式 {String: String}
     *  id: String
     * }
     *
     * calculateEvent = {
     *  type: 'calculate',
     *  extra: Object,  // 附加键值对，格式 {String: String}
     *  id: String,
     *  value: double
     * }
     */
    static postEvent(event) {
        JAnalyticsModule.postEvent(event);
    }

    /**
     * Android Only
     * 动态配置channel，优先级比AndroidManifest里配置的高,需要在初始化方法 setup 前调用
     *
     * @param {object} params = {
     *  channel: String  //希望配置的channel
     * }
     */
    static setChannel(params) {
        JAnalyticsModule.setChannel(params);
    }

    /**
     * 设置统计上报的自动周期，未调用前默认即时上报
     *
     * @param {object} params = {
     *  period: Number  //周期，单位秒，最小10秒，最大1天，超出范围会打印调用失败日志。传0表示统计数据即时上报
     * }
     */
    static setAnalyticsReportPeriod(params) {
        JAnalyticsModule.setAnalyticsReportPeriod(params);
    }

    /**
     * 设置用户信息
     * @param {Object} params = {
     *  accountID: String,            // 账号ID
     *  name: String,                 // 姓名
     *  creationTime: Number,         // 账号创建时间
     *  sex: Number,                  // 性别
     *  paid: Number,                 // 是否付费
     *  birthdate: String,            // 出生年月
     *  phone: String,                // 手机号码
     *  email: String,                // 电子邮件
     *  weiboID: String,              // 新浪微博ID
     *  wechatID: String,             // 微信ID
     *  qqID: String,                 // QQ ID
     *  extras: object                // Optional. 扩展参数，附加键值对，格式 {String: String}
     * }
     * @param {Function} success = () => {}
     * @param {Function} fail = () => {}
     */
    static identifyAccount(params, success, fail) {
        JAnalyticsModule.identifyAccount(params, success, fail);
    }
}

class JPush {
    /**
     * 初始化JPush 必须先初始化才能执行其他操作
     */
    static initPush () {
        if (Platform.OS == "android") {
            JPushModule.initPush()
        } else {
            JPush.setupPush()
        }
    }
    /**
     * 停止推送，调用该方法后将不再受到推送
     */
    static stopPush () {
        JPushModule.stopPush()
    }


    /**
     * 判断是否成功授权推送（或是否在设置中成功开启推送功能）
     *
     * @param {Function} cb
     */
    static hasPermission (cb) {
        JPushModule.hasPermission(res => {
            cb(res)
        })
    }

    /**
     * 恢复推送功能，停止推送后，可调用该方法重新获得推送能力
     */
    static resumePush () {
        if (Platform.OS == "android") {
            JPushModule.resumePush()
        } else {
            JPush.setupPush()
        }
    }

    /**
     * Android Only
     */
    static crashLogOFF () {
        JPushModule.crashLogOFF()
    }

    /**
     * Android Only
     */
    static crashLogON () {
        JPushModule.crashLogON()
    }

    /**
     * Android Only
     *
     * @param {Function} cb
     */
    static notifyJSDidLoad (cb) {
        JPushModule.notifyJSDidLoad(resultCode => {
            cb(resultCode)
        })
    }

    /**
     * 清除通知栏的所有通知
     */
    static clearAllNotifications () {
        if (Platform.OS == "android") {
            JPushModule.clearAllNotifications()
        } else {
            JPush.setBadge(0,() => {})
        }
    }

    /**
     * Android Only.
     * 删除通知栏指定的推送。
     */
    static clearNotificationById (id) {
        if (Platform.OS == "android") {
            JPushModule.clearNotificationById(id)
        } else {
            console.warn("iOS 没有提供该方法！")
        }
    }

    /**
     * Android Only
     */
    static getInfo (cb) {
        JPushModule.getInfo(map => {
            cb(map)
        })
    }

    /**
     * 获取当前连接状态
     * @param {Fucntion} cb = (Boolean) => {}
     * 如果连接状态变更为已连接返回 true
     * 如果连接状态变更为断开连接连接返回 false
     */
    static getConnectionState (cb) {
        JPushModule.getConnectionState(state => {
            cb(state)
        })
    }

    /**
     * 重新设置 Tag
     *
     * @param {Array} tags = [String]
     * @param {Function} cb = (result) => {  }
     * 如果成功 result = {tags: [String]}
     * 如果失败 result = {errorCode: Int}
     */
    static setTags (tags, cb) {
        JPushModule.setTags(tags, result => {
            cb(result)
        })
    }

    /**
     * 在原有 tags 的基础上添加 tags
     *
     * @param {Array} tags = [String]
     * @param {Function} cb = (result) => {  }
     * 如果成功 result = {tags: [String]}
     * 如果失败 result = {errorCode: Int}
     */
    static addTags (tags, cb) {
        JPushModule.addTags(tags, result => {
            cb(result)
        })
    }

    /**
     * 删除指定的 tags
     *
     * @param {Array} tags = [String]
     * @param {Function} cb = (result) => {  }
     * 如果成功 result = {tags: [String]}
     * 如果失败 result = {errorCode: Int}
     *
     */
    static deleteTags (tags, cb) {
        JPushModule.deleteTags(tags, result => {
            cb(result)
        })
    }

    /**
     * 清空所有 tags
     *
     * @param {Function} cb = (result) => { }
     * 如果成功 result = {tags: [String]}
     * 如果失败 result = {errorCode: Int}
     *
     */
    static cleanTags (cb) {
        JPushModule.cleanTags(result => {
            cb(result)
        })
    }

    /**
     * 获取所有已有标签
     *
     * @param {Function} cb = (result) => { }
     * 如果成功 result = {tags: [String]}
     * 如果失败 result = {errorCode: Int}
     *
     */
    static getAllTags (cb) {
        JPushModule.getAllTags(result => {
            cb(result)
        })
    }

    /**
     * 检查当前设备是否绑定该 tag
     *
     * @param {String} tag
     * @param {Function} cb = (result) => { }
     * 如果成功 result = {isBind: true}
     * 如果失败 result = {errorCode: Int}
     *
     */
    static checkTagBindState (tag, cb) {
        JPushModule.checkTagBindState(tag, result => {
            cb(result)
        })
    }

    /**
     * 重置 alias
     * @param {String} alias
     * @param {Function} cb = (result) => { }
     * 如果成功 result = {alias: String}
     * 如果失败 result = {errorCode: Int}
     *
     */
    static setAlias (alias, cb) {
        JPushModule.setAlias(alias, result => {
            cb(result)
        })
    }

    /**
     * 删除原有 alias
     *
     * @param {Function} cb = (result) => { }
     * 如果成功 result = {alias: String}
     * 如果失败 result = {errorCode: Int}
     *
     */
    static deleteAlias (cb) {
        JPushModule.deleteAlias(result => {
            cb(result)
        })
    }

    /**
     * 获取当前设备 alias
     *
     * @param {Function} cb = (result) => { }
     * 如果成功 result = {alias: String}
     * 如果失败 result = {errorCode: Int}
     *
     */
    static getAlias (cb) {
        JPushModule.getAlias(map => {
            cb(map)
        })
    }

    /**
     * Android Only
     */
    static setStyleBasic () {
        JPushModule.setStyleBasic()
    }

    /**
     * Android Only
     */
    static setStyleCustom () {
        JPushModule.setStyleCustom()
    }

    /**
     * Android Only
     */
    static setLatestNotificationNumber (maxNumber) {
        if (Platform.OS == "android") {
            JPushModule.setLatestNotificationNumber(maxNumber)
        }
    }

    /**
     * Android Only
     * @param {object} config = {"startTime": String, "endTime": String}  // 例如：{startTime: "20:30", endTime: "8:30"}
     */
    static setSilenceTime (config) {
        if (Platform.OS == "android") {
            JPushModule.setSilenceTime(config)
        }
    }

    /**
     * Android Only
     * @param {object} config = {"days": Array, "startHour": Number, "endHour": Number}
     * // 例如：{days: [0, 6], startHour: 8, endHour: 23} 表示星期天和星期六的上午 8 点到晚上 11 点都可以推送
     */
    static setPushTime (config) {
        if (Platform.OS == "android") {
            JPushModule.setPushTime(config)
        }
    }

    /**
     * Android Only
     */
    static setGeofenceInterval(interval) {
        if (Platform.OS == "android") {
            JPushModule.setGeofenceInterval(interval)
        }
    }

    /**
     * Android Only
     */
    static setMaxGeofenceNumber(maxNumber) {
        JPushModule.setMaxGeofenceNumber(maxNumber)
    }

    /**
     * Android Only
     */
    static jumpToPushActivity (activityName) {
        JPushModule.jumpToPushActivity(activityName)
    }

    /**
     * Android Only
     */
    static jumpToPushActivityWithParams (activityName, map) {
        JPushModule.jumpToPushActivityWithParams(activityName, map)
    }

    /**
     * Android Only
     */
    static finishActivity () {
        JPushModule.finishActivity()
    }

    /**
     * 监听：自定义消息后事件
     * @param {Function} cb = (Object) => { }
     */
    static addReceiveCustomMsgListener (cb) {
        listeners[cb] = DeviceEventEmitter.addListener(
            receiveCustomMsgEvent,
            message => {
                cb(message)
            }
        )
    }

    /**
     * 取消监听：自定义消息后事件
     * @param {Function} cb = (Object) => { }
     */
    static removeReceiveCustomMsgListener (cb) {
        if (!listeners[cb]) {
            return
        }
        listeners[cb].remove()
        listeners[cb] = null
    }

    /**
     * iOS Only
     * 点击推送启动应用的时候原生会将该 notification 缓存起来，该方法用于获取缓存 notification
     * 注意：notification 可能是 remoteNotification 和 localNotification，两种推送字段不一样。
     * 如果不是通过点击推送启动应用，比如点击应用 icon 直接启动应用，notification 会返回 undefine。
     * @param {Function} cb = (notification) => {}
     */
    static getLaunchAppNotification (cb) {
        JPushModule.getLaunchAppNotification(cb)
    }

    /**
     * @deprecated Since version 2.2.0, will deleted in 3.0.0.
     * iOS Only
     * 监听：应用没有启动的状态点击推送打开应用
     * 注意：2.2.0 版本开始，提供了 getLaunchAppNotification
     *
     * @param {Function} cb = (notification) => {}
     */
    static addOpenNotificationLaunchAppListener (cb) {
        listeners[cb] = DeviceEventEmitter.addListener(
            openNotificationLaunchAppEvent,
            registrationId => {
                cb(registrationId)
            }
        )
    }

    /**
     * @deprecated Since version 2.2.0, will deleted in 3.0.0.
     * iOS Only
     * 取消监听：应用没有启动的状态点击推送打开应用
     * @param {Function} cb = () => {}
     */
    static removeOpenNotificationLaunchAppEventListener (cb) {
        if (!listeners[cb]) {
            return
        }
        listeners[cb].remove()
        listeners[cb] = null
    }

    /**
     * iOS Only
     *
     * 监听：应用连接已登录
     * @param {Function} cb = () => {}
     */
    static addnetworkDidLoginListener (cb) {
        listeners[cb] = DeviceEventEmitter.addListener(
            networkDidLogin,
            registrationId => {
                cb(registrationId)
            }
        )
    }

    /**
     * iOS Only
     *
     * 取消监听：应用连接已登录
     * @param {Function} cb = () => {}
     */
    static removenetworkDidLoginListener (cb) {
        if (!listeners[cb]) {
            return
        }
        listeners[cb].remove()
        listeners[cb] = null
    }

    /**
     * 监听：接收推送事件
     * @param {} cb = (Object）=> {}
     */
    static addReceiveNotificationListener (cb) {
        listeners[cb] = DeviceEventEmitter.addListener(
            receiveNotificationEvent,
            map => {
                cb(map)
            }
        )
    }

    /**
     * 取消监听：接收推送事件
     * @param {Function} cb = (Object）=> {}
     */
    static removeReceiveNotificationListener (cb) {
        if (!listeners[cb]) {
            return
        }
        listeners[cb].remove()
        listeners[cb] = null
    }

    /**
     * 监听：点击推送事件
     * @param {Function} cb  = (Object）=> {}
     */
    static addReceiveOpenNotificationListener (cb) {
        listeners[cb] = DeviceEventEmitter.addListener(
            openNotificationEvent,
            message => {
                cb(message)
            }
        )
    }

    /**
     * 取消监听：点击推送事件
     * @param {Function} cb  = (Object）=> {}
     */
    static removeReceiveOpenNotificationListener (cb) {
        if (!listeners[cb]) {
            return
        }
        listeners[cb].remove()
        listeners[cb] = null
    }

    /**
     * Android Only
     *
     * If device register succeed, the server will return registrationId
     */
    static addGetRegistrationIdListener (cb) {
        listeners[cb] = DeviceEventEmitter.addListener(
            getRegistrationIdEvent,
            registrationId => {
                cb(registrationId)
            }
        )
    }

    /**
     * Android Only
     */
    static removeGetRegistrationIdListener (cb) {
        if (!listeners[cb]) {
            return
        }
        listeners[cb].remove()
        listeners[cb] = null
    }

    /**
     * 监听：连接状态变更
     * @param {Function} cb = (Boolean) => { }
     * 如果连接状态变更为已连接返回 true
     * 如果连接状态变更为断开连接连接返回 false
     */
    static addConnectionChangeListener (cb) {
        listeners[cb] = DeviceEventEmitter.addListener(
            connectionChangeEvent,
            state => {
                cb(state)
            }
        )
    }

    /**
     * 监听：连接状态变更
     * @param {Function} cb = (Boolean) => { }
     * 如果连接状态变更为已连接返回 true
     * 如果连接状态变更为断开连接连接返回 false
     */
    static removeConnectionChangeListener (cb) {
        if (!listeners[cb]) {
            return
        }
        listeners[cb].remove()
        listeners[cb] = null
    }

    /**
     * 监听：收到 Native 下发的 extra 事件
     * @param {Function} cb = (map) => { }
     * 返回 Object，属性和值在 Native 定义
     */
    static addReceiveExtrasListener (cb) {
        listeners[cb] = DeviceEventEmitter.addListener(receiveExtrasEvent, map => {
            cb(map)
        })
    }

    static removeReceiveExtrasListener (cb) {
        if (!listeners[cb]) {
            return
        }
        listeners[cb].remove()
        listeners[cb] = null
    }

    /**
     * 获取 RegistrationId
     * @param {Function} cb = (String) => { }
     */
    static getRegistrationID (cb) {
        JPushModule.getRegistrationID(id => {
            cb(id)
        })
    }

    /**
     * iOS Only
     * 初始化 JPush SDK 代码,
     * NOTE: 如果已经在原生 SDK 中添加初始化代码则无需再调用 （通过脚本配置，会自动在原生中添加初始化，无需额外调用）
     */
    static setupPush () {
        JPushModule.setupPush()
    }

    /**
     * iOS Only
     * @param {Function} cb = (String) => { } // 返回 appKey
     */
    static getAppkeyWithcallback (cb) {
        JPushModule.getAppkeyWithcallback(appkey => {
            cb(appkey)
        })
    }

    /**
     * iOS Only
     * @param {Function} cb = (int) => { } // 返回应用 icon badge。
     */
    static getBadge (cb) {
        JPushModule.getApplicationIconBadge(badge => {
            cb(badge)
        })
    }

    /**
     * iOS Only
     * 设置本地推送
     * @param {Number} date  触发本地推送的时间的时间戳(毫秒)
     * @param {String} textContain 推送消息体内容
     * @param {Int} badge  本地推送触发后 应用 Badge（小红点）显示的数字
     * @param {String} alertAction 弹框的按钮显示的内容（IOS 8默认为"打开", 其他默认为"启动"）
     * @param {String} notificationKey  本地推送标示符
     * @param {Object} userInfo 推送的附加字段 选填
     * @param {String} soundName 自定义通知声音，设置为 null 为默认声音
     */
    static setLocalNotification (
        date,
        textContain,
        badge,
        alertAction,
        notificationKey,
        userInfo,
        soundName
    ) {
        JPushModule.setLocalNotification(
            date,
            textContain,
            badge,
            alertAction,
            notificationKey,
            userInfo,
            soundName
        )
    }

    /**
     * @typedef Notification
     * @type {object}
     * // Android Only
     * @property {number} [buildId] - 通知样式：1 为基础样式，2 为自定义样式（需先调用 `setStyleCustom` 设置自定义样式）
     * @property {number} [id] - 通知 id, 可用于取消通知
     * @property {string} [title] - 通知标题
     * @property {string} [content] - 通知内容
     * @property {object} [extra] - extra 字段
     * @property {number} [fireTime] - 通知触发时间（毫秒）
     * // iOS Only
     * @property {number} [badge] - 本地推送触发后应用角标值
     * // iOS Only
     * @property {string} [soundName] - 指定推送的音频文件
     * // iOS 10+ Only
     * @property {string} [subtitle] - 子标题
     */

    /**
     * @param {Notification} notification
     */
    static sendLocalNotification (notification) {
        JPushModule.sendLocalNotification(notification)
    }

    /**
     * 移除所有的本地通知
     */
    static clearLocalNotifications() {
        JPushModule.clearLocalNotifications()
    }

    /**
     * 移除指定未触发的本地通知。
     */
    static removeLocalNotification(id) {
        JPushModule.removeLocalNotification(id)
    }

    /**
     * iOS Only
     * 设置应用 Badge（小红点）
     * @param {Int} badge
     * @param {Function} cb = () => { } //
     */
    static setBadge (badge, cb) {
        JPushModule.setBadge(badge, value => {
            cb(value)
        })
    }
}

module.exports = {
    JAnalytics,
    JPush
}
