import { useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

// Enhanced breakpoints for better responsive design
export const BREAKPOINTS = {
    xs: 0,     // Small phones
    sm: 380,   // Medium phones
    md: 768,   // Tablets
    lg: 1024,  // Large tablets
    xl: 1440,  // Desktop
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

interface ScreenDimensions {
    width: number;
    height: number;
    isTablet: boolean;
    isLandscape: boolean;
    scale: number;
    fontScale: number;
    breakpoint: BreakpointKey;
    isSmallPhone: boolean;
    isMediumPhone: boolean;
    isLargeTablet: boolean;
    aspectRatio: number;
}

export const useResponsive = (): ScreenDimensions => {
    const [dimensions, setDimensions] = useState(() => {
        const { width, height, scale, fontScale } = Dimensions.get('window');
        const aspectRatio = width / height;

        return {
            width,
            height,
            isTablet: width >= BREAKPOINTS.md,
            isLandscape: width > height,
            scale,
            fontScale,
            breakpoint: getBreakpoint(width),
            isSmallPhone: width < BREAKPOINTS.sm,
            isMediumPhone: width >= BREAKPOINTS.sm && width < BREAKPOINTS.md,
            isLargeTablet: width >= BREAKPOINTS.lg,
            aspectRatio,
        };
    });

    useEffect(() => {
        const subscription = Dimensions.addEventListener(
            'change',
            ({ window }: { window: ScaledSize }) => {
                const { width, height, scale, fontScale } = window;
                const aspectRatio = width / height;

                setDimensions({
                    width,
                    height,
                    isTablet: width >= BREAKPOINTS.md,
                    isLandscape: width > height,
                    scale,
                    fontScale,
                    breakpoint: getBreakpoint(width),
                    isSmallPhone: width < BREAKPOINTS.sm,
                    isMediumPhone: width >= BREAKPOINTS.sm && width < BREAKPOINTS.md,
                    isLargeTablet: width >= BREAKPOINTS.lg,
                    aspectRatio,
                });
            }
        );

        return () => subscription?.remove();
    }, []);

    return dimensions;
};

// Helper function to get current breakpoint
const getBreakpoint = (width: number): BreakpointKey => {
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
};

// Enhanced helper functions for responsive design
export const getResponsiveValue = (
    small: number,
    medium: number,
    large: number,
    width: number
) => {
    if (width < BREAKPOINTS.sm) return small;
    if (width < BREAKPOINTS.md) return medium;
    return large;
};

// Enhanced responsive font size with better scaling
export const getResponsiveFontSize = (
    baseSize: number,
    fontScale: number,
    maxScale: number = 1.3,
    breakpoint?: BreakpointKey
) => {
    let sizeMutiplier = 1;

    // Adjust base size based on breakpoint
    if (breakpoint) {
        switch (breakpoint) {
            case 'xs':
                sizeMutiplier = 0.9;
                break;
            case 'sm':
                sizeMutiplier = 0.95;
                break;
            case 'md':
                sizeMutiplier = 1.1;
                break;
            case 'lg':
                sizeMutiplier = 1.2;
                break;
            case 'xl':
                sizeMutiplier = 1.3;
                break;
            default:
                sizeMutiplier = 1;
        }
    }

    const adjustedScale = Math.min(fontScale, maxScale);
    return Math.round(baseSize * sizeMutiplier * adjustedScale);
};

// Enhanced responsive spacing
export const getResponsiveSpacing = (
    baseSpacing: number,
    width: number,
    breakpoint?: BreakpointKey
) => {
    if (breakpoint) {
        switch (breakpoint) {
            case 'xs':
                return baseSpacing * 0.75;
            case 'sm':
                return baseSpacing * 0.85;
            case 'md':
                return baseSpacing * 1.1;
            case 'lg':
                return baseSpacing * 1.25;
            case 'xl':
                return baseSpacing * 1.4;
            default:
                return baseSpacing;
        }
    }

    // Fallback to width-based calculation
    if (width < BREAKPOINTS.sm) return baseSpacing * 0.75;
    if (width < BREAKPOINTS.md) return baseSpacing * 0.85;
    if (width < BREAKPOINTS.lg) return baseSpacing * 1.1;
    return baseSpacing * 1.25;
};

// Enhanced grid column calculation
export const getGridColumns = (
    width: number,
    itemMinWidth: number = 180,
    maxColumns: number = 5
) => {
    const breakpoint = getBreakpoint(width);

    // Responsive padding based on breakpoint
    let horizontalPadding: number;
    switch (breakpoint) {
        case 'xs':
            horizontalPadding = 16;
            break;
        case 'sm':
            horizontalPadding = 20;
            break;
        case 'md':
            horizontalPadding = 32;
            break;
        case 'lg':
            horizontalPadding = 48;
            break;
        case 'xl':
            horizontalPadding = 64;
            break;
        default:
            horizontalPadding = 24;
    }

    const availableWidth = width - horizontalPadding;
    const itemSpacing = 16;

    // Calculate columns based on available width
    let columns = Math.floor((availableWidth + itemSpacing) / (itemMinWidth + itemSpacing));

    // Apply breakpoint-specific min/max constraints
    switch (breakpoint) {
        case 'xs':
            columns = Math.max(1, Math.min(columns, 2));
            break;
        case 'sm':
            columns = Math.max(2, Math.min(columns, 2));
            break;
        case 'md':
            columns = Math.max(2, Math.min(columns, 3));
            break;
        case 'lg':
            columns = Math.max(3, Math.min(columns, 4));
            break;
        case 'xl':
            columns = Math.max(4, Math.min(columns, maxColumns));
            break;
        default:
            columns = Math.max(1, Math.min(columns, 3));
    }

    return columns;
};

// New utility: Get responsive margin/padding values
export const getResponsivePadding = (base: number, breakpoint: BreakpointKey) => {
    const multipliers = { xs: 0.75, sm: 0.85, md: 1, lg: 1.2, xl: 1.4 };
    return base * (multipliers[breakpoint] || 1);
};

// New utility: Get responsive border radius
export const getResponsiveBorderRadius = (base: number, breakpoint: BreakpointKey) => {
    const multipliers = { xs: 0.8, sm: 0.9, md: 1, lg: 1.1, xl: 1.2 };
    return base * (multipliers[breakpoint] || 1);
};

// New utility: Responsive typography scale
export const getTypographyScale = (breakpoint: BreakpointKey) => {
    switch (breakpoint) {
        case 'xs': return { h1: 24, h2: 20, h3: 18, body: 14, caption: 12 };
        case 'sm': return { h1: 26, h2: 22, h3: 19, body: 15, caption: 13 };
        case 'md': return { h1: 32, h2: 26, h3: 22, body: 16, caption: 14 };
        case 'lg': return { h1: 36, h2: 30, h3: 24, body: 18, caption: 15 };
        case 'xl': return { h1: 40, h2: 34, h3: 26, body: 20, caption: 16 };
        default: return { h1: 28, h2: 24, h3: 20, body: 16, caption: 14 };
    }
};

// New utility: Get optimal card width
export const getOptimalCardWidth = (
    containerWidth: number,
    minWidth: number = 180,
    maxWidth: number = 280,
    breakpoint?: BreakpointKey
) => {
    const columns = getGridColumns(containerWidth, minWidth);
    const spacing = getResponsiveSpacing(16, containerWidth, breakpoint);
    const horizontalPadding = getResponsivePadding(32, breakpoint || getBreakpoint(containerWidth));

    const availableWidth = containerWidth - horizontalPadding;
    const totalSpacing = (columns - 1) * spacing;
    const cardWidth = (availableWidth - totalSpacing) / columns;

    return Math.max(minWidth, Math.min(maxWidth, cardWidth));
};
