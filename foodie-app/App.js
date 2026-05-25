import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, SafeAreaView, FlatList, Alert,
  Animated, Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');
const ORANGE = '#F57C20';
const ORANGE_LIGHT = '#FFF3E8';
const GRAY = '#9E9E9E';
const GRAY_LIGHT = '#F0F0F0';
const GREEN = '#4CAF50';
const RED = '#F44336';

const CATEGORIES = [
  { id: '1', name: 'All',       icon: '🍽️' },
  { id: '2', name: 'Pizza',     icon: '🍕' },
  { id: '3', name: 'Burger',    icon: '🍔' },
  { id: '4', name: 'Chicken',   icon: '🍗' },
  { id: '5', name: 'Sushi',     icon: '🍱' },
  { id: '6', name: 'Dessert',   icon: '🍰' },
  { id: '7', name: 'Salad',     icon: '🥗' },
  { id: '8', name: 'Drinks',    icon: '🥤' },
  { id: '9', name: 'Tacos',     icon: '🌮' },
  { id: '10', name: 'Noodles',  icon: '🍜' },
  { id: '11', name: 'Steak',    icon: '🥩' },
  { id: '12', name: 'Momo',     icon: '🥟' },
];

const FOODS = [
  { id: '1', name: 'Chicken Burger',   price: 12.00, icon: '🍔', cat: 'Burger',  rest: 'Burger Palace', time: '20 Min', rating: 4.5 },
  { id: '2', name: 'Margherita Pizza', price: 14.00, icon: '🍕', cat: 'Pizza',   rest: 'Pizza Hub',     time: '25 Min', rating: 4.8 },
  { id: '3', name: 'Chicken Tikka',    price: 11.00, icon: '🍗', cat: 'Chicken', rest: 'Spice Garden',  time: '20 Min', rating: 4.3 },
  { id: '4', name: 'Sushi Box',        price: 18.00, icon: '🍱', cat: 'Sushi',   rest: 'Tokyo Bites',   time: '30 Min', rating: 4.7 },
  { id: '5', name: 'Caesar Salad',     price: 9.00,  icon: '🥗', cat: 'Salad',   rest: 'Green Bowl',    time: '15 Min', rating: 4.2 },
  { id: '6', name: 'Dates Dessert',    price: 7.00,  icon: '🍮', cat: 'Dessert', rest: 'Sweet Corner',  time: '10 Min', rating: 4.6 },
  { id: '7', name: 'Beef Taco',        price: 10.00, icon: '🌮', cat: 'Tacos',   rest: 'Taco Town',     time: '20 Min', rating: 4.4 },
  { id: '8', name: 'Beef Steak',       price: 22.00, icon: '🥩', cat: 'Steak',   rest: 'Grill House',   time: '35 Min', rating: 4.9 },
  { id: '9', name: 'Mango Smoothie',   price: 6.00,  icon: '🥤', cat: 'Drinks',  rest: 'Juice Bar',     time: '10 Min', rating: 4.1 },
  { id: '10', name: 'Ramen Noodles',   price: 13.00, icon: '🍜', cat: 'Noodles', rest: 'Tokyo Bites',   time: '25 Min', rating: 4.5 },
];

// ─── SCREENS ───────────────────────────────────────────────

