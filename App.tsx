import { StatusBar } from 'expo-status-bar';
import { Button, Pressable, StyleSheet, Text, View } from 'react-native';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import * as FileSystem from "expo-file-system"
import { Audio } from 'expo-av';
import { writeAudioToFile } from './utils/writeAudioToFile';
import { playFromPath } from './utils/playFromPath';
import { useState } from 'react';
import { fetchAudio } from './utils/fetchAudio';

import OpenAI from "openai";

import * as Speech from 'expo-speech';

Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  staysActiveInBackground: false,
  playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
})

const openai = new OpenAI();

export default function App() {

  const speak = () => {
    const thingToSay = 'hello, i have a fat ass';
    Speech.speak(thingToSay);
  };

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
    //chat gpt hit endpoint
    // const completion = await openai.chat.completions.create({
    //   messages: [{ role: "system", content: "You are a helpful assistant." }],
    //   model: "gpt-3.5-turbo",
    // });

    // console.log(completion.choices[0]);


    
    console.log(state.results[0]);
    if (!state.results[0]) return;
    try {

      Speech.speak(state.results[0])
      // const audioBlob = await fetchAudio(state.results[0])
      // console.log("audioBlob");
      
      // Speech.speak()
      // const reader = new FileReader()
      // reader.onload = async (e) => {
      //   if (e.target && typeof e.target.result === "string"){
      //     const audioData = e.target.result.split(",")[1]

      //     const path = await writeAudioToFile(audioData)

      //     setUrlPath(path)
      //     await playFromPath(path)
      //     destroyRecognizer()

      //   }
      // }

      // reader.readAsDataURL(audioBlob)
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
      <Button title="Press to hear some words" onPress={handleSubmit} />
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
