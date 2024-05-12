import { StatusBar } from 'expo-status-bar';
import { Button, Pressable, StyleSheet, Text, View } from 'react-native';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import * as FileSystem from "expo-file-system"
import { Audio } from 'expo-av';
import { writeAudioToFile } from './utils/writeAudioToFile';
import { playFromPath } from './utils/playFromPath';
import { useState } from 'react';
import { fetchAudio } from './utils/fetchAudio';

Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  staysActiveInBackground: false,
  playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
})

export default function App() {

  const [urlPath, setUrlPath] = useState("")
  const {state, startRecognizing, stopRecognizing, destroyRecognizer} = useVoiceRecognition()

  const listFiles = async () => {
    try {
      const result = await FileSystem.readAsStringAsync(FileSystem.documentDirectory!)
      if (result.length > 0){
        const filename = result[0]
        const path = FileSystem.documentDirectory + filename
        setUrlPath(path)
      }
    }catch (e) {
      console.log(e);
      
    }
  }

  const handleSubmit = async () => {
    if (!state.results[0]) return;
    try {
      const audioBlob = await fetchAudio(state.results[0])

      const reader = new FileReader()
      reader.onload = async (e) => {
        if (e.target && typeof e.target.result === "string"){
          const audioData = e.target.result.split(",")[1]

          const path = await writeAudioToFile(audioData)

          setUrlPath(path)
          await playFromPath(path)
          destroyRecognizer()

        }
      }

      reader.readAsDataURL(audioBlob)
    }catch (err){
      console.log(err);
      
    }
  }

  return (
    <View style={styles.container}>
      <Text>
        {JSON.stringify(state, null, 2)}
      </Text>
      <Pressable
        onPressIn={()=> {
          console.log("Im pressed")
          startRecognizing()
        }}
        onPressOut={()=>{
          console.log("Im left")
          stopRecognizing()
          handleSubmit()
        }}
        style={{
          width:'90%',
          padding:20,
          gap:10,
          borderWidth:3,
          alignItems:"center",
          borderRadius:10,
          borderColor:"lightgray"
        }}
      >
        <Text>Talk to me</Text>
      </Pressable>
      <Button title="Re play" onPress={async () => {
        await playFromPath(urlPath)
      }}></Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
