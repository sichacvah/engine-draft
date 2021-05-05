import React from 'react'
import { Modals, Tabs, TabGenerator } from './ModuleManagement/types'
import { createStackNavigator } from '@react-navigation/stack'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

const makeRootTabs = (tabs: [id: string, generator: TabGenerator][]) => () => {
	return (
		<Tab.Navigator>
			{tabs.map(([id, generator]) => {
				const tab = generator()
				return (
					<Tab.Screen
						key={id}
						name={tab.name}
						component={tab.component}
					/>
				)
			})}
		</Tab.Navigator>
	)
}

export const makeNavigator = (modals: Modals, tabs: Tabs) => () => {
	const modalsEntries = Object.entries(modals)
	const tabsEntries = Object.entries(tabs)
	const RootTabs = makeRootTabs(tabsEntries)
	return (
		<NavigationContainer>
			<Stack.Navigator mode='modal'>
				<Stack.Screen
					key='RootTabs'
					name='RootTabs'
					component={RootTabs}
				/>
				{modalsEntries.map(([id, modalGenerator], index) => {
					const modal = modalGenerator()
					return (
						<Stack.Screen
							key={`${index}`}
							id={id}
							name={modal.name}
							options={modal.options}
							component={modal.component}
						/>
					)
				})}
			</Stack.Navigator>
		</NavigationContainer>
	)
}
