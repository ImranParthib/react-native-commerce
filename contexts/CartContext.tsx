import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import { Product } from '../services/woocommerce';

// Types
export interface CartItem {
    product: Product;
    quantity: number;
}

export interface CartState {
    items: CartItem[];
    total: number;
    itemCount: number;
}

export interface CartContextType {
    state: CartState;
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    getCartItem: (productId: number) => CartItem | undefined;
}

// Actions
type CartAction =
    | { type: 'ADD_TO_CART'; payload: { product: Product; quantity: number } }
    | { type: 'REMOVE_FROM_CART'; payload: { productId: number } }
    | { type: 'UPDATE_QUANTITY'; payload: { productId: number; quantity: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'LOAD_CART'; payload: { items: CartItem[] } };

// Initial state
const initialState: CartState = {
    items: [],
    total: 0,
    itemCount: 0,
};

// Helper functions
const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((total, item) => {
        const price = parseFloat(item.product.price) || 0;
        return total + (price * item.quantity);
    }, 0);
};

const calculateItemCount = (items: CartItem[]): number => {
    return items.reduce((count, item) => count + item.quantity, 0);
};

// Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_TO_CART': {
            const { product, quantity } = action.payload;
            const existingItemIndex = state.items.findIndex(item => item.product.id === product.id);

            let newItems: CartItem[];

            if (existingItemIndex >= 0) {
                // Update existing item
                newItems = state.items.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                // Add new item
                newItems = [...state.items, { product, quantity }];
            }

            return {
                items: newItems,
                total: calculateTotal(newItems),
                itemCount: calculateItemCount(newItems),
            };
        }

        case 'REMOVE_FROM_CART': {
            const newItems = state.items.filter(item => item.product.id !== action.payload.productId);
            return {
                items: newItems,
                total: calculateTotal(newItems),
                itemCount: calculateItemCount(newItems),
            };
        }

        case 'UPDATE_QUANTITY': {
            const { productId, quantity } = action.payload;

            if (quantity <= 0) {
                const newItems = state.items.filter(item => item.product.id !== productId);
                return {
                    items: newItems,
                    total: calculateTotal(newItems),
                    itemCount: calculateItemCount(newItems),
                };
            }

            const newItems = state.items.map(item =>
                item.product.id === productId
                    ? { ...item, quantity }
                    : item
            );

            return {
                items: newItems,
                total: calculateTotal(newItems),
                itemCount: calculateItemCount(newItems),
            };
        }

        case 'CLEAR_CART':
            return initialState;

        case 'LOAD_CART': {
            const items = action.payload.items;
            return {
                items,
                total: calculateTotal(items),
                itemCount: calculateItemCount(items),
            };
        }

        default:
            return state;
    }
};

// Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider
interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Load cart from AsyncStorage on app start
    useEffect(() => {
        loadCartFromStorage();
    }, []);

    // Save cart to AsyncStorage whenever cart changes
    useEffect(() => {
        const saveCartToStorage = async () => {
            try {
                await AsyncStorage.setItem('cart', JSON.stringify(state.items));
            } catch (error) {
                console.error('Error saving cart to storage:', error);
            }
        };

        saveCartToStorage();
    }, [state.items]);

    const loadCartFromStorage = async () => {
        try {
            const cartData = await AsyncStorage.getItem('cart');
            if (cartData) {
                const items: CartItem[] = JSON.parse(cartData);
                dispatch({ type: 'LOAD_CART', payload: { items } });
            }
        } catch (error) {
            console.error('Error loading cart from storage:', error);
        }
    };

    const addToCart = (product: Product, quantity = 1) => {
        dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
    };

    const removeFromCart = (productId: number) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: { productId } });
    };

    const updateQuantity = (productId: number, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const getCartItem = (productId: number): CartItem | undefined => {
        return state.items.find(item => item.product.id === productId);
    };

    const value: CartContextType = {
        state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartItem,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

// Hook
export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