function SplashScreen({ nav }) {
  return (
    <View style={s.splashBg}>
      <StatusBar barStyle="dark-content" />
      <View style={s.splashContent}>
        <Text style={s.splashLogo}>GLOREX</Text>
        <Text style={s.splashTagline}>Delicious food, delivered fast 🚀</Text>
        <View style={s.offerCard}>
          <Text style={s.offerLabel}>🔥 Special Offer</Text>
          <Text style={s.offerTitle}>Free Delivery{'\n'}Above $10.00</Text>
          <Text style={s.offerDesc}>Special promotion only valid today</Text>
          <View style={s.couponRow}>
            <View style={s.couponTag}><Text style={s.couponText}>FOOD30</Text></View>
            <View style={s.couponTag}><Text style={s.couponText}>SAVE10</Text></View>
          </View>
          <TouchableOpacity style={s.btnOrange} onPress={() => nav('login')}>
            <Text style={s.btnOrangeText}>Order Now →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function LoginScreen({ nav }) {
  const [phone, setPhone] = useState('');
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F2' }}>
      <StatusBar barStyle="dark-content" />
      <View style={s.loginTop}>
        <Text style={s.splashLogo}>GLOREX</Text>
        <Text style={{ color: GRAY, marginTop: 6, fontSize: 13 }}>Food Delivery App</Text>
      </View>
      <View style={s.loginCard}>
        <Text style={s.loginTitle}>Login to your account</Text>
        <Text style={s.loginSub}>Login or sign up</Text>
        <View style={s.inputGroup}>
          <Text style={s.flagBtn}>🇮🇳</Text>
          <TextInput
            style={s.phoneInput}
            placeholder="9847883464"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
        <TouchableOpacity style={[s.btnOrange, { marginTop: 14 }]} onPress={() => nav('home')}>
          <Text style={s.btnOrangeText}>Continue</Text>
        </TouchableOpacity>
        <View style={s.orRow}>
          <View style={s.orLine} />
          <Text style={s.orText}>OR</Text>
          <View style={s.orLine} />
        </View>
        <TouchableOpacity style={s.googleBtn} onPress={() => nav('home')}>
          <Text style={{ fontSize: 22 }}>G</Text>
          <Text style={s.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>
        <Text style={s.termsText}>
          By continuing, you agree to our{' '}
          <Text style={{ color: ORANGE }}>Terms of Services</Text> &{' '}
          <Text style={{ color: ORANGE }}>Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

function HomeScreen({ nav, cart, setCart }) {
  const [activeCat, setActiveCat] = useState('All');
  const filtered = activeCat === 'All' ? FOODS : FOODS.filter(f => f.cat === activeCat);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = (food) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === food.id);
      if (ex) return prev.map(i => i.id === food.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...food, qty: 1 }];
    });
    Alert.alert('', `✓ ${food.name} added to cart!`, [{ text: 'OK' }], { cancelable: true });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={s.homeHeader}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.deliveryLabel}>📍 Delivery to</Text>
            <Text style={s.deliveryLocation}>Home, Block 3 ▾</Text>
          </View>
          <TouchableOpacity style={s.avatar} onPress={() => nav('profile')}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18 }}>G</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={s.searchBar} onPress={() => nav('search')}>
          <Text style={{ color: GRAY }}>🔍  Search "biryani"</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
        {/* Banner */}
        <View style={s.banner}>
          <Text style={s.bannerTag}>🔥 Today's Special</Text>
          <Text style={s.bannerTitle}>Get 30% Off{'\n'}Your First Order!</Text>
          <Text style={s.bannerSub}>Valid for new customers only</Text>
          <TouchableOpacity style={s.bannerBtn} onPress={() => nav('explore')}>
            <Text style={{ color: ORANGE, fontWeight: '800', fontSize: 13 }}>Order Now</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={() => nav('categories')}>
            <Text style={s.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.id} style={s.catItem} onPress={() => setActiveCat(cat.name)}>
              <View style={[s.catIcon, activeCat === cat.name && { borderWidth: 2.5, borderColor: ORANGE }]}>
                <Text style={{ fontSize: 28 }}>{cat.icon}</Text>
              </View>
              <Text style={[s.catName, activeCat === cat.name && { color: ORANGE, fontWeight: '800' }]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Food Cards */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>
            {activeCat === 'All' ? 'Popular Now 🔥' : activeCat}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>
          {filtered.map(food => (
            <TouchableOpacity key={food.id} style={s.foodCard} onPress={() => addToCart(food)}>
              <View style={s.foodCardImg}>
                <Text style={{ fontSize: 48 }}>{food.icon}</Text>
              </View>
              <View style={s.foodCardBody}>
                <Text style={s.foodCardName}>{food.name}</Text>
                <Text style={s.foodCardRest}>{food.rest}</Text>
                <View style={s.foodCardMeta}>
                  <Text style={s.foodCardPrice}>${food.price.toFixed(2)}</Text>
                  <TouchableOpacity style={s.addBtnSm} onPress={() => addToCart(food)}>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recommended */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Recommended ✨</Text>
          <TouchableOpacity onPress={() => nav('explore')}>
            <Text style={s.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {FOODS.slice(4, 8).map(food => (
          <TouchableOpacity key={food.id} style={s.listItem} onPress={() => addToCart(food)}>
            <View style={s.listItemImg}>
              <Text style={{ fontSize: 34 }}>{food.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.foodCardName}>{food.name}</Text>
              <Text style={s.foodCardRest}>{food.rest}</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                <Text style={{ fontSize: 11, color: GRAY }}>⏱ {food.time}</Text>
                <Text style={{ fontSize: 11, color: '#FFC107' }}>★ {food.rating}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 8 }}>
              <Text style={s.foodCardPrice}>${food.price.toFixed(2)}</Text>
              <TouchableOpacity style={s.addBtn} onPress={() => addToCart(food)}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>ADD</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNav nav={nav} active="home" cartCount={cartCount} />
    </SafeAreaView>
  );
}

function SearchScreen({ nav, cart, setCart }) {
  const [query, setQuery] = useState('');
  const filtered = query
    ? FOODS.filter(f => f.name.toLowerCase().includes(query.toLowerCase()) || f.cat.toLowerCase().includes(query.toLowerCase()))
    : FOODS;
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = (food) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === food.id);
      if (ex) return prev.map(i => i.id === food.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...food, qty: 1 }];
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={s.screenHeader}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav('home')}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={s.screenTitle}>Search</Text>
      </View>
      <View style={s.searchInputWrap}>
        <Text>🔍</Text>
        <TextInput
          style={{ flex: 1, fontSize: 15, marginLeft: 8 }}
          placeholder='Search "biryani"'
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12, gap: 8 }}>
        {['biryani', 'pizza', 'burger', 'chicken', 'healthy'].map(q => (
          <TouchableOpacity key={q} style={s.chip} onPress={() => setQuery(q)}>
            <Text style={{ color: ORANGE, fontWeight: '700', fontSize: 12 }}>{q}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={s.searchSectionTitle}>{query ? `Results for "${query}"` : 'Popular Dishes'}</Text>
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.listItem} onPress={() => addToCart(item)}>
            <View style={s.listItemImg}>
              <Text style={{ fontSize: 34 }}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.foodCardName}>{item.name}</Text>
              <Text style={s.foodCardRest}>{item.rest}</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                <Text style={{ fontSize: 11, color: GRAY }}>⏱ {item.time}</Text>
                <Text style={{ fontSize: 11, color: '#FFC107' }}>★ {item.rating}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 8 }}>
              <Text style={s.foodCardPrice}>${item.price.toFixed(2)}</Text>
              <TouchableOpacity style={s.addBtn} onPress={() => addToCart(item)}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>ADD</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
      <BottomNav nav={nav} active="search" cartCount={cartCount} />
    </SafeAreaView>
  );
}

