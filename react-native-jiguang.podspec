require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = package['name']
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license']

  s.authors      = package['author']
  s.homepage     = package['homepage']
  s.platform     = :ios, "9.0"

  s.source       = { :git => "https://github.com/yiky84119/react-native-jiguang.git", :tag => "v#{s.version}" }
  s.source_files  = "ios/**/*.{h,m}"

  #s.framework = 'CFNetwork', 'CoreFoundation', 'CoreTelephony', 'SystemConfiguration', 'CoreGraphics', 'Foundation', 'UIKit', 'Security', 'UserNotifications'
  #s.libraries = 'z', 'resolv'
  #s.vendored_libraries = 'janalytics-ios-2.1.0.a', 'jcore-ios-2.1.1.a', 'jpush-extension-ios-1.1.2.a', 'jpush-noidfa-ios-3.2.2.a'

  s.dependency 'React'

  s.dependency 'JPush', '3.2.2-noidfa'
  s.dependency 'JAnalytics', '2.1.0'
end
