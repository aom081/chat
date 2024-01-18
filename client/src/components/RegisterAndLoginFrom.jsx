import { useState, useContext } from 'react';
import axios from 'axios';
import UserContext, { UserContextProvider } from '../context/UserContext';

const RegisterAndLoginFrom = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoginOrRegister, setLoginOrRegister] = useState("login");
    //rename setUsername is setLoginUsername
    const { setUsername: setLoginUsername, setId } = useContext(UserContext);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isLoginOrRegister === 'register' ? "register" : "Login";
        const { data } = axios.post(url, { username, password });
        setLoginUsername(username);
        setId(data.id)
    }
    const register = async (e) => {
        e.preventDefault();
        const response = await fetch(`${baseURL}/register`, {
            method: "POST",
            body: JSON.stringify({ username, password }),
            headers: { "Content-Type": "application/json" }
        });
        if (response.status === 200) {
            alert(" successful !")
        }
        else {
            alert("Register or Login failed !")
        }
    };

    //Register ro Login
    return (
        <div className='bg-blue-50 h-screen flex items-center'>
            <form className='w-64 mx-auto mb-12' onSubmit={handleSubmit}>
                <h1>Register or Login</h1>
                <input type="text"
                    className='block w-full rounded-sm p-2 mb-2 border'
                    value={username}
                    placeholder='username'
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input type="password"
                    className='block w-full rounded-sm p-2 mb-2 border'
                    value={password}
                    placeholder='Password'
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className='bg-blue-500 text-white w-full rounded-sm p-2'>
                    {isLoginOrRegister === "register" ? "Register" : "Login"}
                </button>
                <div className='text-center mt-2'>
                    {isLoginOrRegister == 'register' && (
                        <div>
                            Already a member ? {" "}
                            <button
                                className='m1-1'
                                onClick={() => {
                                    setLoginOrRegister("login");
                                }}
                            >
                                Login here
                            </button>
                        </div>
                    )}
                    {isLoginOrRegister === "login" && (
                        <div>
                            Don't have an account?{" "}
                            <button
                                className='m1-1'
                                onClick={() => {
                                    setLoginOrRegister("register");
                                }}> Register </button>
                        </div>
                    )}
                </div>
            </form>
        </div>

    )
}

export default RegisterAndLoginFrom;