import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for marker icons not showing
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const App = () => {
  const [position, setPosition] = useState([37.7749, -122.4194]);

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
        position => {
          const {latitude, longitude} = position.coords;
          setPosition([latitude, longitude]);
        },
        error => {
          console.log(error);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    };

    requestLocationPermission();
  }, []);

  const onMarkerPress = () => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`;
    const appleMapsUrl = `http://maps.apple.com/?daddr=${position[0]},${position[1]}`;

    Alert.alert(
      'Your Location',
      'Navigate to your location',
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
      {cancelable: true},
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapContainer center={position} zoom={15} style={styles.map}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} eventHandlers={{click: onMarkerPress}}>
          <Popup>Your Location</Popup>
        </Marker>
      </MapContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    height: '100vh', // Ensure the map takes up the full height of the viewport
    width: '100vw', // Ensure the map takes up the full width of the viewport
  },
});

export default App;
