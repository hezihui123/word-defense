package com.niannian.worddefense;

import android.app.Activity;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * Android 4.4 (API 19) TV 壳工程。
 * 只用 API 19 之前就存在的系统接口；遥控器按键统一转发给网页里的 window.tvKey。
 */
public class TvActivity extends Activity {

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);

        webView = new WebView(this);
        webView.setBackgroundColor(0xFF10263D);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setDatabasePath(getCacheDir().getAbsolutePath() + "/webview");
        settings.setAllowFileAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        try {
            settings.setMediaPlaybackRequiresUserGesture(false);
        } catch (Throwable ignored) {
            // 该方法在 API 17 加入，保留兜底以兼容定制 ROM
        }

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                // 网页“退出”按钮的兜底通道：捕获自定义 scheme 后彻底关闭。
                if (url != null && url.startsWith("tvexit://")) {
                    finish();
                    return true;
                }
                return url == null || !url.startsWith("file:///android_asset/");
            }
        });
        // 网页确认退出后直接调用，真正关闭 APK（而不是只返回首页）。
        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void exitApp() {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        finish();
                    }
                });
            }
        }, "tvBridge");
        webView.setWebChromeClient(new WebChromeClient());
        webView.setFocusable(true);
        webView.setFocusableInTouchMode(true);
        webView.requestFocus();

        webView.loadUrl("file:///android_asset/tv/index.html");

        View decor = getWindow().getDecorView();
        decor.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LOW_PROFILE
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        int code = event.getKeyCode();
        if (event.getAction() == KeyEvent.ACTION_DOWN) {
            String js = null;
            boolean back = false;
            switch (code) {
                case KeyEvent.KEYCODE_DPAD_LEFT:
                    js = "window.tvKey('left')";
                    break;
                case KeyEvent.KEYCODE_DPAD_RIGHT:
                    js = "window.tvKey('right')";
                    break;
                case KeyEvent.KEYCODE_DPAD_UP:
                    js = "window.tvKey('up')";
                    break;
                case KeyEvent.KEYCODE_DPAD_DOWN:
                    js = "window.tvKey('down')";
                    break;
                case KeyEvent.KEYCODE_ENTER:
                case KeyEvent.KEYCODE_DPAD_CENTER:
                case KeyEvent.KEYCODE_SPACE:
                    js = "window.tvKey('enter')";
                    break;
                case KeyEvent.KEYCODE_BACK:
                case KeyEvent.KEYCODE_MENU:
                    js = "window.tvKey('back')";
                    back = true;
                    break;
                default:
                    break;
            }
            if (js != null) {
                final boolean isBack = back;
                webView.evaluateJavascript(js, new ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String value) {
                        if (isBack && (value == null || value.indexOf("false") >= 0)) {
                            finish();
                        }
                    }
                });
                return true;
            }
        }
        return super.dispatchKeyEvent(event);
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
