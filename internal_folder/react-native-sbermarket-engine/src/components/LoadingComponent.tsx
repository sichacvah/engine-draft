import React from 'react'
import {View, StyleSheet, ActivityIndicator} from 'react-native'


export const LoadingComponent = () => {
	return (
    <View style={styles.container}>
      <ActivityIndicator animating color='black'/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
  },
})
