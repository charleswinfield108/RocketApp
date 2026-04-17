import React, { useState, useEffect } from 'react';
import { OswaldFonts } from '@/constants/theme';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faList, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { restaurantsAPI } from '@/services/api';
import { RestaurantCard } from '@/components/RestaurantCard';
import { FilterBar } from '@/components/FilterBar';
import { Header } from '@/components/Header';
import RestaurantMap from '@/components/RestaurantMap';

const RESTAURANT_IMAGES = [
  require('@/assets/images/Restaurants/cuisinePizza.jpg'),
  require('@/assets/images/Restaurants/cuisineJapanese.jpg'),
  require('@/assets/images/Restaurants/cuisinePasta.jpg'),
  require('@/assets/images/Restaurants/cuisineGreek.jpg'),
  require('@/assets/images/Restaurants/cuisineSoutheast.jpg'),
  require('@/assets/images/Restaurants/cuisineViet.jpg'),
];

interface Restaurant {
  id: number;
  name: string;
  rating: number;
  price_range: number;
  imageUrl?: string;
  description?: string;
}

type ViewMode = 'list' | 'map';

export default function RestaurantListScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantsAPI.getAll();
      const data = response.data.data || [];
      setRestaurants(data);
      setFilteredRestaurants(data);
    } catch {
      setError('Failed to load restaurants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = restaurants;
    if (selectedRating !== null) {
      filtered = filtered.filter((r) => r.rating >= selectedRating);
    }
    if (selectedPrice !== null) {
      filtered = filtered.filter((r) => r.price_range === selectedPrice);
    }
    setFilteredRestaurants(filtered);
  }, [selectedRating, selectedPrice, restaurants]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#DA583B" />
        <Text style={styles.loadingText}>Loading restaurants...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRestaurants}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      {/* Filter Bar */}
      <FilterBar
        onRatingChange={setSelectedRating}
        onPriceChange={setSelectedPrice}
        selectedRating={selectedRating}
        selectedPrice={selectedPrice}
      />

      {/* Title row + view toggle */}
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>NEARBY RESTAURANTS</Text>
        <View style={styles.toggleGroup}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
            onPress={() => setViewMode('list')}
            activeOpacity={0.8}
          >
            <FontAwesomeIcon
              icon={faList as any}
              size={14}
              color={viewMode === 'list' ? '#FFFFFF' : '#DA583B'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
            onPress={() => setViewMode('map')}
            activeOpacity={0.8}
          >
            <FontAwesomeIcon
              icon={faMapMarkerAlt as any}
              size={14}
              color={viewMode === 'map' ? '#FFFFFF' : '#DA583B'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Map view */}
      {viewMode === 'map' && (
        <RestaurantMap restaurants={filteredRestaurants} />
      )}

      {/* List view */}
      {viewMode === 'list' && (
        filteredRestaurants.length > 0 ? (
          <FlatList
            data={filteredRestaurants}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <RestaurantCard
                id={item.id}
                name={item.name}
                rating={item.rating}
                priceRange={item.price_range}
                image={RESTAURANT_IMAGES[item.id % RESTAURANT_IMAGES.length]}
              />
            )}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.gridContent}
            scrollEnabled={true}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No restaurants match your filters</Text>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSelectedRating(null);
                setSelectedPrice(null);
              }}
            >
              <Text style={styles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#851919',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#DA583B',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: OswaldFonts.bold,
    color: '#222126',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toggleGroup: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#DA583B',
    borderRadius: 6,
    overflow: 'hidden',
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  toggleBtnActive: {
    backgroundColor: '#DA583B',
  },
  row: {
    justifyContent: 'space-between',
  },
  gridContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  clearButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#DA583B',
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
