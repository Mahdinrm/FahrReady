package com.fahrready

import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.view.WindowManager
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // Force status bar and nav bar to NOT overlap content
    val w = window
    w.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS)
    w.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION)
    w.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)
    w.statusBarColor = Color.parseColor("#07090F")
    w.navigationBarColor = Color.parseColor("#07090F")

    // Remove layout flags that cause overlap
    w.decorView.systemUiVisibility = (
      View.SYSTEM_UI_FLAG_LAYOUT_STABLE
    )
  }

  override fun getMainComponentName(): String = "FahrReady"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
