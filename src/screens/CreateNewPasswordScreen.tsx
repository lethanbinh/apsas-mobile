import React from 'react'
import { StyleSheet, View } from 'react-native'
import AuthenticationHeader from '../components/authentication/AuthenticationHeader'
import CreateNewPasswordForm from '../components/authentication/CreateNewPasswordForm'
import { globalStyles } from '../styles/shareStyles'

const CreateNewPasswordScreen = () => {
  return (
    <View style={styles.container}>
      <AuthenticationHeader
        title="Create new Password"
        description="Type your new password"
      />
      <CreateNewPasswordForm />
    </View>
  )
}

export default CreateNewPasswordScreen

const styles = StyleSheet.create({
  container: globalStyles.authenticationContainer,
})