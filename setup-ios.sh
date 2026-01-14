#!/bin/bash

# iOS Setup Script for AI Indoor Navigation System
# This script automates the setup process for iOS development

set -e

echo "🚀 Setting up iOS development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if CocoaPods is installed
if ! command -v pod &> /dev/null; then
    echo "⚠️  CocoaPods is not installed. Installing..."
    sudo gem install cocoapods
fi

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

# Install Capacitor dependencies
echo "📱 Installing Capacitor dependencies..."
npm install @capacitor/core @capacitor/ios @capacitor/camera @capacitor/device @capacitor/splash-screen

# Build the web app
echo "🔨 Building web app..."
npm run build

# Add iOS platform if it doesn't exist
if [ ! -d "ios" ]; then
    echo "📱 Adding iOS platform..."
    npx cap add ios
fi

# Sync to iOS
echo "🔄 Syncing to iOS..."
npx cap sync ios

# Install CocoaPods dependencies
echo "🍫 Installing CocoaPods dependencies..."
cd ios/App
pod install
cd ../..

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Open Xcode: npx cap open ios"
echo "2. Configure signing & capabilities in Xcode"
echo "3. Select your target device (iPhone 17 Pro)"
echo "4. Build and run (Cmd + R)"
echo ""
echo "For detailed instructions, see IOS_SETUP.md"