function ExploreScreen({ nav, cart, setCart }) {
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const [favs, setFavs] = useState([]);

  const addToCart = (food) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === food.id);
      if (ex) return prev.map(i => i.id === food.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...food, qty: 1 }];
    });
  };

  const toggleFav = (id) => setFavs(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={s.screenHeader}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav('home')}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={s.screenTitle}>Explore Dishes</Text>
      </View>
      <FlatList
        data={FOODS}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={s.listItem}>
            <View style={s.listItemImg}>
              <Text style={{ fontSize: 34 }}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.foodCardName}>{item.name}</Text>
              <Text style={{ fontSize: 11, color: GRAY, lineHeight: 16, marginTop: 2 }}>{item.rest} · {item.cat}</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                <Text style={{ fontSize: 11, color: GRAY }}>⏱ {item.time}</Text>
                <Text style={{ fontSize: 11, color: '#FFC107' }}>★ {item.rating}</Text>
                <Text style={s.foodCardPrice}>${item.price.toFixed(2)}</Text>
              </View>
            </View>
            <View style={{ gap: 8, alignItems: 'center' }}>
              <TouchableOpacity onPress={() => toggleFav(item.id)}>
                <Text style={{ fontSize: 22, color: favs.includes(item.id) ? ORANGE : '#ddd' }}>♥</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.addBtn} onPress={() => addToCart(item)}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>ADD</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <BottomNav nav={nav} active="explore" cartCount={cartCount} />
    </SafeAreaView>
  );
}

