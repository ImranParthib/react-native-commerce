# 🛍️ React Native E-Commerce App

A full-featured e-commerce mobile application built with React Native, Expo, and WooCommerce integration. This app provides a complete shopping experience with product browsing, cart management, order placement, and order tracking.

## ✨ Features

### 🛒 Core E-Commerce Features
- **Product Categories**: Browse products by categories with images and product counts
- **Product Catalog**: View all products with search functionality and pagination
- **Shopping Cart**: Add/remove products, update quantities with persistent storage
- **Checkout Process**: Complete order placement with customer details
- **Order Management**: View and track placed orders
- **Real-time Updates**: Cart badge shows item count across the app

### 🎨 UI/UX Features
- Modern, clean design with Material Design elements
- Responsive grid layouts for products and categories
- Pull-to-refresh functionality
- Infinite scroll with loading indicators
- Search functionality with clear filters
- Loading states and error handling
- Interactive animations and haptic feedback

### 🔧 Technical Features
- **TypeScript**: Full type safety throughout the application
- **State Management**: React Context for cart state with AsyncStorage persistence
- **Navigation**: Expo Router with tab-based navigation
- **API Integration**: WooCommerce REST API with axios
- **Offline Support**: Cart data persists locally using AsyncStorage

## 🏗️ Architecture

### **Tech Stack**
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: React Context + AsyncStorage
- **API Client**: Axios
- **Backend**: WooCommerce REST API
- **UI Components**: Custom components with React Native Paper

### **Project Structure**
```
app/
├── (tabs)/
│   ├── index.tsx          # Categories screen
│   ├── explore.tsx        # Products screen
│   ├── cart.tsx           # Shopping cart
│   ├── orders.tsx         # Order history
│   └── _layout.tsx        # Tab navigation
├── checkout.tsx           # Checkout process
└── _layout.tsx           # Root layout

components/
├── commerce/
│   ├── CategoryCard.tsx   # Category display component
│   ├── ProductCard.tsx    # Product display component
│   └── Cart.tsx          # Cart management component
└── ui/                   # UI components

contexts/
└── CartContext.tsx       # Cart state management

services/
└── woocommerce.ts        # WooCommerce API integration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app (for testing on physical device)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd react-native-commerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run the app**
   - Scan QR code with Expo Go (iOS/Android)
   - Press `w` for web version
   - Press `a` for Android emulator
   - Press `i` for iOS simulator

## 🔗 WooCommerce Integration

### **API Configuration**
- **Store URL**: `https://ec.extramilebd.com`
- **API Version**: WC/v3
- **Authentication**: Consumer Key/Secret

### **API Endpoints Used**
- `GET /products/categories` - Fetch product categories
- `GET /products` - Fetch products (with search/category filters)
- `POST /orders` - Create new orders
- `GET /orders` - Fetch order history

### **Supported Features**
- Product catalog with images, prices, and descriptions
- Category-based product filtering
- Product search functionality
- Order creation with customer details
- Cash on Delivery payment method

## 📱 App Navigation

### **Tab Structure**
1. **Categories** - Browse product categories
2. **Products** - View and search all products
3. **Cart** - Manage shopping cart (shows item count badge)
4. **Orders** - View order history and status

### **Screen Flow**
```
Categories → Products (by category) → Add to Cart → Checkout → Order Confirmation
     ↓              ↓                      ↓           ↓
  All Products → Search Products → Cart → Orders
```

## 🛠️ Development

### **Key Commands**
```bash
npm start          # Start development server
npm run android    # Run on Android
npm run ios        # Run on iOS  
npm run web        # Run on web
npm run lint       # Run ESLint
```

### **Environment Setup**
The app uses hardcoded WooCommerce credentials. For production, move these to environment variables:

```typescript
// services/woocommerce.ts
const API_URL = process.env.EXPO_PUBLIC_WOOCOMMERCE_URL;
const CONSUMER_KEY = process.env.EXPO_PUBLIC_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.EXPO_PUBLIC_CONSUMER_SECRET;
```

## 🧪 Testing

### **Manual Testing Checklist**
- [ ] Browse categories and view products
- [ ] Search for products
- [ ] Add products to cart
- [ ] Update cart quantities
- [ ] Complete checkout process
- [ ] View order history
- [ ] Test offline cart persistence
- [ ] Test pull-to-refresh functionality

### **Test Data**
The app connects to a live WooCommerce store with real product data. Orders placed during testing will create actual orders in the system.

## 📦 Dependencies

### **Core Dependencies**
- `expo` - Expo framework
- `expo-router` - File-based routing
- `@react-navigation/native` - Navigation library
- `axios` - HTTP client for API calls
- `@react-native-async-storage/async-storage` - Local storage

### **UI Dependencies**
- `react-native-paper` - Material Design components
- `@expo/vector-icons` - Icon library
- `expo-symbols` - System symbols
- `react-native-reanimated` - Animations

## 🚀 Deployment

### **Development Build**
```bash
expo build:android
expo build:ios
```

### **Production Considerations**
- Add environment variables for API credentials
- Implement error tracking (e.g., Sentry)
- Add analytics (e.g., Firebase Analytics)
- Optimize images and bundle size
- Add proper error boundaries
- Implement offline functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Expo](https://expo.dev) for the amazing React Native framework
- [WooCommerce](https://woocommerce.com) for the robust e-commerce API
- [React Navigation](https://reactnavigation.org) for smooth navigation
- [React Native Paper](https://reactnativepaper.com) for Material Design components

## 📞 Support

For support, email your-email@example.com or create an issue in this repository.

---

**Built with ❤️ using React Native and Expo**
