import { useCart } from '@/contexts/CartContext';
import {
    getResponsiveBorderRadius,
    getResponsiveFontSize,
    getResponsiveSpacing,
    getTypographyScale,
    useResponsive
} from '@/hooks/useResponsive';
import { CreateOrderData, wooCommerceApi } from '@/services/woocommerce';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CustomerInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
}

export default function CheckoutScreen() {
    const { state, clearCart } = useCart();
    const { width, fontScale, breakpoint, isSmallPhone, isTablet } = useResponsive();

    const typography = getTypographyScale(breakpoint);

    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postcode: '',
        country: 'BD', // Default to Bangladesh
    });
    const [loading, setLoading] = useState(false);

    const saveOrderToStorage = async (order: any) => {
        try {
            const existingOrders = await AsyncStorage.getItem('userOrders');
            const orders = existingOrders ? JSON.parse(existingOrders) : [];

            const newOrder = {
                id: order.id,
                orderNumber: order.number,
                total: order.total,
                status: order.status,
                dateCreated: order.date_created,
            };

            orders.unshift(newOrder); // Add to beginning of array
            await AsyncStorage.setItem('userOrders', JSON.stringify(orders));
        } catch (error) {
            console.error('Error saving order to storage:', error);
        }
    };

    const updateCustomerInfo = (field: keyof CustomerInfo, value: string) => {
        setCustomerInfo(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = (): boolean => {
        const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'postcode'];

        for (const field of required) {
            if (!customerInfo[field as keyof CustomerInfo].trim()) {
                Alert.alert('Error', `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                return false;
            }
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerInfo.email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return false;
        }

        return true;
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) return;

        if (state.items.length === 0) {
            Alert.alert('Error', 'Your cart is empty');
            return;
        }

        setLoading(true);

        try {
            const orderData: CreateOrderData = {
                payment_method: 'cod', // Cash on delivery
                payment_method_title: 'Cash on Delivery',
                set_paid: false,
                billing: {
                    first_name: customerInfo.firstName,
                    last_name: customerInfo.lastName,
                    address_1: customerInfo.address,
                    city: customerInfo.city,
                    state: customerInfo.state,
                    postcode: customerInfo.postcode,
                    country: customerInfo.country,
                    email: customerInfo.email,
                    phone: customerInfo.phone,
                },
                shipping: {
                    first_name: customerInfo.firstName,
                    last_name: customerInfo.lastName,
                    address_1: customerInfo.address,
                    city: customerInfo.city,
                    state: customerInfo.state,
                    postcode: customerInfo.postcode,
                    country: customerInfo.country,
                },
                line_items: state.items.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    name: item.product.name,
                    price: item.product.price,
                })),
            };

            const order = await wooCommerceApi.createOrder(orderData);

            // Save order to local storage
            await saveOrderToStorage(order);

            Alert.alert(
                'Order Placed Successfully!',
                `Your order #${order.number} has been placed. Total: $${order.total}`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            clearCart();
                            router.back();
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Error placing order:', error);
            Alert.alert('Error', 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const dynamicStyles = {
        container: {
            ...styles.container,
        },
        header: {
            ...styles.header,
            padding: getResponsiveSpacing(20, width, breakpoint),
            paddingTop: isTablet ? getResponsiveSpacing(40, width, breakpoint) : 60,
        },
        headerTitle: {
            ...styles.headerTitle,
            fontSize: getResponsiveFontSize(typography.h1, fontScale, 1.3, breakpoint),
        },
        headerSubtitle: {
            ...styles.headerSubtitle,
            fontSize: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint),
        },
        section: {
            ...styles.section,
            margin: getResponsiveSpacing(16, width, breakpoint),
            padding: getResponsiveSpacing(16, width, breakpoint),
            borderRadius: getResponsiveBorderRadius(8, breakpoint),
        },
        sectionTitle: {
            ...styles.sectionTitle,
            fontSize: getResponsiveFontSize(typography.h2, fontScale, 1.3, breakpoint),
            marginBottom: getResponsiveSpacing(16, width, breakpoint),
        },
        input: {
            ...styles.input,
            paddingHorizontal: getResponsiveSpacing(16, width, breakpoint),
            paddingVertical: getResponsiveSpacing(12, width, breakpoint),
            borderRadius: getResponsiveBorderRadius(8, breakpoint),
            fontSize: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint),
            marginBottom: getResponsiveSpacing(12, width, breakpoint),
        },
        halfInput: {
            width: isSmallPhone ? '100%' as const : '48%' as const,
        },
        row: {
            ...styles.row,
            flexDirection: (isSmallPhone ? 'column' : 'row') as 'row' | 'column',
            justifyContent: (isSmallPhone ? 'flex-start' : 'space-between') as 'flex-start' | 'space-between',
        },
        placeOrderButton: {
            ...styles.placeOrderButton,
            margin: getResponsiveSpacing(16, width, breakpoint),
            paddingVertical: getResponsiveSpacing(16, width, breakpoint),
            borderRadius: getResponsiveBorderRadius(8, breakpoint),
            marginBottom: getResponsiveSpacing(32, width, breakpoint),
        },
        placeOrderButtonText: {
            ...styles.placeOrderButtonText,
            fontSize: getResponsiveFontSize(typography.h3, fontScale, 1.3, breakpoint),
        },
        paymentMethodText: {
            ...styles.paymentMethodText,
            fontSize: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint),
        },
        paymentMethodSubtext: {
            ...styles.paymentMethodSubtext,
            fontSize: getResponsiveFontSize(typography.caption, fontScale, 1.3, breakpoint),
        },
        orderItemName: {
            ...styles.orderItemName,
            fontSize: getResponsiveFontSize(typography.caption, fontScale, 1.3, breakpoint),
        },
        orderItemDetails: {
            ...styles.orderItemDetails,
            fontSize: getResponsiveFontSize(typography.caption, fontScale, 1.3, breakpoint),
        },
        orderItemTotal: {
            ...styles.orderItemTotal,
            fontSize: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint),
        },
        totalLabel: {
            ...styles.totalLabel,
            fontSize: getResponsiveFontSize(typography.h2, fontScale, 1.3, breakpoint),
        },
        totalAmount: {
            ...styles.totalAmount,
            fontSize: getResponsiveFontSize(typography.h1, fontScale, 1.3, breakpoint),
        },
    };

    return (
        <ScrollView style={dynamicStyles.container}>
            <View style={dynamicStyles.header}>
                <Text style={dynamicStyles.headerTitle}>Checkout</Text>
                <Text style={dynamicStyles.headerSubtitle}>
                    {state.itemCount} items • Total: ${state.total.toFixed(2)}
                </Text>
            </View>

            <View style={dynamicStyles.section}>
                <Text style={dynamicStyles.sectionTitle}>Customer Information</Text>

                <View style={dynamicStyles.row}>
                    <View style={dynamicStyles.halfInput}>
                        <TextInput
                            style={dynamicStyles.input}
                            placeholder="First Name"
                            value={customerInfo.firstName}
                            onChangeText={(text) => updateCustomerInfo('firstName', text)}
                        />
                    </View>
                    <View style={dynamicStyles.halfInput}>
                        <TextInput
                            style={dynamicStyles.input}
                            placeholder="Last Name"
                            value={customerInfo.lastName}
                            onChangeText={(text) => updateCustomerInfo('lastName', text)}
                        />
                    </View>
                </View>

                <TextInput
                    style={dynamicStyles.input}
                    placeholder="Email"
                    value={customerInfo.email}
                    onChangeText={(text) => updateCustomerInfo('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    style={dynamicStyles.input}
                    placeholder="Phone"
                    value={customerInfo.phone}
                    onChangeText={(text) => updateCustomerInfo('phone', text)}
                    keyboardType="phone-pad"
                />
            </View>

            <View style={dynamicStyles.section}>
                <Text style={dynamicStyles.sectionTitle}>Shipping Address</Text>

                <TextInput
                    style={dynamicStyles.input}
                    placeholder="Address"
                    value={customerInfo.address}
                    onChangeText={(text) => updateCustomerInfo('address', text)}
                />

                <View style={dynamicStyles.row}>
                    <View style={dynamicStyles.halfInput}>
                        <TextInput
                            style={dynamicStyles.input}
                            placeholder="City"
                            value={customerInfo.city}
                            onChangeText={(text) => updateCustomerInfo('city', text)}
                        />
                    </View>
                    <View style={dynamicStyles.halfInput}>
                        <TextInput
                            style={dynamicStyles.input}
                            placeholder="State"
                            value={customerInfo.state}
                            onChangeText={(text) => updateCustomerInfo('state', text)}
                        />
                    </View>
                </View>

                <View style={dynamicStyles.row}>
                    <View style={dynamicStyles.halfInput}>
                        <TextInput
                            style={dynamicStyles.input}
                            placeholder="Postal Code"
                            value={customerInfo.postcode}
                            onChangeText={(text) => updateCustomerInfo('postcode', text)}
                        />
                    </View>
                    <View style={dynamicStyles.halfInput}>
                        <TextInput
                            style={dynamicStyles.input}
                            placeholder="Country"
                            value={customerInfo.country}
                            onChangeText={(text) => updateCustomerInfo('country', text)}
                        />
                    </View>
                </View>
            </View>

            <View style={dynamicStyles.section}>
                <Text style={dynamicStyles.sectionTitle}>Payment Method</Text>
                <View style={styles.paymentMethod}>
                    <Text style={dynamicStyles.paymentMethodText}>Cash on Delivery</Text>
                    <Text style={dynamicStyles.paymentMethodSubtext}>Pay when you receive your order</Text>
                </View>
            </View>

            <View style={styles.orderSummary}>
                <Text style={dynamicStyles.sectionTitle}>Order Summary</Text>
                {state.items.map((item, index) => (
                    <View key={`checkout-item-${item.product.id}-${index}`} style={styles.orderItem}>
                        <Text style={dynamicStyles.orderItemName}>{item.product.name}</Text>
                        <Text style={dynamicStyles.orderItemDetails}>
                            {item.quantity} × ${parseFloat(item.product.price).toFixed(2)}
                        </Text>
                        <Text style={dynamicStyles.orderItemTotal}>
                            ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                        </Text>
                    </View>
                ))}

                <View style={styles.totalContainer}>
                    <Text style={dynamicStyles.totalLabel}>Total:</Text>
                    <Text style={dynamicStyles.totalAmount}>${state.total.toFixed(2)}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[dynamicStyles.placeOrderButton, loading && styles.placeOrderButtonDisabled]}
                onPress={handlePlaceOrder}
                disabled={loading}
            >
                <Text style={dynamicStyles.placeOrderButtonText}>
                    {loading ? 'Placing Order...' : 'Place Order'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
    },
    section: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    input: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        fontSize: 16,
        color: '#333',
        marginBottom: 12,
    },
    halfInput: {
        width: '48%',
    },
    paymentMethod: {
        backgroundColor: '#f0f0f0',
        padding: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#007AFF',
    },
    paymentMethodText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    paymentMethodSubtext: {
        fontSize: 14,
        color: '#666',
    },
    orderSummary: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    orderItemName: {
        flex: 2,
        fontSize: 14,
        color: '#333',
    },
    orderItemDetails: {
        flex: 1,
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    orderItemTotal: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'right',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 2,
        borderTopColor: '#e0e0e0',
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
    placeOrderButton: {
        backgroundColor: '#4CAF50',
        margin: 16,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 32,
    },
    placeOrderButtonDisabled: {
        backgroundColor: '#ccc',
    },
    placeOrderButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
