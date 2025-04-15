import React from 'react';
import { Platform } from 'react-native';

interface PlatformSpecificProps {
    children: React.ReactNode;
    platform: 'ios' | 'android' | 'web' | 'default' | ('ios' | 'android')[];
}

/**
 * PlatformSpecific is a component that renders its children only on the specified platform.
 * If the platform is "default" or the current platform is the specified platform, the children are rendered.
 * Otherwise, the children are not rendered.
 */
const PlatformSpecific: React.FC<PlatformSpecificProps> = ({ children, platform }) => {
    if (platform === 'default' || platform.includes(Platform.OS as 'ios' | 'android')) {
        return <>{children}</>;
    }
    return null;
};

/**
 * Renders its children only on platforms other than iOS.
 */
const NotIOS: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    Platform.select({
        ios: null,
        default: children,
    });

/**
 * Renders its children only on iOS.
 */
const OnlyIOS: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <PlatformSpecific platform="ios">{children}</PlatformSpecific>
);

/**
 * Renders its children only on Android.
 */
const OnlyAndroid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <PlatformSpecific platform="android">{children}</PlatformSpecific>
);

/**
 * Renders its children only on Web.
 */
const OnlyWeb: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <PlatformSpecific platform="web">{children}</PlatformSpecific>
);

/**
 * Renders its children only on Native.
 */
const OnlyNative: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <PlatformSpecific platform={['ios', 'android']}>{children}</PlatformSpecific>
);

export { PlatformSpecific, NotIOS, OnlyIOS, OnlyAndroid, OnlyWeb, OnlyNative };

