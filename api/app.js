import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { 
  SafeAreaView, 
  View, 
  Text, 
  Image, 
  FlatList, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const App = () => {
  const continueWatching = [
    { id: "1", title: "Grappler Baki", episode: "S1 Episode 4", image: "https://i.ibb.co/YpV7XbP/baki.jpg" },
    { id: "2", title: "Boku no Hero", episode: "S3 Episode 10", image: "https://images5.alphacoders.com/131/1319442.png" },
  ];

  const forYou = [
    { id: "1", title: "Secret Wars", year: "2022", image: "https://i.ibb.co/mTtHc2t/secretwars.jpg" },
    { id: "2", title: "Saharytan", year: "2022", image: "https://i.ibb.co/GVZ1STT/saharytan.jpg" },
    { id: "3", title: "Secret Wars", year: "2022", image: "https://i.ibb.co/mTtHc2t/secretwars.jpg" },
  ];

  const newReleases = [
    {
      id: "1",
      title: "Morbius",
      studio: "Marvel Studios",
      image: "https://images6.alphacoders.com/134/1343335.png",
    },
    {
      id: "2",
      title: "Venom",
      studio: "Sony Pictures",
      image: "https://images8.alphacoders.com/123/1234567.jpg",
    },
    {
      id: "3",
      title: "Spider-Man",
      studio: "Marvel Studios",
      image: "https://images3.alphacoders.com/123/123789.jpg",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header */}



  
        <View style={styles.header}>
          <View style={styles.profileWelcome}> 
          
         <View style={styles.profileWrapper}>
  <LinearGradient
    colors={["#8e2de2", "#4a00e0"]} // ungu ke biru muda
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.profileBorder}
  >
    <Image
      source={{ uri: "https://images.alphacoders.com/135/1356687.jpeg" }}
      style={styles.profile}
    />
  </LinearGradient>
  
</View>
            <View>
              <Text style={styles.welcome}>Welcome back</Text>
              <Text style={styles.name}>Maria</Text>
            </View>
          </View>
          <Ionicons name="menu" size={28} color="#fff" />
        </View>

        {/* New Releases */}
      
          <Text style={styles.sectionReales}>New Releases</Text>
          <FlatList
            data={newReleases}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.newReleaseCard}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.newReleaseImage}
                />
                <View style={styles.overlay}>
                  <Text style={styles.movieTitle}>{item.title}</Text>
                  <Text style={styles.studio}>{item.studio}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
    

        {/* Continue Watching */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continue Watching</Text>
          <FlatList
            data={continueWatching}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.continueCard}>
                <Image source={{ uri: item.image }} style={styles.continueImage} />
                <Text style={styles.continueTitle}>{item.title}</Text>
                <Text style={styles.continueEpisode}>{item.episode}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* For You */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>For You</Text>
          <FlatList
            data={forYou}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.forYouCard}>
                <Image source={{ uri: item.image }} style={styles.forYouImage} />
                <Text style={styles.forYouTitle}>{item.title}</Text>
                <Text style={styles.forYouYear}>{item.year}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0d0d", padding: 10 },

  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", margin: 20 },
  profileWelcome: { flexDirection: "row", alignItems: "center" },
  profileWrapper: {
  marginRight: 15,
},
profileBorder: {
  padding: 2,                  // tebal border gradient
  borderRadius: 30,            // harus lebih besar dari profile
  shadowColor: "#4facfe",      // warna shadow biru muda
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.4,
  shadowRadius: 20,
  elevation: 6,                // biar jalan di Android
},
profile: {
  width: 50,
  height: 50,
  borderRadius: 25,
},
  welcome: { color: "#ccc", fontSize: 14 },
  name: { color: "#fff", fontSize: 20, fontWeight: "bold" },

  // Section
  section: { marginLeft:12 , marginBottom:20},
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 10 },
  sectionReales:{
    color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 10, marginLeft:12
  },

  // New Release
  newReleaseCard: { borderRadius: 12, overflow: "hidden", marginLeft:20,marginBottom:20 , width: 300 },
  newReleaseImage: { width: "100%", height: 180, borderRadius: 12 },
  overlay: { position: "absolute", bottom: 10, left: 10 },
  movieTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  studio: { color: "#ccc", fontSize: 14 },

  // Continue Watching
  continueCard: { marginRight: 15, width: 120 },
  continueImage: { width: "100%", height: 80, borderRadius: 10, marginBottom: 5 },
  continueTitle: { color: "#fff", fontSize: 14, fontWeight: "600" },
  continueEpisode: { color: "#aaa", fontSize: 12 },

  // For You
  forYouCard: { marginRight: 15, width: 120 },
  forYouImage: { width: "100%", height: 150, borderRadius: 10, marginBottom: 5 },
  forYouTitle: { color: "#fff", fontSize: 14, fontWeight: "600" },
  forYouYear: { color: "#aaa", fontSize: 12 },
});

export default App;
