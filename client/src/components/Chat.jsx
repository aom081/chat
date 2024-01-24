import React, { useEffect, useId, useState } from 'react';
import { UserContext } from '../context/UserContext'
import axios from 'axios';
import Logo from './Logo';
import Contact from './Contact';
import { useContext } from 'react';

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [message, setMessage] = useState([]);
  const { username, id, setUsername, setId } = useContext(UserContext);

  useEffect(() => {
    connectToWs();
  }, [selectedUserId]);
  const connectToWs = () => {
    const ws = new WebSocket('ws://localhost:4000');
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("Disconnected. Trying to reconnect. ");
        connectToWs();
      }, 5000);
    })
  };

  const handleMessage = (e) => {
    const messageData = JSON.parse(e.data);
    if ('online' in messageData) {
      showOnlinePeople(messageData.online)
    } else if ('text' in messageData) {
      if (messageData.sender === selectedUserId) {
        setMessage((prev) => [...prev, { ...messageData }]);
      }
    }
  };

  const showOnlinePeople = (peopleArray) => {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  };

  useEffect(() => {
    axios.get("/people").then(res => {
      const offlinePeopleArr = res.data
        .filter(p => p._id != id)
        .filter(p => !Object.keys(onlinePeople).includes(p._id))
      const offlinePeople = {};
      offlinePeopleArr.forEach(p => {
        offlinePeopleArr[p._id] = p;
      });
      console.log("offline people");
      setOfflinePeople(offlinePeople);
    });
  }, [onlinePeople]);
  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];

  const logout = () => {
    axios.post("/logout").then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
    })
  }

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 flex-col">
        <div className="flex-grow">
          <Logo />
          {Object.keys(onlinePeopleExclOurUser).map((userId) => (
            <Contact
              key={userId}
              username={onlinePeopleExclOurUser[userId]}
              id={userId}
              online={true}
              selectUser={userId === selectedUserId}
              onClick={() => setSelectedUserId(useId)}
            />
          ))}

          {Object.keys(offlinePeopleExclOurUser).map((userId) => (
            <Contact
              key={userId}
              username={offlinePeopleExclOurUser[userId].username}
              id={userId}
              online={false}
              selectUser={userId === selectedUserId}
              onClick={() => setSelectedUserId(useId)}
            />
          ))}

        </div>
        <div className="p-2 text-center flex items-center justify-center">
          <span className="mr-2 text-sm text-gray-600 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5">
              <path stroke-linecap="round"
                stroke-linejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            {username}
          </span>
          <button className='text-sm bg-blue-100 py-1 px-2 text-gray-500 border rounded-sm' onClick={logout}>
            logout
          </button>
        </div>
      </div>
      <div className="flex flex-col bg-blue-50 w-2/3 p-2">
        <div className="flex-grow">
          <div className="relative h-full flex-grow items-center justify-center">
            <div className="text-gray-300">
              &larr; Select a person from sidebar
            </div>
          </div>
        </div>
        <from className="flex gap-2">
          <input type="text"
            placeholder='Type your message'
            className="bg-white flex-grow border rounded-sm p-2"
          />
          <label className="bg-blue-200 p-2 text-gray-600 cursor-pointer rounded-sm border-blue-200">
            <input type="file" className='hidden' />
            <svg
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="m9 13.5 3 3m0 0 3-3m-3 3v-6m1.06-4.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
            </svg>
          </label>
          <button
            type='submit'
            className='bg-blue-500 p-2 text-white rounded-sm'
          >
            <svg
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </from>
      </div>
    </div>
  );
};


export default Chat;