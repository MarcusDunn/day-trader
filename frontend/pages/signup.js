import React, { useContext, useEffect } from 'react'
import SignUp from '../src/components/SignUp'
import { UserContext } from './_app';

function signup() {
    const { user } = useContext(UserContext);
    useEffect(() => {
        if(user){
            window.location.href = "/"
        }
    })
    return (
        <SignUp />
    )
}

export default signup