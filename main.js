// @flow

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  StatusBar,
} from 'react-native';

import AppGrid from './src/AppGrid';
import HomeButton from './src/HomeButton';

type App = { id: string, icon: string, name: string };

export default class Fallboard extends Component {
  state = {
    backgroundImage: 'https://cdn0.vox-cdn.com/uploads/chorus_image/image/50846253/24961941116_faabb955c3_k.0.0.jpg',
    apps: [
      { id: 'calendar', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Calendar-Blank-Vector.svg/1024px-Calendar-Blank-Vector.svg.png', name: 'Calendar' },
      { id: '2calendar', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Calendar-Blank-Vector.svg/1024px-Calendar-Blank-Vector.svg.png', name: '2Calendar' },
      { id: '3calendar', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Calendar-Blank-Vector.svg/1024px-Calendar-Blank-Vector.svg.png', name: '3Calendar' },
      { id: '4calendar', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Calendar-Blank-Vector.svg/1024px-Calendar-Blank-Vector.svg.png', name: '4Calendar' },
      { id: '5calendar', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Calendar-Blank-Vector.svg/1024px-Calendar-Blank-Vector.svg.png', name: '5Calendar' },
    ],

    height: 10000,
    width: 10000,
    isEditing: false,
  };

  handleLayout = (e: Object) => {
    const { height, width } = e.nativeEvent.layout;
    this.setState({ height, width });
  };

  startEditing = () => this.setState({ isEditing: true });
  stopEditing = () => this.setState({ isEditing: false });

  handleRearrange = (newApps: Array<App>) => this.setState({ apps: newApps });

  handleHome = () => {
    this.stopEditing();
  };

  render() {
    return (
      <View style={{ flex: 1, paddingTop: 20 }} onLayout={this.handleLayout}>
        <StatusBar hidden />

        <Image
          source={{ uri: this.state.backgroundImage }}
          style={[StyleSheet.absoluteFill, { height: this.state.height, width: this.state.width }]}
        />

        <AppGrid
          apps={this.state.apps}
          isEditing={this.state.isEditing}
          onStartEditing={this.startEditing}
          onStopEditing={this.stopEditing}
          onRearrangeApps={this.handleRearrange}
        />

        <HomeButton onPress={this.handleHome} />
      </View>
    );
  }
}
