import React from 'react'
import RegisterAndLoginFrom from './components/RegisterAndLoginFrom'
import { UserContext } from "./context/UserContext"
import { useContext } from 'react'
import Chat from './components/Chat'

const Routes = () => {
    const { username } = useContext
    (UserContext);
    if(username){
        return <Chat />;
    }
  return (
    <RegisterAndLoginFrom />
  )
}

export default Routes