# 🛍️ React Native E-Commerce App

A modern, full-featured e-commerce mobile app built with React Native, Expo, and WooCommerce. Enjoy seamless product browsing, cart management, order placement, and tracking—all in one intuitive experience.

## ✨ Features

### 🛒 Core E-Commerce
- **Product Categories**: Browse by category with images and product counts
- **Product Catalog**: Search, filter, and paginate all products
- **Shopping Cart**: Add/remove items, update quantities, persistent storage
- **Checkout**: Place orders with customer details
- **Order Management**: View and track your orders
- **Real-time Cart Badge**: Item count updates across the app

### 🎨 UI/UX
- Clean, modern Material Design
- **Advanced Responsive Design**: Optimized for all device sizes (phones to tablets)
- **Smart Grid Layouts**: Dynamic columns based on screen size and orientation
- **Adaptive Typography**: Breakpoint-aware font scaling with accessibility support
- **Responsive Components**: All UI elements adapt seamlessly across devices
- Pull-to-refresh & infinite scroll
- Search with clear filters
- Loading and error states
- Smooth animations & haptic feedback

### 🔧 Technical
- **TypeScript**: End-to-end type safety
- **Responsive Architecture**: Advanced breakpoint system with 5 device categories
- **State Management**: React Context + AsyncStorage
- **Navigation**: Expo Router (tab-based)
- **API**: WooCommerce REST API via axios
- **Offline Support**: Cart persists locally

### 📱 Responsive Features
- **5-Tier Breakpoint System**: xs, sm, md, lg, xl for precise device targeting
- **Dynamic Grid Columns**: 1-5 columns based on screen size and content
- **Smart Component Sizing**: Cards and layouts adapt to available space
- **Orientation Awareness**: Seamless portrait/landscape transitions
- **Accessibility Compliance**: Proper touch targets and font scaling
- **Cross-Platform Consistency**: Unified experience across iOS, Android, and Web

## 🏗️ Architecture

### Tech Stack
- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State**: React Context, AsyncStorage
- **API**: Axios, WooCommerce REST
- **UI**: Custom components, React Native Paper

### Project Structure
```
app/
├── (tabs)/
│   ├── index.tsx        # Categories
│   ├── explore.tsx      # Products
│   ├── cart.tsx         # Cart
│   ├── orders.tsx       # Orders
│   └── _layout.tsx      # Tab navigation
├── checkout.tsx         # Checkout
└── _layout.tsx          # Root layout

components/
├── commerce/
│   ├── CategoryCard.tsx
│   ├── ProductCard.tsx
│   └── Cart.tsx
└── ui/

contexts/
└── CartContext.tsx

services/
└── woocommerce.ts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app (for device testing)

### Installation

1. **Clone the repo**
   ```bash
   git clone <repository-url>
   cd react-native-commerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your WooCommerce credentials
   nano .env
   ```
   **Required:**
   ```bash
   EXPO_PUBLIC_WOOCOMMERCE_URL=https://your-store.com/wp-json/wc/v3
   EXPO_PUBLIC_CONSUMER_KEY=your_consumer_key
   EXPO_PUBLIC_CONSUMER_SECRET=your_consumer_secret
   ```

4. **Start the dev server**
   ```bash
   npm start
   ```

5. **Run the app**
   - Scan QR with Expo Go (iOS/Android)
   - Press `w` for web, `a` for Android, `i` for iOS

## 🔗 WooCommerce Integration

### API Configuration
- **Store URL**: `https://your-store.com`
- **API Version**: WC/v3
- **Auth**: Consumer Key/Secret

### Endpoints Used
- `GET /products/categories` — Categories
- `GET /products` — Products (with filters)
- `POST /orders` — Create order
- `GET /orders` — Order history

### Supported Features
- Product catalog with images, prices, descriptions
- Category filtering & search
- Order creation (Cash on Delivery supported)

## 📱 App Navigation

### Tab Structure
1. **Categories** — Browse categories
2. **Products** — Search & view all products
3. **Cart** — Manage cart (with badge)
4. **Orders** — Order history & status

### Screen Flow
```
Categories → Products (by category) → Add to Cart → Checkout → Order Confirmation
     ↓              ↓                      ↓           ↓
  All Products → Search Products → Cart → Orders
```

## 🛠️ Development

### Key Commands
```bash
npm start          # Dev server
npm run android    # Android
npm run ios        # iOS  
npm run web        # Web
npm run lint       # Linting
```

### Environment Setup
- Store WooCommerce credentials in `.env` (gitignored)
- Use `.env.example` as a template

**How to get WooCommerce API credentials:**
1. WP Admin → WooCommerce → Settings → Advanced → REST API
2. Add Key (Read/Write)
3. Copy Consumer Key/Secret

## 🧪 Testing

### Manual Checklist
- [ ] Browse categories/products
- [ ] Search products
- [ ] Add/update cart items
- [ ] Complete checkout
- [ ] View order history
- [ ] Test offline cart
- [ ] Pull-to-refresh

### Test Data
Connects to a live WooCommerce store—test orders are real.

## 📦 Dependencies

### Core
- `expo`
- `expo-router`
- `@react-navigation/native`
- `axios`
- `@react-native-async-storage/async-storage`

### UI
- `react-native-paper`
- `@expo/vector-icons`
- `expo-symbols`
- `react-native-reanimated`

## 🚀 Deployment

### Build
```bash
expo build:android
expo build:ios
```

### Production Tips
- Set environment variables securely
- Add error tracking (e.g., Sentry)
- Add analytics (e.g., Firebase)
- Optimize images/bundle
- Use error boundaries
- Ensure offline support

## 🤝 Contributing

1. Fork the repo
2. Create a branch (`git checkout -b feature/YourFeature`)
3. Commit (`git commit -m 'Add YourFeature'`)
4. Push (`git push origin feature/YourFeature`)
5. Open a Pull Request

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [Expo](https://expo.dev)
- [WooCommerce](https://woocommerce.com)
- [React Navigation](https://reactnavigation.org)
- [React Native Paper](https://reactnativepaper.com)

## 📞 Support

For help, email your-email@example.com or open an issue.

---

**Built with ❤️ using React Native & Expo**

## 🔒 Security Best Practices

- API credentials in environment variables (never commit secrets)
- `.env` is gitignored; `.env.example` is public
- Use secure secrets management in production
- Rotate API keys regularly
- Monitor API usage
- Review git history before making repo public
- Enable GitHub secret scanning & branch protection

