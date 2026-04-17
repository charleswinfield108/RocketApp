import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { OswaldFonts } from '@/constants/theme';
import {
  getCoordinatesForRestaurant,
  MONTREAL_REGION,
} from '@/constants/restaurantCoordinates';
import { getStars, getPriceDisplay } from '@/utils/formatters';

interface Restaurant {
  id: number;
  name: string;
  rating: number;
  price_range: number;
}

interface RestaurantMapProps {
  restaurants: Restaurant[];
}

export default function RestaurantMap({ restaurants }: RestaurantMapProps) {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={MONTREAL_REGION}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {restaurants.map((restaurant) => {
          const coords = getCoordinatesForRestaurant(restaurant.id);
          return (
            <Marker
              key={restaurant.id}
              coordinate={coords}
              pinColor="#DA583B"
              title={restaurant.name}
            >
              <Callout
                tooltip={false}
                onPress={() => {
                  // iOS: callout tap navigates; Android handled via button below
                  if (Platform.OS === 'ios') {
                    router.push(`/(tabs)/(restaurant)/${restaurant.id}`);
                  }
                }}
              >
                <View style={styles.callout}>
                  <Text style={styles.calloutName} numberOfLines={2}>
                    {restaurant.name}
                  </Text>
                  <Text style={styles.calloutDetail}>
                    {getStars(restaurant.rating)}{'  '}{getPriceDisplay(restaurant.price_range)}
                  </Text>
                  {Platform.OS === 'android' && (
                    <TouchableOpacity
                      style={styles.calloutBtn}
                      onPress={() =>
                        router.push(`/(tabs)/(restaurant)/${restaurant.id}`)
                      }
                    >
                      <Text style={styles.calloutBtnText}>View Menu</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  callout: {
    width: 180,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  calloutName: {
    fontSize: 13,
    fontFamily: OswaldFonts.bold,
    color: '#222126',
    marginBottom: 4,
  },
  calloutDetail: {
    fontSize: 12,
    color: '#666666',
    marginBottom: Platform.OS === 'android' ? 8 : 0,
  },
  calloutBtn: {
    backgroundColor: '#DA583B',
    borderRadius: 4,
    paddingVertical: 5,
    alignItems: 'center',
  },
  calloutBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: OswaldFonts.bold,
  },
});
