// @flow

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';

export default class HomeButton extends Component {
  props: {
    onPress: () => void;
  };

  glow: Animated.Value;

  componentWillMount() {
    this.glow = new Animated.Value(0);
  }

  handlePressIn = () => {
    Animated.spring(this.glow, {
      toValue: 1,
    }).start();
  };

  handlePressOut = () => {
    Animated.spring(this.glow, {
      toValue: 0,
    }).start();
  };

  render() {
    const buttonStyle = {
      height: 50,
      width: 50,
      borderRadius: 25,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderWidth: 2,
      borderColor: 'rgba(80, 80, 80, 0.9)',
      shadowColor: '#eee',
      shadowRadius: this.glow.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 6],
      }),
      shadowOpacity: this.glow.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.4],
      }),
    };
    return (
      <View style={{ flex: 0, height: 70, backgroundColor: 'rgba(10, 10, 10, 0.7)', justifyContent: 'center', alignItems: 'center' }}>
        <TouchableWithoutFeedback onPress={this.props.onPress} onPressIn={this.handlePressIn} onPressOut={this.handlePressOut} delayPressOut={120}>
          <Animated.View style={buttonStyle} />
        </TouchableWithoutFeedback>
      </View>
    );
  }
}
