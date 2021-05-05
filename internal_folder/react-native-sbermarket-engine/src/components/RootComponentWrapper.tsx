import React, { useState, ComponentType, useEffect } from 'react'
import {LoadingComponent} from './LoadingComponent'


export type RootComponentWrapperParams = {
  getComponent: () => Promise<ComponentType>
}

let RootComponent

export const rootComponentWrapper = (props: RootComponentWrapperParams) => {
  const RootComponentWrapper = () => {
    const [isLoaded, setIsLoaded] = useState<boolean>(false)

    useEffect(() => {
      props.getComponent().then((component) => {
        RootComponent = component
        setIsLoaded(true)
      })
    }, [props.getComponent, setIsLoaded])

    if (isLoaded) return <RootComponent />
    return <LoadingComponent />
  }
  return RootComponentWrapper
}
