package com.react.jiguang;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import cn.jiguang.analytics.android.api.JAnalyticsInterface;

public class JiguangPackage implements ReactPackage {
    public JiguangPackage() {
        JAnalyticsInterface.setDebugMode(BuildConfig.DEBUG);
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        return Arrays.asList(new NativeModule[]{
                new JAnalyticsModule(reactContext),
                new JPushModule(reactContext),
        });
    }
    
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
