import { StatusBar } from 'expo-status-bar';
   import { StyleSheet } from 'react-native';
   import { createStackNavigator } from '@react-navigation/stack';
   import { NavigationContainer } from '@react-navigation/native';
   import Index from './index';
   import Login from './screens/Login';
   import Home from './screens/Home';

   const Stack = createStackNavigator();

   function MyStack() {
     return (
       <Stack.Navigator initialRouteName="Index">
         <Stack.Screen
           name="Index"
           component={Index}
           options={{
             title: 'Centinela',
             headerTintColor: 'white',
             headerTitleAlign: 'center',
             headerStyle: { backgroundColor: '#525FE1' },
           }}
         />
         <Stack.Screen
           name="Login"
           component={Login}
           options={{
             title: 'Inicio de Sesión',
             headerTintColor: 'white',
             headerTitleAlign: 'center',
             headerStyle: { backgroundColor: '#525FE1' },
           }}
         />
         <Stack.Screen
           name="Home"
           component={Home}
           options={{
             title: 'Home',
             headerTintColor: 'white',
             headerTitleAlign: 'center',
             headerStyle: { backgroundColor: '#525FE1' },
           }}
         />
       </Stack.Navigator>
     );
   }

   export default function App() {
     return (
       <NavigationContainer>
         <MyStack />
         <StatusBar style="auto" />
       </NavigationContainer>
     );
   }

   const styles = StyleSheet.create({
     container: {
       flex: 1,
       backgroundColor: '#FFF',
       alignItems: 'center',
       justifyContent: 'center',
     },
   });