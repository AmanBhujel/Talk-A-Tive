import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import { Button, ButtonGroup } from '@chakra-ui/react'
import { BiArrowBack } from "react-icons/bi";
import { getSender, getSenderFull } from './config/ChatLogics';
import ProfileModal from './miscellaneous/ProfileModal';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
// import { AiFillEye } from "react-icons/ai";
import axios from 'axios';
import './styles.css'
import ScrollableChat from './ScrollableChat';
import io from 'socket.io-client'
import animationData from '../animation/lottie.json'
import Lottie from "lottie-react";

const ENDPOINT = 'http://localhost:5000';
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessages, setNewMessages] = useState('');
    const [socketConnected, setSocketConnected] = useState(false);

    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();
    const toast = useToast();
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const defaultOptions = {
        loop: true,
        autoplay: true,
    };
    // fetching the message
    const fetchMessages = async () => {
        if (!selectedChat._id) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            };
            setLoading(true);

            const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
            setMessages(data);
            setLoading(false);

            socket.emit('join chat', selectedChat._id)
        } catch (error) {
            console.log(error)
            toast({
                title: 'Error Occured!',
                description: 'Failed to Load the Messages',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            })
        }
    }

    const sendMessage = async (event) => {
        socket.emit('stop typing', selectedChat._id)
        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };
            setNewMessages("");
            const { data } = await axios.post(
                "/api/message",
                {
                    content: newMessages,
                    chatId: selectedChat._id,
                },
                config
            );
            socket.emit("new message", data);
            setMessages([...messages, data]);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to send the Message",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    }

    const handleInputKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission
            sendMessage();
        }
    };

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));
    }, []);

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        socket.on("message received", (newMessageReceived) => {
            if (
                !selectedChatCompare || // if chat is not selected or doesn't match the current chat
                selectedChatCompare._id !== newMessageReceived.chat._id
            ) {
                if (!notification.includes(newMessageReceived)) {
                    setNotification([newMessageReceived, ...notification]);
                    setFetchAgain(!fetchAgain);
                }
            } else {
                setMessages([...messages, newMessageReceived]);
            }
        });
    });
    const typingHandler = (e) => {
        setNewMessages(e.target.value);

        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    return (
        <>
            {selectedChat ? (
                <>
                    <Text
                        fontSize={{ base: '28px', md: '30px' }}
                        pb={3}
                        px={2}
                        w={'100%'}
                        fontFamily={'Work sans'}
                        display={'flex'}
                        justifyContent={{ base: 'space-between' }}
                        alignItems={'center'}
                    >
                        <IconButton
                            display={{ base: 'flex', md: 'none' }}
                            icon={<BiArrowBack />}
                            onClick={() => setSelectedChat('')}
                        />
                        {!selectedChat.isGroupChat ? (

                            <>
                                {selectedChat.users && getSender(user, selectedChat.users)}
                                {selectedChat.users && (
                                    <ProfileModal
                                        user={getSenderFull(user, selectedChat.users)}
                                    />
                                )}

                            </>
                        ) : (
                            <>
                                {selectedChat.chatName.toUpperCase()}
                                <UpdateGroupChatModal
                                    fetchAgain={fetchAgain}
                                    setFetchAgain={setFetchAgain}
                                    fetchMessages={fetchMessages}
                                />
                            </>
                        )}

                    </Text>
                    <Box

                        display={'flex'}
                        flexDir={'column'}
                        // justifyContent={'center'}
                        justifyContent={'space-between'}

                        p={3}
                        bg={'#E8E8E8'}
                        w={'100%'}
                        h={'100%'}
                        borderRadius={'lg'}
                        overflowY={'hidden'}
                    >
                        {loading ? (
                            <Spinner
                                size={'xl'}
                                w={20}
                                h={20}
                                alignSelf={'center'}
                                margin={'auto'}
                            />
                        ) : (
                            <div className='messages'>
                                <ScrollableChat messages={messages} />
                            </div>
                        )}
                        <FormControl
                            isRequired
                            mt={3}

                        >
                            {isTyping ?
                                <div style={{
                                    width: '100px', /* Adjust as needed */
                                    height: '40px' /* Adjust as needed */
                                }}>
                                    <Lottie
                                        options={defaultOptions}
                                        animationData={animationData}
                                        style={{ marginBottom: 15, marginLeft: 15 }}
                                    />
                                </div>
                                : <></>}
                            <div style={{ display: 'flex' }}>
                                <Input
                                    variant={'filled'}
                                    bg={'#E0E0E0'}
                                    placeholder='Enter a message...'
                                    onChange={typingHandler}
                                    value={newMessages}
                                    onKeyDown={handleInputKeyPress}
                                />
                                <Button
                                    type='submit'
                                    onClick={sendMessage}
                                    variant="solid"
                                    colorScheme="teal"
                                >
                                    Send
                                </Button>
                            </div>
                        </FormControl>
                    </Box>
                </>
            ) :
                (
                    <Box display={'flex'}
                        justifyContent={'center'}
                        h={'100%'}>
                        <Text fontSize={'3xl'} pb={3} fontFamily={'Work sans'}>
                            Click on a user to start chatting
                        </Text>
                    </Box>
                )}
        </>
    )
}

export default SingleChat;