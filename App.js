// App.js
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { fetchTrendingTweets } from './services/twitterService';

const App = () => {
  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission denied');
          return;
        }
      }

      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setRegion({
            ...region,
            latitude,
            longitude,
          });
          fetchTweets(latitude, longitude);
        },
        (error) => {
          console.log(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    };

    requestLocationPermission();
  }, [region]);

  const fetchTweets = async (latitude, longitude) => {
    try {
      const tweets = await fetchTrendingTweets(latitude, longitude, 10);
      const newMarkers = tweets.map((tweet) => ({
        id: tweet.id,
        latitude: tweet.geo.coordinates[0],
        longitude: tweet.geo.coordinates[1],
        title: tweet.text,
      }));
      setMarkers(newMarkers);
    } catch (error) {
      console.error(error);
    }
  };

  const onMarkerPress = (marker) => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${marker.latitude},${marker.longitude}`;
    const appleMapsUrl = `http://maps.apple.com/?daddr=${marker.latitude},${marker.longitude}`;

    Alert.alert(
      'Trending Place',
      marker.title,
      [
        {
          text: 'Navigate',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL(appleMapsUrl);
            } else {
              Linking.openURL(googleMapsUrl);
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            onPress={() => onMarkerPress(marker)}
          />
        ))}
      </MapView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default App;
