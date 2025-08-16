import React, { useEffect, useState } from "react";
import { Image } from "expo-image";
import { 
  SafeAreaView, 
  View, 
  Text, 
  FlatList,  
  ActivityIndicator, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function App() {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [completeAnime, setCompleteAnime] = useState([]);
  const [loadingComplete, setLoadingComplete] = useState(true);
  const [errorComplete, setErrorComplete] = useState(null);

  const [jadwal, setJadwal] = useState([]);
  const [activeDay, setActiveDay] = useState("Senin");

  // Fetch on-going anime
  useEffect(() => {
    fetch("https://otakudesutawny.vercel.app/api/anime")
      .then(res => {
        if (!res.ok) throw new Error("Gagal mengambil data on-going");
        return res.json();
      })
      .then(data => {
        setAnime(data);
        setLoading(false);

        // Generate jadwal otomatis dari data on-going
        const grouped = data.reduce((acc, item) => {
          if (!acc[item.hari]) acc[item.hari] = [];
          acc[item.hari].push(item);
          return acc;
        }, {});
        setJadwal(Object.keys(grouped).map(day => ({ title: day, data: grouped[day] })));
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Fetch complete anime
  useEffect(() => {
    fetch("https://otakudesutawny.vercel.app/api/anime/complete")
      .then(res => {
        if (!res.ok) throw new Error("Gagal mengambil data complete");
        return res.json();
      })
      .then(data => {
        setCompleteAnime(data);
        setLoadingComplete(false);
      })
      .catch(err => {
        setErrorComplete(err.message);
        setLoadingComplete(false);
      });
  }, []);

  const renderAnime = ({ item }) => (
    <View style={styles.cardAnime}>
      <Image source={{ uri: item.thumbnail }} style={styles.animeImage} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.animeTitle}>{item.judul}</Text>
        <Text style={styles.animeInfo}>{item.episode} - {item.tanggal}</Text>
      </View>
    </View>
  );

  if (loading || loadingComplete) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
        <Text style={{ color: "#fff" }}>Mengambil data anime...</Text>
      </SafeAreaView>
    );
  }

  if (error || errorComplete) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: "red" }}>Terjadi error: {error || errorComplete}</Text>
      </SafeAreaView>
    );
  }

  // Data dummy New Releases
  const newReleases = [
    { id: "1", title: "One Piece", studio: "Toei Animation", image: "https://giffiles.alphacoders.com/221/221024.gif" },
    { id: "2", title: "Hunter X Hunter", studio: "Nippon Animation dan Madhouse", image: "https://giffiles.alphacoders.com/142/142513.gif" },
    { id: "3", title: "Demon Slayer: Kimetsu No \nYaiba", studio: "Ufotable", image: "https://giffiles.alphacoders.com/221/221017.gif" },
      { id: "4", title: "Fate/Grand Order", studio: "Ufotable", image: "https://giffiles.alphacoders.com/134/13487.gif" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileWelcome}> 
            <View style={styles.profileWrapper}>
              <LinearGradient
                colors={["#8e2de2", "#4a00e0"]}
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
              <Text style={styles.name}>Merunime</Text>
            </View>
          </View>
        </View>

        {/* New Releases */}
        <Text style={styles.sectionReales}>Favorit Visitor</Text>
        <FlatList
          data={newReleases}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.newReleaseCard}>
              <Image source={{ uri: item.image }} style={styles.newReleaseImage} />
              <View style={styles.overlay}>
                <Text style={styles.movieTitle}>{item.title}</Text>
                <Text style={styles.studio}>{item.studio}</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Complete Anime */}
        <View style={styles.section}>
        <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Complete Anime</Text>
        
          <TouchableOpacity 
    style={styles.completeAllButton}
    onPress={() => {
      // Contoh aksi: scroll ke top / highlight / filter semua
      alert("Menampilkan semua anime Complete!");
    }}
  >
    <Text style={styles.completeAllText}>Complete All</Text>
  </TouchableOpacity>
  </View>
          
          <FlatList
            data={completeAnime}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.forYouCard}>
                <Image source={{ uri: item.thumbnail }} style={styles.forYouImage} />
                <Text style={styles.forYouTitle}>{item.judul}</Text>
                <Text style={styles.forYouYear}>{item.episode}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* On-Going Hari ini */}
     
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>On-Going Hari ini</Text>
          <FlatList
            data={anime}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.forYouCard}>
                <Image source={{ uri: item.thumbnail }} style={styles.forYouImage} />
                <Text style={styles.forYouTitle}>{item.judul}</Text>
                <Text style={styles.forYouYear}>{item.episode}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Tab Hari */}
           <View style={styles.section}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          {jadwal.map((hari, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.tabButton, activeDay === hari.title && styles.tabButtonActive]}
              onPress={() => setActiveDay(hari.title)}
            >
              <Text style={[styles.tabText, activeDay === hari.title && styles.tabTextActive]}>
                {hari.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List Anime per Hari */}
        <View style={styles.jadwalContent}>
          {(jadwal.find(h => h.title === activeDay)?.data || []).map((anime, i) => (
            <View key={i} style={styles.cardAnime}>
              <Image source={{ uri: anime.thumbnail }} style={styles.animeImage} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.animeTitle}>{anime.judul}</Text>
                <Text style={styles.animeInfo}>{anime.episode} - {anime.tanggal}</Text>
              </View>
            </View>
          ))}
          {(jadwal.find(h => h.title === activeDay)?.data || []).length === 0 && (
            <Text style={{ marginTop: 10, color: "#ccc" }}>Tidak ada anime hari {activeDay}.</Text>
          )}
        </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0d0d", padding: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0d0d0d" },

  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", margin: 20 },
  profileWelcome: { flexDirection: "row", alignItems: "center" },
  profileWrapper: { marginRight: 15 },
  profileBorder: {
    padding: 2,
    borderRadius: 30,
    shadowColor: "#4facfe",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 6,
  },
  profile: { width: 50, height: 50, borderRadius: 25 },
  welcome: { color: "#ccc", fontSize: 14 },
  name: { color: "#fff", fontSize: 20, fontWeight: "bold" },

  // Section
  section: { marginLeft:5 , marginBottom:25 },
  sectionRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  
  marginBottom: 10,
},
completeAllButton: {
  backgroundColor: "#6a5acd",
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderRadius: 20,
},
completeAllText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 12,
},

  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 10 },
  sectionReales: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 10, marginLeft:12 },

  // New Release
  newReleaseCard: { borderRadius: 12, overflow: "hidden", marginLeft:20, marginBottom:20 , width: 320 },
  newReleaseImage: { width: "100%", height: 180, borderRadius: 12 },
  overlay: { position: "absolute", bottom: 10, left: 10 },
  movieTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  studio: { color: "#ccc", fontSize: 14 },

  // On Going (For You)
  forYouCard: { marginRight: 15, width: 120 },
  forYouImage: { width: "100%", height: 150, borderRadius: 10, marginBottom: 5 },
  forYouTitle: { color: "#fff", fontSize: 14, fontWeight: "600" },
  forYouYear: { color: "#aaa", fontSize: 12 },

  // Tab
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#2a2a2a",
    marginRight: 8,
  },
  tabButtonActive: { backgroundColor: "#6a5acd" },
  tabText: { color: "#ccc", fontSize: 14 },
  tabTextActive: { color: "#fff", fontWeight: "bold" },

  // Card Anime
  cardAnime: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  animeImage: { width: 60, height: 80, borderRadius: 8 },
  animeTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  animeInfo: { color: "#aaa", fontSize: 12, marginTop: 4 },

  jadwalContent: { paddingBottom: 20 },
});
