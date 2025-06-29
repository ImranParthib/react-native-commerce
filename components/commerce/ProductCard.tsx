import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCart } from '../../contexts/CartContext';
import {
    getOptimalCardWidth,
    getResponsiveBorderRadius,
    getResponsiveFontSize,
    getResponsiveSpacing,
    getTypographyScale,
    useResponsive
} from '../../hooks/useResponsive';
import { Product } from '../../services/woocommerce';

interface ProductCardProps {
    product: Product;
    onPress?: (product: Product) => void;
    containerWidth?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, containerWidth }) => {
    const { addToCart, getCartItem } = useCart();
    const cartItem = getCartItem(product.id);
    const { width, fontScale, breakpoint, isSmallPhone, isTablet } = useResponsive();

    // Calculate optimal card width using enhanced responsive utilities
    const cardWidth = containerWidth
        ? getOptimalCardWidth(containerWidth, isSmallPhone ? 160 : 180, isTablet ? 300 : 250, breakpoint)
        : getOptimalCardWidth(width, isSmallPhone ? 160 : 180, isTablet ? 300 : 250, breakpoint);

    const typography = getTypographyScale(breakpoint);

    const handleAddToCart = () => {
        addToCart(product, 1);
    };

    const formatPrice = (price: string) => {
        const numPrice = parseFloat(price);
        return numPrice > 0 ? `$${numPrice.toFixed(2)}` : 'Free';
    };

    const mainImage = product.images && product.images.length > 0
        ? product.images[0].src
        : null;

    const dynamicStyles = {
        container: {
            ...styles.container,
            width: cardWidth,
            borderRadius: getResponsiveBorderRadius(12, breakpoint),
            marginHorizontal: getResponsiveSpacing(8, width, breakpoint),
            marginVertical: getResponsiveSpacing(6, width, breakpoint),
        },
        imageContainer: {
            ...styles.imageContainer,
            height: cardWidth * (isSmallPhone ? 0.8 : 0.75), // Adjust aspect ratio for small phones
            borderTopLeftRadius: getResponsiveBorderRadius(12, breakpoint),
            borderTopRightRadius: getResponsiveBorderRadius(12, breakpoint),
        },
        name: {
            ...styles.name,
            fontSize: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint),
            minHeight: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint) * 2.5,
            lineHeight: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint) * 1.3,
        },
        price: {
            ...styles.price,
            fontSize: getResponsiveFontSize(typography.h3, fontScale, 1.3, breakpoint),
        },
        regularPrice: {
            ...styles.regularPrice,
            fontSize: getResponsiveFontSize(typography.caption, fontScale, 1.3, breakpoint),
        },
        salePrice: {
            ...styles.salePrice,
            fontSize: getResponsiveFontSize(typography.h3, fontScale, 1.3, breakpoint),
        },
        addButtonText: {
            ...styles.addButtonText,
            fontSize: getResponsiveFontSize(typography.caption, fontScale, 1.3, breakpoint),
        },
        content: {
            ...styles.content,
            padding: getResponsiveSpacing(12, width, breakpoint),
        },
        addButton: {
            ...styles.addButton,
            paddingVertical: getResponsiveSpacing(8, width, breakpoint),
            paddingHorizontal: getResponsiveSpacing(12, width, breakpoint),
            borderRadius: getResponsiveBorderRadius(6, breakpoint),
        },
        saleTag: {
            ...styles.saleTag,
            top: getResponsiveSpacing(8, width, breakpoint),
            right: getResponsiveSpacing(8, width, breakpoint),
            paddingHorizontal: getResponsiveSpacing(8, width, breakpoint),
            paddingVertical: getResponsiveSpacing(4, width, breakpoint),
            borderRadius: getResponsiveBorderRadius(4, breakpoint),
        },
        saleText: {
            ...styles.saleText,
            fontSize: getResponsiveFontSize(10, fontScale, 1.3, breakpoint),
        },
    };

    return (
        <TouchableOpacity
            style={dynamicStyles.container}
            onPress={() => onPress?.(product)}
            activeOpacity={0.7}
        >
            <View style={dynamicStyles.imageContainer}>
                {mainImage ? (
                    <Image
                        source={{ uri: mainImage }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>No Image</Text>
                    </View>
                )}

                {product.on_sale && (
                    <View style={dynamicStyles.saleTag}>
                        <Text style={dynamicStyles.saleText}>SALE</Text>
                    </View>
                )}
            </View>

            <View style={dynamicStyles.content}>
                <Text style={dynamicStyles.name} numberOfLines={2}>
                    {product.name}
                </Text>

                <View style={styles.priceContainer}>
                    {product.on_sale && product.regular_price !== product.sale_price ? (
                        <>
                            <Text style={dynamicStyles.regularPrice}>
                                ${parseFloat(product.regular_price).toFixed(2)}
                            </Text>
                            <Text style={dynamicStyles.salePrice}>
                                {formatPrice(product.price)}
                            </Text>
                        </>
                    ) : (
                        <Text style={dynamicStyles.price}>
                            {formatPrice(product.price)}
                        </Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[dynamicStyles.addButton, cartItem && styles.addButtonInCart]}
                    onPress={handleAddToCart}
                >
                    <Text style={[dynamicStyles.addButtonText, cartItem && styles.addButtonTextInCart]}>
                        {cartItem ? `In Cart (${cartItem.quantity})` : 'Add to Cart'}
                    </Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 8,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
        // Remove fixed width to make it responsive
    },
    imageContainer: {
        width: '100%',
        // Height will be set dynamically
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#999',
        fontSize: 12,
    },
    saleTag: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#ff4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    saleText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    content: {
        padding: 12,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        minHeight: 34,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#007AFF',
    },
    regularPrice: {
        fontSize: 12,
        color: '#999',
        textDecorationLine: 'line-through',
        marginRight: 8,
    },
    salePrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ff4444',
    },
    addButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    addButtonInCart: {
        backgroundColor: '#4CAF50',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    addButtonTextInCart: {
        color: '#fff',
    },
});
