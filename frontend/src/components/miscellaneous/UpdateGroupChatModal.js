import { Box, Button, FormControl, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure, useToast } from '@chakra-ui/react';
import React, { useState } from 'react'
import { AiFillEye } from "react-icons/ai";
import { ChatState } from '../../Context/ChatProvider';
import UserBadgeItem from '../UserAvatar/UserBadgeItem'
import axios from 'axios'
import UserListItem from '../UserAvatar/UserListItem';

//Modal while trying to change something in existing group(Update Group Modal)
const UpdateGroupChatModal = ({ fetchMessage,fetchMessages, fetchAgain, setFetchAgain }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState();
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameLoading, setRenameLoading] = useState(false);
    const { selectedChat, setSelectedChat, user } = ChatState();

    const toast = useToast();

    const handleRemove = async (user1) => {
        if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
          toast({
            title: 'Only Admin can remove someone..',
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'bottom'
          });
          return;
        }
        try {
          setLoading(true)
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
            }
          }
          const { data } = await axios.put('/api/chat/groupremove', {
            chatId: selectedChat._id,
            userId: user1._id
          }, config);
          user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
          setFetchAgain(!fetchAgain);
          fetchMessages();
          setLoading(false);
        } catch (error) {
          toast({
            title: 'Error Occurred while removing',
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'bottom'
          });
          setLoading(false);
        }
      };
      
    const handleAddUser = async (user1) => {
        if (selectedChat.users.find((u) => u._id === user1._id)) {
          toast({
            title: 'User Already in Group.',
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'bottom'
          });
          return;
        }
      
        if (selectedChat.groupAdmin._id !== user._id) {
            toast({
                title: 'Only Admin can add someone..',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            return
        }
        try {
            setLoading(true)
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
            const { data } = await axios.put('/api/chat/groupadd', {
                chatId: selectedChat._id,
                userId: user1._id
            },config);
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false)
        } catch (error) {
            toast({
                title: 'Error Occured',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
        }

    }

    const handleRename = async () => {
        if (!groupChatName) return

        try {
            setRenameLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };

            const { data } = await axios.put('/api/chat/rename', {
                chatId: selectedChat._id,
                chatName: groupChatName
            }, config
            )
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setRenameLoading(false);

        } catch (error) {
            toast({
                title: 'Error Occured!',
                description: error.response.data.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            })
            setRenameLoading(false);
        }

        setGroupChatName('');

    }
    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };
            const { data } = await axios.get(`/api/user?search=${search}`, config);
            setLoading(false)
            setSearchResults(data)
            console.log(data)
        } catch (error) {
            toast({
                title: 'Error Occured',
                description: 'Failed to load the search',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom-left'
            });
        }
    }
    return (
        <>
            <IconButton
                display={{ base: 'flex' }}
                icon={<AiFillEye />}
                onClick={onOpen}>Open Modal</IconButton>

            <Modal isCentered isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize={'35px'}
                        fontFamily={'Work sans'}
                        display={'flex'}
                        justifyContent={'center'}
                    >{selectedChat.chatName}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box w={'100%'}
                            display={'flex'}
                            flexWrap={'wrap'}
                            pb={3}
                        >
                            {selectedChat.users.map(u =>
                                <UserBadgeItem
                                    key={u._id}
                                    user={u}
                                    handleFunction={() => handleRemove(u)}
                                />
                            )}
                        </Box>
                        <FormControl
                            display={'flex'}
                        >
                            <Input
                                placeholder='Chat Name'
                                mb={3}
                                value={groupChatName}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                            <Button
                                variant={'solid'}
                                colorScheme='teal'
                                ml={1}
                                isLoading={renameLoading}
                                onClick={handleRename}
                            >
                                Update
                            </Button>
                        </FormControl>
                        <FormControl
                            display={'flex'}
                        >
                            <Input
                                placeholder='Add users to the group'
                                mb={3}
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />

                        </FormControl>
                        {
                            loading ? (
                                <Spinner size={'lg'} />
                            ) : (
                                searchResults?.map((user) => (
                                    <UserListItem
                                        key={user._id}
                                        user={user}
                                        handleFunction={() => handleAddUser(user)}
                                    />)
                                ))
                        }
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='red' onClick={()=>handleRemove(user)}>
                            Leave Group
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default UpdateGroupChatModal