function CartScreen({ nav, cart, setCart }) {
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal + 2.5 - (subtotal > 0 ? 5 : 0);

  const changeQty = (id, delta) => {
    setCart(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0);
      return updated;
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={s.screenHeader}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav('home')}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={s.screenTitle}>My Cart 🛒</Text>
        <Text style={{ marginLeft: 'auto', color: GRAY, fontSize: 13 }}>{cartCount} items</Text>
      </View>

      {cart.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 64 }}>🛒</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', marginTop: 16, color: '#1A1A1A' }}>Your cart is empty</Text>
          <Text style={{ color: GRAY, marginTop: 6 }}>Add some delicious food!</Text>
          <TouchableOpacity style={[s.btnOrange, { marginTop: 24, width: 200 }]} onPress={() => nav('home')}>
            <Text style={s.btnOrangeText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 200 }}>
          {cart.map(item => (
            <View key={item.id} style={s.cartItem}>
              <View style={s.cartItemImg}>
                <Text style={{ fontSize: 36 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.foodCardName}>{item.name}</Text>
                <Text style={[s.foodCardPrice, { marginTop: 4 }]}>${item.price.toFixed(2)}</Text>
                <View style={s.qtyControl}>
                  <TouchableOpacity style={s.qtyBtn} onPress={() => changeQty(item.id, -1)}>
                    <Text style={{ color: ORANGE, fontSize: 18, fontWeight: '700' }}>−</Text>
                  </TouchableOpacity>
                  <Text style={s.qtyNum}>{item.qty}</Text>
                  <TouchableOpacity style={s.qtyBtn} onPress={() => changeQty(item.id, 1)}>
                    <Text style={{ color: ORANGE, fontSize: 18, fontWeight: '700' }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity style={s.deleteBtn} onPress={() => changeQty(item.id, -item.qty)}>
                <Text style={{ fontSize: 18 }}>🗑</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Payment Summary */}
          <View style={s.paymentCard}>
            <Text style={s.paymentTitle}>Payment Summary</Text>
            <View style={s.paymentRow}>
              <Text style={s.paymentLabel}>Total Items ({cartCount})</Text>
              <Text style={s.paymentValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={s.paymentRow}>
              <Text style={s.paymentLabel}>Processing Fee</Text>
              <Text style={s.paymentValue}>$2.50</Text>
            </View>
            <View style={s.paymentRow}>
              <Text style={s.paymentLabel}>Discount</Text>
              <Text style={[s.paymentValue, { color: GREEN }]}>-$5.00</Text>
            </View>
            <View style={s.paymentDivider} />
            <View style={s.paymentRow}>
              <Text style={[s.paymentLabel, { fontSize: 16, fontWeight: '800', color: '#1A1A1A' }]}>Total</Text>
              <Text style={[s.paymentValue, { fontSize: 20, fontWeight: '900', color: ORANGE }]}>${Math.max(total, 0).toFixed(2)}</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {cart.length > 0 && (
        <View style={s.checkoutWrap}>
          <TouchableOpacity style={s.btnOrange} onPress={() => {
            Alert.alert('🎉 Success!', 'Your order has been placed successfully!', [
              { text: 'OK', onPress: () => { setCart([]); nav('home'); } }
            ]);
          }}>
            <Text style={s.btnOrangeText}>Proceed to Checkout →</Text>
          </TouchableOpacity>
        </View>
      )}
      <BottomNav nav={nav} active="cart" cartCount={cartCount} />
    </SafeAreaView>
  );
}

function NotifScreen({ nav, cart }) {
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const notifs = [
    { id: '1', icon: '🎉', bg: ORANGE_LIGHT, title: '30% Special Discount!', desc: 'Special promotion only valid today', time: 'Now', group: 'Today' },
    { id: '2', icon: '✅', bg: '#E8F5E9', title: 'Order Successfully Placed', desc: 'Order #FD-2847 confirmed', time: '2h ago', group: 'Today' },
    { id: '3', icon: '❌', bg: '#FFEBEE', title: 'Your Order Has Been Canceled', desc: '19 March 2025', time: '5h ago', group: 'Today' },
    { id: '4', icon: '🎉', bg: ORANGE_LIGHT, title: '35% Special Discount!', desc: 'Special promotion only valid today', time: '1d ago', group: 'Yesterday' },
    { id: '5', icon: '✅', bg: '#E8F5E9', title: 'Account Setup Successful!', desc: 'Welcome to GLOREX!', time: '1d ago', group: 'Yesterday' },
    { id: '6', icon: '💳', bg: '#E3F2FD', title: 'Credit Card Connected', desc: 'Visa ending in 4411', time: '3d ago', group: 'Earlier' },
  ];

  let lastGroup = '';
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={s.screenHeader}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav('home')}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={s.screenTitle}>Notifications 🔔</Text>
      </View>
      <FlatList
        data={notifs}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 20, gap: 8, paddingBottom: 90 }}
        renderItem={({ item }) => {
          const showGroup = item.group !== lastGroup;
          lastGroup = item.group;
          return (
            <View>
              {showGroup && <Text style={{ fontSize: 12, fontWeight: '700', color: GRAY, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8, marginBottom: 4 }}>{item.group}</Text>}
              <View style={s.notifItem}>
                <View style={[s.notifIcon, { backgroundColor: item.bg }]}>
                  <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.notifTitle}>{item.title}</Text>
                  <Text style={s.notifDesc}>{item.desc}</Text>
                </View>
                <Text style={{ fontSize: 11, color: GRAY }}>{item.time}</Text>
              </View>
            </View>
          );
        }}
      />
      <BottomNav nav={nav} active="notif" cartCount={cartCount} />
    </SafeAreaView>
  );
}

