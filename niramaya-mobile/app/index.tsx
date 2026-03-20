import { StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

// The local IP running the web server (update as needed)
// Usually 10.0.2.2 for Android emulators, or your actual WiFi IP (e.g. 192.168.1.X) for physical devices
// Based on terminal output, IP is 10.230.207.165 
const WEB_URL = 'http://10.230.207.165:8080';

export default function App() {
    return (
        <SafeAreaView style={styles.container}>
            <WebView
                source={{ uri: WEB_URL }}
                style={styles.webview}
                bounces={false}
                allowsInlineMediaPlayback
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    webview: {
        flex: 1,
    },
});
