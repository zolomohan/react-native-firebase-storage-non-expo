import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

export default function App() {
  const [uploading, setUploading] = useState(false);
  const [uploadingStatus, setUploadingStatus] = useState({
    transferred: 0,
    total: 0,
  });
  const [result, setResult] = useState();

  const onTakePhoto = () => launchCamera({ mediaType: 'image' }, onMediaSelect);

  const onTakeVideo = () => launchCamera({ mediaType: 'video' }, onMediaSelect);

  const onSelectImagePress = () =>
    launchImageLibrary({ mediaType: 'image' }, onMediaSelect);

  const onSelectVideoPress = () =>
    launchImageLibrary({ mediaType: 'video' }, onMediaSelect);

  const onMediaSelect = async (media) => {
    setUploading(true);
    const reference = storage().ref(media.fileName);
    const task = reference.putFile(media.uri);
    task.on('state_changed', (taskSnapshot) => {
      setUploadingStatus({
        transferred: taskSnapshot.bytesTransferred,
        total: taskSnapshot.totalBytes,
      });
    });
    task.then(async () => {
      console.log('Image uploaded to the bucket!');
      const downloadURL = await storage().ref(media.fileName).getDownloadURL();
      console.log(downloadURL);
      setResult(downloadURL);
      setUploading(false);
    });
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Firebase Storage</Text>
      <View>
        <TouchableOpacity style={styles.button} onPress={onTakePhoto}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onTakeVideo}>
          <Text style={styles.buttonText}>Take Video</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onSelectImagePress}>
          <Text style={styles.buttonText}>Upload Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onSelectVideoPress}>
          <Text style={styles.buttonText}>Upload Video</Text>
        </TouchableOpacity>
      </View>
      {uploading && (
        <View style={styles.uploading}>
          <ActivityIndicator size={60} color="#47477b"></ActivityIndicator>
          <Text style={styles.uploadingText}>Uploading</Text>
          <Text style={styles.uploadingText}>
            {uploadingStatus.transferred} / {uploadingStatus.total}
          </Text>
        </View>
      )}
      {result && (
        <TouchableOpacity
          style={[styles.button, style.mediaButton]}
          onPress={() => Linking.openURL(result)}>
          <Text style={styles.buttonText}>View Media</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 50,
  },
  title: {
    fontSize: 35,
    marginVertical: 40,
  },
  button: {
    backgroundColor: '#47477b',
    color: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 50,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
  },
  mediaButton: {
    position: 'absolute',
    bottom: 0,
    marginBottom: 50,
    width: 300,
  },
  uploading: {
    marginTop: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: 20,
    fontSize: 20,
  },
});