function ProfileScreen({ nav, cart }) {
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const menu = [
    { icon: '📦', label: 'My Orders', badge: '3' },
    { icon: '❤️', label: 'Favorites' },
    { icon: '📍', label: 'Delivery Address' },
    { icon: '💳', label: 'Payment Methods' },
    { icon: '🎁', label: 'Promotions & Coupons', badge: '2' },
    { icon: '🔔', label: 'Notifications' },
    { icon: '⚙️', label: 'Settings' },
  ];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={s.profileHeader}>
          <TouchableOpacity style={[s.backBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]} onPress={() => nav('home')}>
            <Text style={{ fontSize: 20, color: '#fff' }}>←</Text>
          </TouchableOpacity>
          <View style={s.profileAvatarWrap}>
            <Text style={{ fontSize: 36 }}>👤</Text>
          </View>
          <Text style={s.profileName}>Ghaith Al-Habbal</Text>
          <Text style={s.profilePhone}>+1 984 788 3464</Text>
        </View>
        <View style={s.statsRow}>
          {[['24', 'Orders'], ['12', 'Favorites'], ['4.8', 'Rating']].map(([num, label]) => (
            <View key={label} style={s.statItem}>
              <Text style={s.statNum}>{num}</Text>
              <Text style={s.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
        <View style={[s.menuList, { margin: 20 }]}>
          {menu.map((item, i) => (
            <TouchableOpacity key={i} style={[s.menuItem, i < menu.length - 1 && { borderBottomWidth: 1, borderBottomColor: GRAY_LIGHT }]}>
              <Text style={s.menuIcon}>{item.icon}</Text>
              <Text style={s.menuText}>{item.label}</Text>
              {item.badge && <View style={s.menuBadge}><Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{item.badge}</Text></View>}
              <Text style={{ color: GRAY, fontSize: 16 }}>›</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={s.menuItem} onPress={() => nav('login')}>
            <Text style={s.menuIcon}>🚪</Text>
            <Text style={[s.menuText, { color: RED }]}>Logout</Text>
            <Text style={{ color: GRAY, fontSize: 16, marginLeft: 'auto' }}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNav nav={nav} active="profile" cartCount={cartCount} />
    </SafeAreaView>
  );
}

// ─── BOTTOM NAV ────────────────────────────────────────────

function BottomNav({ nav, active, cartCount }) {
  const tabs = [
    { key: 'home',    icon: '🏠', label: 'Home' },
    { key: 'search',  icon: '🔍', label: 'Search' },
    { key: 'cart',    icon: '🛒', label: 'Cart' },
    { key: 'notif',   icon: '🔔', label: 'Alerts' },
    { key: 'profile', icon: '👤', label: 'Profile' },
  ];
  return (
    <View style={s.bottomNav}>
      {tabs.map(tab => (
        <TouchableOpacity key={tab.key} style={s.navItem} onPress={() => nav(tab.key)}>
          <View>
            <Text style={[s.navIcon, active === tab.key && { color: ORANGE }]}>{tab.icon}</Text>
            {tab.key === 'cart' && cartCount > 0 && (
              <View style={s.badge}><Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>{cartCount}</Text></View>
            )}
          </View>
          <Text style={[s.navLabel, active === tab.key && { color: ORANGE }]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── APP ───────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState('splash');
  const [cart, setCart] = useState([]);

  const nav = (s) => setScreen(s);
  const props = { nav, cart, setCart };

  return (
    <View style={{ flex: 1 }}>
      {screen === 'splash'      && <SplashScreen {...props} />}
      {screen === 'login'       && <LoginScreen  {...props} />}
      {screen === 'home'        && <HomeScreen   {...props} />}
      {screen === 'search'      && <SearchScreen {...props} />}
      {screen === 'explore'     && <ExploreScreen {...props} />}
      {screen === 'cart'        && <CartScreen   {...props} />}
      {screen === 'notif'       && <NotifScreen  {...props} />}
      {screen === 'profile'     && <ProfileScreen {...props} />}
      {screen === 'categories'  && <ExploreScreen {...props} />}
    </View>
  );
}

// ─── STYLES ────────────────────────────────────────────────

const s = StyleSheet.create({
  splashBg: { flex: 1, backgroundColor: '#FFF8F2', alignItems: 'center', justifyContent: 'center' },
  splashContent: { alignItems: 'center' },
  splashLogo: { fontSize: 56, fontWeight: '900', color: ORANGE, fontStyle: 'italic', letterSpacing: -2 },
  splashTagline: { color: GRAY, fontSize: 14, marginTop: 8 },
  offerCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginTop: 40, width: width * 0.8, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  offerLabel: { fontSize: 11, color: ORANGE, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  offerTitle: { fontSize: 22, fontWeight: '900', color: '#1A1A1A', marginTop: 6, lineHeight: 28 },
  offerDesc: { fontSize: 12, color: GRAY, marginTop: 4 },
  couponRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  couponTag: { backgroundColor: ORANGE_LIGHT, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12, borderWidth: 1, borderColor: ORANGE, borderStyle: 'dashed' },
  couponText: { color: ORANGE, fontSize: 11, fontWeight: '700' },
  btnOrange: { backgroundColor: ORANGE, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 16, shadowColor: ORANGE, shadowOpacity: 0.35, shadowRadius: 10, elevation: 4 },
  btnOrangeText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  loginTop: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF8F2' },
  loginCard: { backgroundColor: '#fff', borderRadius: 28, padding: 28, paddingBottom: 40, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 8 },
  loginTitle: { fontSize: 24, fontWeight: '800', color: '#1A1A1A' },
  loginSub: { fontSize: 13, color: GRAY, marginTop: 4 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: GRAY_LIGHT, borderRadius: 14, marginTop: 16, backgroundColor: '#FAFAFA' },
  flagBtn: { fontSize: 22, padding: 14 },
  phoneInput: { flex: 1, fontSize: 16, paddingVertical: 14, paddingRight: 14 },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 },
  orLine: { flex: 1, height: 1, backgroundColor: GRAY_LIGHT },
  orText: { fontSize: 12, color: GRAY },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 2, borderColor: GRAY_LIGHT, borderRadius: 14, padding: 14 },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  termsText: { fontSize: 11, color: GRAY, textAlign: 'center', marginTop: 14, lineHeight: 18 },
  homeHeader: { backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deliveryLabel: { fontSize: 11, color: GRAY, fontWeight: '600' },
  deliveryLocation: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginTop: 2 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: GRAY_LIGHT, borderRadius: 14, padding: 12, marginTop: 12 },
  banner: { margin: 20, backgroundColor: ORANGE, borderRadius: 20, padding: 20 },
  bannerTag: { color: '#fff', fontSize: 11, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10, alignSelf: 'flex-start', fontWeight: '700' },
  bannerTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 8, lineHeight: 28 },
  bannerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4 },
  bannerBtn: { backgroundColor: '#fff', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 18, alignSelf: 'flex-start', marginTop: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  seeAll: { fontSize: 13, color: ORANGE, fontWeight: '600' },
  catItem: { alignItems: 'center', gap: 6 },
  catIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: ORANGE_LIGHT, alignItems: 'center', justifyContent: 'center' },
  catName: { fontSize: 11, fontWeight: '600', color: '#1A1A1A' },
  foodCard: { width: 170, backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  foodCardImg: { height: 110, backgroundColor: ORANGE_LIGHT, alignItems: 'center', justifyContent: 'center' },
  foodCardBody: { padding: 12 },
  foodCardName: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  foodCardRest: { fontSize: 11, color: GRAY, marginTop: 2 },
  foodCardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  foodCardPrice: { fontSize: 15, fontWeight: '800', color: ORANGE },
  addBtnSm: { backgroundColor: ORANGE, borderRadius: 8, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  addBtn: { backgroundColor: ORANGE, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 14 },
  listItem: { flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginHorizontal: 20, marginBottom: 4 },
  listItemImg: { width: 70, height: 70, borderRadius: 12, backgroundColor: ORANGE_LIGHT, alignItems: 'center', justifyContent: 'center' },
  screenHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#fff' },
  backBtn: { backgroundColor: GRAY_LIGHT, borderRadius: 12, width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  screenTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  searchInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: GRAY_LIGHT, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginHorizontal: 20, marginBottom: 8 },
  chip: { backgroundColor: ORANGE_LIGHT, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14 },
  searchSectionTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', paddingHorizontal: 20, paddingVertical: 8 },
  cartItem: { flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cartItemImg: { width: 80, height: 80, borderRadius: 14, backgroundColor: ORANGE_LIGHT, alignItems: 'center', justifyContent: 'center' },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 },
  qtyBtn: { backgroundColor: ORANGE_LIGHT, borderRadius: 8, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  qtyNum: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  deleteBtn: { backgroundColor: '#FFF0EE', borderRadius: 10, width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  paymentCard: { backgroundColor: '#fff', borderRadius: 18, padding: 18, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  paymentTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 12 },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  paymentLabel: { fontSize: 13, color: GRAY },
  paymentValue: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  paymentDivider: { height: 1, backgroundColor: GRAY_LIGHT, marginVertical: 8 },
  checkoutWrap: { position: 'absolute', bottom: 70, left: 0, right: 0, backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 8 },
  notifItem: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  notifIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  notifTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  notifDesc: { fontSize: 12, color: GRAY, marginTop: 2 },
  profileHeader: { backgroundColor: ORANGE, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, alignItems: 'center' },
  profileAvatarWrap: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginTop: 16, borderWidth: 3, borderColor: '#fff' },
  profileName: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 10 },
  profilePhone: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, margin: 20, marginTop: -20, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 14, elevation: 5 },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statNum: { fontSize: 22, fontWeight: '900', color: ORANGE },
  statLabel: { fontSize: 11, color: GRAY, marginTop: 2 },
  menuList: { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, paddingHorizontal: 18 },
  menuIcon: { fontSize: 20, width: 32, textAlign: 'center' },
  menuText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  menuBadge: { backgroundColor: ORANGE, borderRadius: 10, paddingVertical: 2, paddingHorizontal: 8 },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: GRAY_LIGHT, flexDirection: 'row', justifyContent: 'space-around', paddingTop: 10, paddingBottom: 20 },
  navItem: { alignItems: 'center', gap: 3 },
  navIcon: { fontSize: 24, color: GRAY },
  navLabel: { fontSize: 10, fontWeight: '600', color: GRAY },
  badge: { position: 'absolute', top: -4, right: -6, backgroundColor: ORANGE, borderRadius: 9, width: 17, height: 17, alignItems: 'center', justifyContent: 'center' },
});
