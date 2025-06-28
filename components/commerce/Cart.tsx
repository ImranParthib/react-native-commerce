import React from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CartItem, useCart } from '../../contexts/CartContext';

interface CartItemComponentProps {
    item: CartItem;
    onUpdateQuantity: (productId: number, quantity: number) => void;
    onRemove: (productId: number) => void;
}

const CartItemComponent: React.FC<CartItemComponentProps> = ({ item, onUpdateQuantity, onRemove }) => {
    const { product, quantity } = item;
    const productPrice = parseFloat(product.price) || 0;
    const itemTotal = productPrice * quantity;

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

    return (
        <View style={styles.cartItem}>
            <View style={styles.imageContainer}>
                {mainImage ? (
                    <Image source={{ uri: mainImage }} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>No Image</Text>
                    </View>
                )}
            </View>

            <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>
                    {product.name}
                </Text>
                <Text style={styles.itemPrice}>
                    ${productPrice.toFixed(2)} each
                </Text>
                <Text style={styles.itemTotal}>
                    Total: ${itemTotal.toFixed(2)}
                </Text>

                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => onUpdateQuantity(product.id, quantity - 1)}
                    >
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>

                    <Text style={styles.quantity}>{quantity}</Text>

                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => onUpdateQuantity(product.id, quantity + 1)}
                    >
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={handleRemove}
                    >
                        <Text style={styles.removeButtonText}>Remove</Text>
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

    if (state.items.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Your cart is empty</Text>
                <Text style={styles.emptySubtext}>Add some products to get started!</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    Shopping Cart ({state.itemCount} {state.itemCount === 1 ? 'item' : 'items'})
                </Text>
                <TouchableOpacity onPress={handleClearCart}>
                    <Text style={styles.clearButton}>Clear All</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={state.items}
                keyExtractor={(item) => item.product.id.toString()}
                renderItem={({ item }) => (
                    <CartItemComponent
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromCart}
                    />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            />

            <View style={styles.footer}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalAmount}>${state.total.toFixed(2)}</Text>
                </View>

                {onCheckout && (
                    <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
                        <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
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
