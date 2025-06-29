import React from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CartItem, useCart } from '../../contexts/CartContext';
import {
    getResponsiveBorderRadius,
    getResponsiveFontSize,
    getResponsiveSpacing,
    getTypographyScale,
    useResponsive
} from '../../hooks/useResponsive';

interface CartItemComponentProps {
    item: CartItem;
    onUpdateQuantity: (productId: number, quantity: number) => void;
    onRemove: (productId: number) => void;
}

const CartItemComponent: React.FC<CartItemComponentProps> = ({ item, onUpdateQuantity, onRemove }) => {
    const { product, quantity } = item;
    const productPrice = parseFloat(product.price) || 0;
    const itemTotal = productPrice * quantity;
    const { width, fontScale, isTablet, breakpoint, isSmallPhone } = useResponsive();

    const typography = getTypographyScale(breakpoint);

    const mainImage = product.images && product.images.length > 0
        ? product.images[0].src
        : null;

    const handleRemove = () => {
        Alert.alert(
            'Remove Item',
            `Are you sure you want to remove ${product.name} from your cart?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => onRemove(product.id) },
            ]
        );
    };

    const dynamicStyles = {
        cartItem: {
            ...styles.cartItem,
            marginHorizontal: getResponsiveSpacing(16, width, breakpoint),
            padding: getResponsiveSpacing(12, width, breakpoint),
            borderRadius: getResponsiveBorderRadius(8, breakpoint),
        },
        imageContainer: {
            ...styles.imageContainer,
            width: isSmallPhone ? 70 : isTablet ? 100 : 80,
            height: isSmallPhone ? 70 : isTablet ? 100 : 80,
            marginRight: getResponsiveSpacing(12, width, breakpoint),
            borderRadius: getResponsiveBorderRadius(6, breakpoint),
        },
        itemName: {
            ...styles.itemName,
            fontSize: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint),
            lineHeight: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint) * 1.3,
        },
        itemPrice: {
            ...styles.itemPrice,
            fontSize: getResponsiveFontSize(typography.caption, fontScale, 1.3, breakpoint),
        },
        itemTotal: {
            ...styles.itemTotal,
            fontSize: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint),
        },
        quantity: {
            ...styles.quantity,
            fontSize: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint),
            minWidth: isSmallPhone ? 25 : 30,
        },
        quantityButton: {
            ...styles.quantityButton,
            width: isSmallPhone ? 26 : isTablet ? 36 : 30,
            height: isSmallPhone ? 26 : isTablet ? 36 : 30,
            borderRadius: getResponsiveBorderRadius(4, breakpoint),
        },
        quantityButtonText: {
            ...styles.quantityButtonText,
            fontSize: getResponsiveFontSize(typography.h3, fontScale, 1.3, breakpoint),
        },
        removeButton: {
            ...styles.removeButton,
            marginLeft: getResponsiveSpacing(isSmallPhone ? 8 : 16, width, breakpoint),
            paddingVertical: getResponsiveSpacing(6, width, breakpoint),
            paddingHorizontal: getResponsiveSpacing(isSmallPhone ? 8 : 12, width, breakpoint),
            borderRadius: getResponsiveBorderRadius(4, breakpoint),
        },
        removeButtonText: {
            ...styles.removeButtonText,
            fontSize: getResponsiveFontSize(typography.caption, fontScale, 1.3, breakpoint),
        },
    };

    return (
        <View style={dynamicStyles.cartItem}>
            <View style={dynamicStyles.imageContainer}>
                {mainImage ? (
                    <Image source={{ uri: mainImage }} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>No Image</Text>
                    </View>
                )}
            </View>

            <View style={styles.itemDetails}>
                <Text style={dynamicStyles.itemName} numberOfLines={2}>
                    {product.name}
                </Text>
                <Text style={dynamicStyles.itemPrice}>
                    ${productPrice.toFixed(2)} each
                </Text>
                <Text style={dynamicStyles.itemTotal}>
                    Total: ${itemTotal.toFixed(2)}
                </Text>

                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        style={dynamicStyles.quantityButton}
                        onPress={() => onUpdateQuantity(product.id, quantity - 1)}
                    >
                        <Text style={dynamicStyles.quantityButtonText}>-</Text>
                    </TouchableOpacity>

                    <Text style={dynamicStyles.quantity}>{quantity}</Text>

                    <TouchableOpacity
                        style={dynamicStyles.quantityButton}
                        onPress={() => onUpdateQuantity(product.id, quantity + 1)}
                    >
                        <Text style={dynamicStyles.quantityButtonText}>+</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={dynamicStyles.removeButton}
                        onPress={handleRemove}
                    >
                        <Text style={dynamicStyles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

interface CartProps {
    onCheckout?: () => void;
}

export const Cart: React.FC<CartProps> = ({ onCheckout }) => {
    const { state, updateQuantity, removeFromCart, clearCart } = useCart();
    const { width, fontScale, breakpoint, isSmallPhone } = useResponsive();

    const typography = getTypographyScale(breakpoint);

    const handleClearCart = () => {
        if (state.items.length === 0) return;

        Alert.alert(
            'Clear Cart',
            'Are you sure you want to clear your entire cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: clearCart },
            ]
        );
    };

    const dynamicStyles = {
        header: {
            ...styles.header,
            padding: getResponsiveSpacing(16, width, breakpoint),
            borderBottomWidth: isSmallPhone ? 0.5 : 1,
        },
        headerTitle: {
            ...styles.headerTitle,
            fontSize: getResponsiveFontSize(typography.h2, fontScale, 1.3, breakpoint),
        },
        clearButton: {
            ...styles.clearButton,
            fontSize: getResponsiveFontSize(typography.caption, fontScale, 1.3, breakpoint),
        },
        footer: {
            ...styles.footer,
            padding: getResponsiveSpacing(16, width, breakpoint),
            borderTopWidth: isSmallPhone ? 0.5 : 1,
        },
        totalLabel: {
            ...styles.totalLabel,
            fontSize: getResponsiveFontSize(typography.h2, fontScale, 1.3, breakpoint),
        },
        totalAmount: {
            ...styles.totalAmount,
            fontSize: getResponsiveFontSize(typography.h1, fontScale, 1.3, breakpoint),
        },
        checkoutButton: {
            ...styles.checkoutButton,
            paddingVertical: getResponsiveSpacing(14, width, breakpoint),
            borderRadius: getResponsiveBorderRadius(8, breakpoint),
        },
        checkoutButtonText: {
            ...styles.checkoutButtonText,
            fontSize: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint),
        },
        emptyText: {
            ...styles.emptyText,
            fontSize: getResponsiveFontSize(typography.h1, fontScale, 1.3, breakpoint),
        },
        emptySubtext: {
            ...styles.emptySubtext,
            fontSize: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint),
        },
        listContainer: {
            ...styles.listContainer,
            paddingVertical: getResponsiveSpacing(8, width, breakpoint),
        },
        emptyContainer: {
            ...styles.emptyContainer,
            padding: getResponsiveSpacing(32, width, breakpoint),
        },
    };

    if (state.items.length === 0) {
        return (
            <View style={dynamicStyles.emptyContainer}>
                <Text style={dynamicStyles.emptyText}>Your cart is empty</Text>
                <Text style={dynamicStyles.emptySubtext}>Add some products to get started!</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={dynamicStyles.header}>
                <Text style={dynamicStyles.headerTitle}>
                    Shopping Cart ({state.itemCount} {state.itemCount === 1 ? 'item' : 'items'})
                </Text>
                <TouchableOpacity onPress={handleClearCart}>
                    <Text style={dynamicStyles.clearButton}>Clear All</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={state.items}
                keyExtractor={(item, index) => `cart-item-${item.product.id}-${index}`}
                renderItem={({ item }) => (
                    <CartItemComponent
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromCart}
                    />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={dynamicStyles.listContainer}
            />

            <View style={dynamicStyles.footer}>
                <View style={styles.totalContainer}>
                    <Text style={dynamicStyles.totalLabel}>Total:</Text>
                    <Text style={dynamicStyles.totalAmount}>${state.total.toFixed(2)}</Text>
                </View>

                {onCheckout && (
                    <TouchableOpacity style={dynamicStyles.checkoutButton} onPress={onCheckout}>
                        <Text style={dynamicStyles.checkoutButtonText}>Proceed to Checkout</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    clearButton: {
        color: '#ff4444',
        fontSize: 14,
        fontWeight: '500',
    },
    listContainer: {
        paddingVertical: 8,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginVertical: 4,
        padding: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    imageContainer: {
        width: 80,
        height: 80,
        marginRight: 12,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 6,
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
    },
    placeholderText: {
        color: '#999',
        fontSize: 10,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    itemTotal: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
        marginBottom: 8,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 30,
        height: 30,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
    },
    quantityButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    quantity: {
        fontSize: 16,
        fontWeight: '600',
        marginHorizontal: 12,
        minWidth: 30,
        textAlign: 'center',
    },
    removeButton: {
        marginLeft: 16,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#ff4444',
        borderRadius: 4,
    },
    removeButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    footer: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    totalAmount: {
        fontSize: 22,
        fontWeight: '700',
        color: '#007AFF',
    },
    checkoutButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
});
