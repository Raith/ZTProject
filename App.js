import React from 'react';
import { StyleSheet, Text, View, Image, Button, TextInput, Linking, AsyncStorage, Keyboard } from 'react-native';
import { StackNavigator } from 'react-navigation';

const METAWEATHER_URL = 'https://www.metaweather.com/api/location';

export const getWeatherViaMetaWeather = (city) => {
  return fetch(`${METAWEATHER_URL}/search/?query=${city}`)
    .then(response => response.json())
    .then(result => fetch(`${METAWEATHER_URL}/${result[0].woeid}`))
    .then(response => response.json())
    .catch((error) => { console.error(error); });
};

//alternative method for getting the weather
export const getWeatherViaYahooWeather = (city) => {
  return fetch(`https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20u%3D'c'%20and%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22${city}%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys`)
    .then(response => response.json())
    .catch((error) => { console.error(error); });
};
  
const constants = {
  maxLength: 120,
  //Vilnius is not tracked by metaweather, therefore using altCity set to Minsk - the nearest city to Vilnius that is tracked
  //NOTE: using Vilnius latitude and longitude to find the city produces an array of closest cities (Vilnius is absent), of which Minsk is the closest
  city: 'Vilnius',
  altCity: 'Minsk',
  defaultInput: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In venenatis ligula, ut scelerisque mauri dapibus id.',
  gitURL: 'https://github.com/Raith/ZTProject/',
};
  
class ProfileScreen extends React.Component {
  static navigationOptions = {
    title: 'My profile',
    headerLeft: null,
  };
  
  async getInputValue() {
    try {
      const value = await AsyncStorage.getItem('@inputValue');
      this.setState({ inputValue: value });
      if (value != null) {
        this.setState({ textLength: value.length });
      } else {
        this.setState({ textLength: constants.defaultInput.length });
      }
    } catch (error) {
      console.log('Error retrieving data. ' + error);
    }
  };
  
  async saveInputValue(value) {
    try {
      await AsyncStorage.setItem('@inputValue', value);
    } catch (error) {
      console.log('Error saving data. ' + error);
    }
  };
  
  state = {
    inputValue: '',
    textLength: 0,
    temp: 0,
  };
  
  keyboardDidHide = () => {
    this.refs.TextInputRef.blur();
  };
  
  componentDidMount() {
    //providing an alternative to metaweather, which does not have Vilnius as a tracked location
    //getWeatherViaYahooWeather(constants.city).then((result) => this.setState({ temp: result.query.results.channel.item.condition.temp}));
    getWeatherViaMetaWeather(constants.altCity).then((result) => this.setState({ temp: result.consolidated_weather[0].the_temp }));
    this.getInputValue();
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
  };
  
  componentWillUnmount () {
    this.keyboardDidHideListener.remove();
  };
  
  handleButtonPress = () => {
    Linking.openURL(constants.gitURL);
  };
  
  handleTextChange = (input) => {
    this.setState({ textLength: input.length });
    this.setState({ inputValue: input });
    this.saveInputValue(input);
  };
  
  render() {
    return (
      <View style={styles.profileContainer}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 0, backgroundColor: '#fff', margin: '3%' }}>
            <Image
              style={styles.imgProfile}
              source={require("./assets/lucifer.png")}
            />
          </View>
          <View style={{ flex: 3, justifyContent: 'center' }}>
            <Text style={[styles.name, {textAlign: 'left'}]}> Darius Kazinec </Text>
          </View>
        </View>
        
        <View style={{flex: 1}}>
          <Text style={{ fontSize: 14, color: '#d3d3d3', marginLeft: '4%' }}> About me </Text>
          <View style={{ flex: 1 }}>
            <TextInput
              ref='TextInputRef'
              defaultValue = { constants.defaultInput }
              autoCorrect = { false }
              multiline = { true }
              maxLength = { constants.maxLength }
              value = { this.state.inputValue }
              onChangeText = { this.handleTextChange }
              style = {{ fontSize: 20, flex: 1, textAlignVertical: 'top', margin: '3%' }}/>
            <Text style={{ fontSize: 14, color: '#d3d3d3', textAlign: 'right', marginRight: '3%', marginTop: '-2%' }}> {this.state.textLength} / {constants.maxLength} </Text>
          </View>
        </View>
        
        <View style={{flex: 1, justifyContent: 'center',}}>
            <Text style={{ fontSize: 26, fontWeight: 'bold', textAlign: 'center' }}> I live in a City where current temperature is </Text>
            <Text style={{ fontSize: 30, fontWeight: 'bold', textAlign: 'center' }}> {this.state.temp ? Math.round(this.state.temp)+' °C' : 'Loading...'} </Text>
        </View>
        
        <View style={{flex: 1, alignItems: 'center',}}>
          <Button
            color = '#000'
            title = "My GitHub profile"
            onPress = { this.handleButtonPress }
          />
        </View>
      </View>
    );
  };
}

class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };
  
  handleButtonPress = () => {
    this.props.navigation.navigate('Profile')
  };

  render() {
    return (
      <View style={styles.homeContainer}>
        
        <Text style={[styles.name, {flex: 1, textAlignVertical: 'bottom'}]}>
          Darius Kazinec
        </Text>

        <Image
          style={styles.imgHome}
          source={require("./assets/lucifer.png")}
        />
          
        <View style={{flex: 1, justifyContent: 'flex-start'}}>
          <Button
            uppercase = {false}
            color = '#000'
            title = "My profile"
            onPress = { this.handleButtonPress }>
          </Button>
        </View>
      </View>
    );
  };
}

export default StackNavigator({
  Home: { screen: HomeScreen },
  Profile: { screen: ProfileScreen },
});

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  name: {
    color: '#000',
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imgHome: {
    flex: 2,
    margin: '5%',
    aspectRatio: 2/3,
  },
  imgProfile: {
    flex: 1,
    aspectRatio: 1,
  },
});
