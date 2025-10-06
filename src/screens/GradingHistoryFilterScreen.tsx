import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AppSafeView from '../components/views/AppSafeView'
import ScreenHeader from '../components/common/ScreenHeader'

const GradingHistoryFilterScreen = () => {
  return (
    <AppSafeView>
      <ScreenHeader title='Filters' />
    </AppSafeView>
  )
}

export default GradingHistoryFilterScreen

const styles = StyleSheet.create({})