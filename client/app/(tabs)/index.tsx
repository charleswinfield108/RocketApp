import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/services/authContext';
import { restaurantsAPI } from '@/services/api';

interface Restaurant {
  id: number;
  name: string;
  rating: number;
  price_range: number;
  imageUrl?: string;
}

export default function RestaurantsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await restaurantsAPI.getAll();
      // API wraps response in { message, data }, so actual array is in response.data.data
      setRestaurants(response.data.data || []);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleRestaurantPress = (restaurantId: number) => {
    router.push(`/(tabs)/(restaurant)/${restaurantId}`);
  };

  const renderRestaurantCard = ({ item }: { item: Restaurant }) => {
    // Get restaurant initials
    const getInitials = () => {
      const words = item.name.split(' ');
      return words
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();
    };

    // Get consistent color based on ID
    const getPlaceholderColor = () => {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
      return colors[item.id % colors.length];
    };

    return (
      <TouchableOpacity
        style={styles.restaurantCard}
        onPress={() => handleRestaurantPress(item.id)}
      >
        <View style={styles.cardImageContainer}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
          ) : (
            <View
              style={[
                styles.cardImage,
                {
                  backgroundColor: getPlaceholderColor(),
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
            >
              <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#FFFFFF' }}>
                {getInitials()}
              </Text>
            </View>
          )}
        </View>
      <View style={styles.cardContent}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.rating}>{'★'.repeat(Math.floor(item.rating))} ({item.rating})</Text>
          <Text style={styles.priceRange}>{'$'.repeat(Math.min(item.price_range, 3)) || '$'}</Text>
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🚀 ROCKET</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>LOG OUT</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Title */}
        <Text style={styles.sectionTitle}>NEARBY RESTAURANTS</Text>

        {/* Filters */}
        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>⭐ Rating</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>💰 Price</Text>
          </TouchableOpacity>
        </View>

        {/* Restaurants Grid */}
        <Text style={styles.restaurantsLabel}>RESTAURANTS</Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading restaurants...</Text>
        ) : restaurants.length === 0 ? (
          <Text style={styles.emptyText}>No restaurants found</Text>
        ) : (
          <FlatList
            data={restaurants}
            renderItem={renderRestaurantCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.gridRow}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d97661',
  },
  logoutButton: {
    backgroundColor: '#d97661',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    letterSpacing: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#d97661',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  restaurantsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    letterSpacing: 1,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  restaurantCard: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  cardImageContainer: {
    width: '100%',
    height: 120,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: 10,
  },
  restaurantName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rating: {
    fontSize: 11,
    color: '#d97661',
    fontWeight: '500',
  },
  priceRange: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  loadingText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 30,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 30,
  },
});
