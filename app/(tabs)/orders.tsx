import {
    getResponsiveBorderRadius,
    getResponsiveFontSize,
    getResponsiveSpacing,
    getTypographyScale,
    useResponsive
} from '@/hooks/useResponsive';
import { Order, wooCommerceApi } from '@/services/woocommerce';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StoredOrder {
    id: number;
    orderNumber: string;
    total: string;
    status: string;
    dateCreated: string;
}

interface OrderLineItemDisplay {
    id: number;
    name: string;
    quantity: number;
    price: string;
    total: string;
    product_id: number;
    image?: {
        src: string;
    };
}

export default function OrdersScreen() {
    const [orders, setOrders] = useState<StoredOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
    const { width, fontScale, breakpoint, isTablet } = useResponsive();

    const typography = getTypographyScale(breakpoint);

    const loadOrdersFromStorage = async () => {
        try {
            const storedOrders = await AsyncStorage.getItem('userOrders');
            if (storedOrders) {
                const orderIds: StoredOrder[] = JSON.parse(storedOrders);
                setOrders(orderIds);
            }
        } catch (error) {
            console.error('Error loading orders from storage:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadOrdersFromStorage();
        // Quietly validate orders in the background after initial load
        setTimeout(() => validateOrdersQuietly(), 2000);
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadOrdersFromStorage();
        // Also validate orders to clean up any deleted ones
        await validateOrdersQuietly();
        setRefreshing(false);
    };

    const fetchOrderDetails = async (orderId: number) => {
        try {
            setLoadingOrderDetails(true);
            const orderDetails = await wooCommerceApi.getOrder(orderId);

            // Enhance line items with product images
            const enhancedLineItems: OrderLineItemDisplay[] = await Promise.all(
                orderDetails.line_items.map(async (item: any) => {
                    try {
                        // Fetch product details to get images
                        const product = await wooCommerceApi.getProduct(item.product_id);
                        return {
                            id: item.id,
                            name: item.name,
                            quantity: item.quantity,
                            price: item.price,
                            total: item.total,
                            product_id: item.product_id,
                            image: product.images && product.images.length > 0
                                ? { src: product.images[0].src }
                                : undefined,
                        };
                    } catch (error) {
                        console.warn(`Could not fetch product details for product ${item.product_id}:`, error);
                        // Return line item without image if product fetch fails
                        return {
                            id: item.id,
                            name: item.name,
                            quantity: item.quantity,
                            price: item.price,
                            total: item.total,
                            product_id: item.product_id,
                        };
                    }
                })
            );

            // Create enhanced order object with processed line items
            const enhancedOrder = {
                ...orderDetails,
                line_items: enhancedLineItems,
            };

            // Update local storage with the latest order status
            await updateOrderStatusInStorage(orderId, orderDetails.status, orderDetails.total);

            setSelectedOrder(enhancedOrder);
            setShowOrderModal(true);
        } catch (error: any) {
            console.error('Error fetching order details:', error);

            // Check if the error is a 404 (order not found/deleted)
            if (error?.response?.status === 404) {
                Alert.alert(
                    'Order Not Found',
                    'This order has been deleted from the server. It will be removed from your local list.',
                    [
                        { text: 'OK', onPress: () => removeOrderFromStorage(orderId) }
                    ]
                );
            } else {
                Alert.alert('Error', 'Failed to load order details. Please try again.');
            }
        } finally {
            setLoadingOrderDetails(false);
        }
    };

    const removeOrderFromStorage = async (orderIdToRemove: number) => {
        try {
            const existingOrders = await AsyncStorage.getItem('userOrders');
            if (existingOrders) {
                const orders: StoredOrder[] = JSON.parse(existingOrders);
                const filteredOrders = orders.filter(order => order.id !== orderIdToRemove);
                await AsyncStorage.setItem('userOrders', JSON.stringify(filteredOrders));
                setOrders(filteredOrders);
            }
        } catch (error) {
            console.error('Error removing order from storage:', error);
        }
    };

    const updateOrderStatusInStorage = async (orderId: number, newStatus: string, newTotal: string) => {
        try {
            const existingOrders = await AsyncStorage.getItem('userOrders');
            if (existingOrders) {
                const orders: StoredOrder[] = JSON.parse(existingOrders);
                const updatedOrders = orders.map(order => {
                    if (order.id === orderId) {
                        return {
                            ...order,
                            status: newStatus,
                            total: newTotal,
                        };
                    }
                    return order;
                });
                await AsyncStorage.setItem('userOrders', JSON.stringify(updatedOrders));
                setOrders(updatedOrders);
            }
        } catch (error) {
            console.error('Error updating order status in storage:', error);
        }
    }; const cleanupDeletedOrders = async () => {
        try {
            setRefreshing(true);
            const storedOrders = await AsyncStorage.getItem('userOrders');
            if (!storedOrders) {
                setRefreshing(false);
                return;
            }

            const orders: StoredOrder[] = JSON.parse(storedOrders);
            const validOrders: StoredOrder[] = [];
            let removedCount = 0;
            let updatedCount = 0;

            // Check each order against the server
            for (const order of orders) {
                try {
                    const serverOrder = await wooCommerceApi.getOrder(order.id);

                    // Check if status or total has changed
                    const statusChanged = serverOrder.status !== order.status;
                    const totalChanged = serverOrder.total !== order.total;

                    if (statusChanged || totalChanged) {
                        updatedCount++;
                        validOrders.push({
                            ...order,
                            status: serverOrder.status,
                            total: serverOrder.total,
                        });
                    } else {
                        validOrders.push(order); // Order exists and unchanged
                    }
                } catch (error: any) {
                    if (error?.response?.status === 404) {
                        console.log(`Order ${order.id} deleted from server`);
                        removedCount++;
                        // Order doesn't exist on server, don't add to valid orders
                    } else {
                        // Network error or other issue, keep the order for now
                        validOrders.push(order);
                    }
                }
            }

            // Update storage if any orders were removed or updated
            if (validOrders.length !== orders.length || updatedCount > 0) {
                await AsyncStorage.setItem('userOrders', JSON.stringify(validOrders));
                setOrders(validOrders);

                let message = '';
                if (removedCount > 0 && updatedCount > 0) {
                    message = `Removed ${removedCount} deleted order(s) and updated ${updatedCount} order status(es).`;
                } else if (removedCount > 0) {
                    message = `Removed ${removedCount} deleted order(s) from your local list.`;
                } else if (updatedCount > 0) {
                    message = `Updated ${updatedCount} order status(es) from the server.`;
                }

                Alert.alert('Cleanup Complete', message, [{ text: 'OK' }]);
            } else {
                Alert.alert(
                    'All Orders Valid',
                    'All your orders are up to date with the server.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error cleaning up orders:', error);
            Alert.alert('Error', 'Failed to cleanup orders. Please try again.');
        } finally {
            setRefreshing(false);
        }
    }; const validateOrdersQuietly = async () => {
        try {
            const storedOrders = await AsyncStorage.getItem('userOrders');
            if (!storedOrders) return;

            const orders: StoredOrder[] = JSON.parse(storedOrders);
            const validOrders: StoredOrder[] = [];
            let removedCount = 0;
            let updatedCount = 0;

            // Check each order against the server (in background)
            for (const order of orders) {
                try {
                    const serverOrder = await wooCommerceApi.getOrder(order.id);

                    // Check if status or total has changed
                    const statusChanged = serverOrder.status !== order.status;
                    const totalChanged = serverOrder.total !== order.total;

                    if (statusChanged || totalChanged) {
                        updatedCount++;
                        console.log(`Order ${order.id} status/total updated: ${order.status} -> ${serverOrder.status}, $${order.total} -> $${serverOrder.total}`);
                        validOrders.push({
                            ...order,
                            status: serverOrder.status,
                            total: serverOrder.total,
                        });
                    } else {
                        validOrders.push(order); // Order exists and unchanged
                    }
                } catch (error: any) {
                    if (error?.response?.status === 404) {
                        console.log(`Order ${order.id} no longer exists on server, removing from local storage`);
                        removedCount++;
                        // Order doesn't exist on server, don't add to valid orders
                    } else {
                        // Network error or other issue, keep the order for now
                        validOrders.push(order);
                    }
                }
            }

            // Update storage if any orders were removed or updated
            if (validOrders.length !== orders.length || updatedCount > 0) {
                await AsyncStorage.setItem('userOrders', JSON.stringify(validOrders));
                setOrders(validOrders);

                // Show subtle notification if orders were cleaned up or updated
                if (removedCount > 0) {
                    console.log(`Cleaned up ${removedCount} deleted order(s) from local storage`);
                }
                if (updatedCount > 0) {
                    console.log(`Updated ${updatedCount} order status(es) from server`);
                }
            }
        } catch (error) {
            console.error('Error validating orders:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return '#4CAF50';
            case 'processing':
                return '#FF9800';
            case 'pending':
                return '#2196F3';
            case 'cancelled':
                return '#F44336';
            default:
                return '#666';
        }
    };

    const renderOrder = ({ item }: { item: StoredOrder }) => (
        <TouchableOpacity
            style={dynamicStyles.orderCard}
            onPress={() => fetchOrderDetails(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.orderHeader}>
                <Text style={dynamicStyles.orderNumber}>Order #{item.orderNumber}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={dynamicStyles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.orderDetails}>
                <View style={styles.orderRow}>
                    <Text style={dynamicStyles.orderLabel}>Total:</Text>
                    <Text style={dynamicStyles.orderValue}>${item.total}</Text>
                </View>
                <View style={styles.orderRow}>
                    <Text style={dynamicStyles.orderLabel}>Date:</Text>
                    <Text style={dynamicStyles.orderValue}>
                        {new Date(item.dateCreated).toLocaleDateString()}
                    </Text>
                </View>
            </View>

            <Text style={dynamicStyles.tapToView}>Tap to view details</Text>
        </TouchableOpacity>
    );

    const dynamicStyles = {
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
        orderCard: {
            ...styles.orderCard,
            borderRadius: getResponsiveBorderRadius(12, breakpoint),
            padding: getResponsiveSpacing(16, width, breakpoint),
            marginBottom: getResponsiveSpacing(12, width, breakpoint),
            marginHorizontal: getResponsiveSpacing(16, width, breakpoint),
        },
        orderNumber: {
            ...styles.orderNumber,
            fontSize: getResponsiveFontSize(typography.h2, fontScale, 1.3, breakpoint),
        },
        statusText: {
            ...styles.statusText,
            fontSize: getResponsiveFontSize(typography.caption, fontScale, 1.3, breakpoint),
        },
        orderValue: {
            ...styles.orderValue,
            fontSize: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint),
        },
        orderLabel: {
            ...styles.orderLabel,
            fontSize: getResponsiveFontSize(typography.caption, fontScale, 1.3, breakpoint),
        },
        tapToView: {
            ...styles.tapToView,
            fontSize: getResponsiveFontSize(typography.caption, fontScale, 1.3, breakpoint),
        },
        loadingText: {
            ...styles.loadingText,
            fontSize: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint),
            marginTop: getResponsiveSpacing(16, width, breakpoint),
        },
        emptyText: {
            ...styles.emptyText,
            fontSize: getResponsiveFontSize(typography.h2, fontScale, 1.3, breakpoint),
        },
        emptySubtext: {
            ...styles.emptySubtext,
            fontSize: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint),
        },
        listContainer: {
            ...styles.listContainer,
            padding: getResponsiveSpacing(16, width, breakpoint),
        },
    };

    const renderOrderLineItem = ({ item }: { item: OrderLineItemDisplay }) => (
        <View style={orderModalStyles.lineItem}>
            <View style={orderModalStyles.lineItemImageContainer}>
                {item.image?.src ? (
                    <Image
                        source={{ uri: item.image.src }}
                        style={orderModalStyles.lineItemImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={orderModalStyles.placeholderImage}>
                        <Text style={orderModalStyles.placeholderText}>No Image</Text>
                    </View>
                )}
            </View>
            <View style={orderModalStyles.lineItemDetails}>
                <Text style={orderModalStyles.lineItemName} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={orderModalStyles.lineItemPrice}>
                    ${parseFloat(item.price).toFixed(2)} × {item.quantity}
                </Text>
                <Text style={orderModalStyles.lineItemTotal}>
                    Total: ${parseFloat(item.total).toFixed(2)}
                </Text>
            </View>
        </View>
    );

    const orderModalStyles = {
        modalContainer: {
            ...orderModalBaseStyles.modalContainer,
        },
        modalContent: {
            ...orderModalBaseStyles.modalContent,
            margin: getResponsiveSpacing(20, width, breakpoint),
            borderRadius: getResponsiveBorderRadius(12, breakpoint),
            padding: getResponsiveSpacing(20, width, breakpoint),
        },
        modalHeader: {
            ...orderModalBaseStyles.modalHeader,
            marginBottom: getResponsiveSpacing(20, width, breakpoint),
        },
        modalTitle: {
            ...orderModalBaseStyles.modalTitle,
            fontSize: getResponsiveFontSize(typography.h1, fontScale, 1.3, breakpoint),
        },
        closeButton: {
            ...orderModalBaseStyles.closeButton,
            padding: getResponsiveSpacing(8, width, breakpoint),
        },
        sectionTitle: {
            ...orderModalBaseStyles.sectionTitle,
            fontSize: getResponsiveFontSize(typography.h2, fontScale, 1.3, breakpoint),
            marginBottom: getResponsiveSpacing(12, width, breakpoint),
        },
        infoRow: {
            ...orderModalBaseStyles.infoRow,
            marginBottom: getResponsiveSpacing(8, width, breakpoint),
        },
        infoLabel: {
            ...orderModalBaseStyles.infoLabel,
            fontSize: getResponsiveFontSize(typography.caption, fontScale, 1.3, breakpoint),
        },
        infoValue: {
            ...orderModalBaseStyles.infoValue,
            fontSize: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint),
        },
        lineItem: {
            ...orderModalBaseStyles.lineItem,
            marginBottom: getResponsiveSpacing(16, width, breakpoint),
            borderRadius: getResponsiveBorderRadius(8, breakpoint),
            padding: getResponsiveSpacing(12, width, breakpoint),
        },
        lineItemImageContainer: {
            ...orderModalBaseStyles.lineItemImageContainer,
            width: isTablet ? 80 : 60,
            height: isTablet ? 80 : 60,
            marginRight: getResponsiveSpacing(12, width, breakpoint),
        },
        lineItemImage: {
            ...orderModalBaseStyles.lineItemImage,
        },
        placeholderImage: {
            ...orderModalBaseStyles.placeholderImage,
        },
        placeholderText: {
            ...orderModalBaseStyles.placeholderText,
        },
        lineItemDetails: {
            ...orderModalBaseStyles.lineItemDetails,
        },
        lineItemName: {
            ...orderModalBaseStyles.lineItemName,
            fontSize: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint),
        },
        lineItemPrice: {
            ...orderModalBaseStyles.lineItemPrice,
            fontSize: getResponsiveFontSize(typography.caption, fontScale, 1.3, breakpoint),
        },
        lineItemTotal: {
            ...orderModalBaseStyles.lineItemTotal,
            fontSize: getResponsiveFontSize(typography.body, fontScale, 1.3, breakpoint),
        },
        totalRow: {
            ...orderModalBaseStyles.totalRow,
            marginTop: getResponsiveSpacing(16, width, breakpoint),
            paddingTop: getResponsiveSpacing(16, width, breakpoint),
        },
        totalLabel: {
            ...orderModalBaseStyles.totalLabel,
            fontSize: getResponsiveFontSize(typography.h2, fontScale, 1.3, breakpoint),
        },
        totalAmount: {
            ...orderModalBaseStyles.totalAmount,
            fontSize: getResponsiveFontSize(typography.h1, fontScale, 1.3, breakpoint),
        },
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={dynamicStyles.loadingText}>Loading orders...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={dynamicStyles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={dynamicStyles.headerTitle}>My Orders</Text>
                        <Text style={dynamicStyles.headerSubtitle}>
                            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                        </Text>
                    </View>
                    {orders.length > 0 && (
                        <TouchableOpacity
                            style={styles.cleanupButton}
                            onPress={cleanupDeletedOrders}
                        >
                            <Text style={styles.cleanupButtonText}>Cleanup</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <FlatList
                data={orders}
                renderItem={renderOrder}
                keyExtractor={(item, index) => `order-${item.id}-${index}`}
                contentContainerStyle={dynamicStyles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={dynamicStyles.emptyText}>No orders found</Text>
                        <Text style={dynamicStyles.emptySubtext}>
                            Your orders will appear here after you make a purchase
                        </Text>
                    </View>
                )}
            />

            {/* Order Details Modal */}
            <Modal
                visible={showOrderModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowOrderModal(false)}
            >
                <View style={orderModalStyles.modalContainer}>
                    <View style={orderModalStyles.modalContent}>
                        {loadingOrderDetails ? (
                            <View style={orderModalBaseStyles.loadingContainer}>
                                <ActivityIndicator size="large" color="#007AFF" />
                                <Text style={orderModalStyles.infoValue}>Loading order details...</Text>
                            </View>
                        ) : selectedOrder ? (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Header */}
                                <View style={orderModalStyles.modalHeader}>
                                    <Text style={orderModalStyles.modalTitle}>
                                        Order #{selectedOrder.number}
                                    </Text>
                                    <TouchableOpacity
                                        style={orderModalStyles.closeButton}
                                        onPress={() => setShowOrderModal(false)}
                                    >
                                        <Text style={orderModalBaseStyles.closeButtonText}>✕</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Order Info */}
                                <Text style={orderModalStyles.sectionTitle}>Order Information</Text>
                                <View style={orderModalStyles.infoRow}>
                                    <Text style={orderModalStyles.infoLabel}>Status:</Text>
                                    <View style={[orderModalBaseStyles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
                                        <Text style={orderModalBaseStyles.statusText}>{selectedOrder.status.toUpperCase()}</Text>
                                    </View>
                                </View>
                                <View style={orderModalStyles.infoRow}>
                                    <Text style={orderModalStyles.infoLabel}>Date:</Text>
                                    <Text style={orderModalStyles.infoValue}>
                                        {new Date(selectedOrder.date_created).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Text>
                                </View>
                                <View style={orderModalStyles.infoRow}>
                                    <Text style={orderModalStyles.infoLabel}>Payment:</Text>
                                    <Text style={orderModalStyles.infoValue}>{selectedOrder.payment_method_title}</Text>
                                </View>

                                {/* Billing Address */}
                                <Text style={orderModalStyles.sectionTitle}>Billing Address</Text>
                                <Text style={orderModalStyles.infoValue}>
                                    {selectedOrder.billing.first_name} {selectedOrder.billing.last_name}
                                </Text>
                                <Text style={orderModalStyles.infoValue}>{selectedOrder.billing.address_1}</Text>
                                <Text style={orderModalStyles.infoValue}>
                                    {selectedOrder.billing.city}, {selectedOrder.billing.state} {selectedOrder.billing.postcode}
                                </Text>
                                <Text style={orderModalStyles.infoValue}>{selectedOrder.billing.country}</Text>
                                <Text style={orderModalStyles.infoValue}>{selectedOrder.billing.email}</Text>
                                <Text style={orderModalStyles.infoValue}>{selectedOrder.billing.phone}</Text>

                                {/* Order Items */}
                                <Text style={orderModalStyles.sectionTitle}>Order Items</Text>
                                <FlatList
                                    data={selectedOrder.line_items}
                                    renderItem={renderOrderLineItem}
                                    keyExtractor={(item, index) => `order-item-${item.id}-${index}`}
                                    scrollEnabled={false}
                                />

                                {/* Total */}
                                <View style={orderModalStyles.totalRow}>
                                    <Text style={orderModalStyles.totalLabel}>Total:</Text>
                                    <Text style={orderModalStyles.totalAmount}>${parseFloat(selectedOrder.total).toFixed(2)}</Text>
                                </View>
                            </ScrollView>
                        ) : null}
                    </View>
                </View>
            </Modal>

            {loading && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            )}
        </View>
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
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
    },
    cleanupButton: {
        backgroundColor: '#FF9800',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    cleanupButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    listContainer: {
        padding: 16,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderNumber: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    orderDetails: {
        marginBottom: 12,
    },
    orderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    orderLabel: {
        fontSize: 14,
        color: '#666',
    },
    orderValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    tapToView: {
        fontSize: 12,
        color: '#007AFF',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

const orderModalBaseStyles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        maxHeight: '90%',
        width: '90%',
        maxWidth: 500,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingBottom: 16,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        flex: 1,
    },
    closeButton: {
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 18,
        color: '#666',
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginTop: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
        flex: 2,
        textAlign: 'right',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    lineItem: {
        flexDirection: 'row',
        backgroundColor: '#f8f8f8',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    lineItemImageContainer: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        overflow: 'hidden',
    },
    lineItemImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#999',
        fontSize: 10,
    },
    lineItemDetails: {
        flex: 1,
        justifyContent: 'space-between',
    },
    lineItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    lineItemPrice: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    lineItemTotal: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 2,
        borderTopColor: '#e0e0e0',
    },
    totalLabel: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: '#007AFF',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
});
