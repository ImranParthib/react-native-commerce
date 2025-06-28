import axios, { AxiosInstance } from 'axios';

// WooCommerce API Configuration - Load from environment variables
const API_URL = process.env.EXPO_PUBLIC_WOOCOMMERCE_URL || 'https://ec.extramilebd.com/wp-json/wc/v3';
const CONSUMER_KEY = process.env.EXPO_PUBLIC_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.EXPO_PUBLIC_CONSUMER_SECRET || '';

// Validate environment variables
if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    console.warn('Warning: WooCommerce API credentials not found in environment variables');
    console.warn('Please create a .env file with EXPO_PUBLIC_CONSUMER_KEY and EXPO_PUBLIC_CONSUMER_SECRET');
}

// Create axios instance with authentication
const wooCommerceAxios: AxiosInstance = axios.create({
    baseURL: API_URL,
    auth: {
        username: CONSUMER_KEY,
        password: CONSUMER_SECRET,
    },
    timeout: 10000,
});

// Types
export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    display: string;
    image: {
        id: number;
        src: string;
        name: string;
        alt: string;
    } | null;
    menu_order: number;
    count: number;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    permalink: string;
    date_created: string;
    date_modified: string;
    type: string;
    status: string;
    featured: boolean;
    catalog_visibility: string;
    description: string;
    short_description: string;
    sku: string;
    price: string;
    regular_price: string;
    sale_price: string;
    on_sale: boolean;
    purchasable: boolean;
    total_sales: number;
    virtual: boolean;
    downloadable: boolean;
    downloads: any[];
    download_limit: number;
    download_expiry: number;
    external_url: string;
    button_text: string;
    tax_status: string;
    tax_class: string;
    manage_stock: boolean;
    stock_quantity: number | null;
    stock_status: string;
    backorders: string;
    backorders_allowed: boolean;
    backordered: boolean;
    sold_individually: boolean;
    weight: string;
    dimensions: {
        length: string;
        width: string;
        height: string;
    };
    shipping_required: boolean;
    shipping_taxable: boolean;
    shipping_class: string;
    shipping_class_id: number;
    reviews_allowed: boolean;
    average_rating: string;
    rating_count: number;
    related_ids: number[];
    upsell_ids: number[];
    cross_sell_ids: number[];
    parent_id: number;
    purchase_note: string;
    categories: {
        id: number;
        name: string;
        slug: string;
    }[];
    tags: any[];
    images: {
        id: number;
        date_created: string;
        date_modified: string;
        src: string;
        name: string;
        alt: string;
        position: number;
    }[];
    attributes: any[];
    default_attributes: any[];
    variations: number[];
    grouped_products: number[];
    menu_order: number;
    meta_data: any[];
}

export interface OrderLineItem {
    product_id: number;
    quantity: number;
    name?: string;
    price?: string;
}

export interface CreateOrderData {
    payment_method: string;
    payment_method_title: string;
    set_paid: boolean;
    billing: {
        first_name: string;
        last_name: string;
        address_1: string;
        address_2?: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
        email: string;
        phone: string;
    };
    shipping: {
        first_name: string;
        last_name: string;
        address_1: string;
        address_2?: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
    };
    line_items: OrderLineItem[];
}

export interface Order {
    id: number;
    parent_id: number;
    number: string;
    order_key: string;
    created_via: string;
    version: string;
    status: string;
    currency: string;
    date_created: string;
    date_modified: string;
    discount_total: string;
    discount_tax: string;
    shipping_total: string;
    shipping_tax: string;
    cart_tax: string;
    total: string;
    total_tax: string;
    prices_include_tax: boolean;
    customer_id: number;
    customer_ip_address: string;
    customer_user_agent: string;
    customer_note: string;
    billing: any;
    shipping: any;
    payment_method: string;
    payment_method_title: string;
    transaction_id: string;
    date_paid: string | null;
    date_completed: string | null;
    cart_hash: string;
    meta_data: any[];
    line_items: any[];
    tax_lines: any[];
    shipping_lines: any[];
    fee_lines: any[];
    coupon_lines: any[];
    refunds: any[];
}

// API Functions
export const wooCommerceApi = {
    // Get all categories
    getCategories: async (params?: { per_page?: number; page?: number }): Promise<Category[]> => {
        try {
            const response = await wooCommerceAxios.get('/products/categories', {
                params: {
                    per_page: params?.per_page || 100,
                    page: params?.page || 1,
                    hide_empty: true,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    // Get products by category
    getProductsByCategory: async (
        categoryId: number,
        params?: { per_page?: number; page?: number }
    ): Promise<Product[]> => {
        try {
            const response = await wooCommerceAxios.get('/products', {
                params: {
                    category: categoryId,
                    per_page: params?.per_page || 20,
                    page: params?.page || 1,
                    status: 'publish',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching products by category:', error);
            throw error;
        }
    },

    // Get all products
    getProducts: async (params?: { per_page?: number; page?: number; search?: string }): Promise<Product[]> => {
        try {
            const response = await wooCommerceAxios.get('/products', {
                params: {
                    per_page: params?.per_page || 20,
                    page: params?.page || 1,
                    status: 'publish',
                    search: params?.search || '',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    // Get single product
    getProduct: async (productId: number): Promise<Product> => {
        try {
            const response = await wooCommerceAxios.get(`/products/${productId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    },

    // Create order
    createOrder: async (orderData: CreateOrderData): Promise<Order> => {
        try {
            const response = await wooCommerceAxios.post('/orders', orderData);
            return response.data;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    // Get order
    getOrder: async (orderId: number): Promise<Order> => {
        try {
            const response = await wooCommerceAxios.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching order:', error);
            throw error;
        }
    },
};
