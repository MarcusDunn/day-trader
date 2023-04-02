import React, { useContext, useEffect } from 'react'
import SignIn from '../src/components/SignIn'
import { UserContext } from './_app';

function login() {
    const { user } = useContext(UserContext);
    useEffect(() => {
        if(user){
            window.location.href = "/"
        }
    })
    return (
        <SignIn />
    )
}

export default login