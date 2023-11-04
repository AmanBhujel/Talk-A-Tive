import { Avatar, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Input, Menu, MenuButton, MenuItem, MenuList, Spinner, Text, Toast, Tooltip, useDisclosure, useToast } from '@chakra-ui/react';
import React, { useState } from 'react'
import { BsChevronBarDown, BsChevronBarRight, BsSearch } from "react-icons/bs";
import { AiOutlineBell } from "react-icons/ai";
import { ChatState } from '../../Context/ChatProvider';
import ProfileModal from './ProfileModal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';

//Top Component of chat page -----Have Logo , Profile and search bar
// Also have Side Drawer which opens after search button is clicked
const SideDrawer = () => {
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
  const Toast = useToast();

  const notificationCount = notification.length;

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/')
  }
  const handleSearch = async () => {
    if (!search) {
      Toast({
        title: 'Please enter the text first',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top-left'
      });
      return;
    }
    try {
      setLoading(true);
      const token = user.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);

      //   fetch(`http://localhost:5000/api/user?search=${search}`, {
      //     method: "get",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${user.token}`
      //     },
      //   }).then(res => res.json())
      //     .then((result) => {
      //       console.log(result)
      //     })

    } catch (error) {
      Toast({
        title: 'Error Occured',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left'
      });
    }
  }

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const token = user.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      const { data } = await axios.post('/api/chat', { userId }, config)

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();


    } catch (error) {
      console.log('error')
      Toast({
        title: 'Error Occured',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left'
      });
    }
  }


  return (
    <>
      <Box
        display={'flex'}
        justifyContent={'space-between'}
        alignItems={'center'}
        bg={'white'}
        w="100%"
        p={'5px 10px 5px 10px'}
        borderWidth={'5px'}
      >
        <Tooltip label='Search Users to Chat' hasArrow placement='bottom-end'>
          <Button variant='ghost' onClick={onOpen}>
            <BsSearch />
            <Text
              display={{ base: "none", md: "flex" }}
              px={'4'}
            >
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize={"2xl"} fontFamily='Work sans'>
          Talk-A-Tive
        </Text>
        <div >
          <Menu>
            <MenuButton p={1} style={{ position: 'relative' }}>
              <AiOutlineBell />
              {notificationCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    backgroundColor: "red",
                    color: "white",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    zIndex: '1'
                  }}
                >
                  {notificationCount}
                </span>
              )}
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && 'No New Messages'}
              {notification.map(notif => (
                <MenuItem key={notif._id} onClick={() => {
                  setSelectedChat(notif.chat)
                  setNotification(notification.filter((n) => n !== notif))
                }}>
                  {notif.chat.isGroupChat ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${notif.sender.name}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<BsChevronBarDown />}>
              <Avatar
                size={'sm'}
                cursor={'pointer'}
                name={user.name}
                src={user.pic}
              >
              </Avatar>
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuItem onClick={logoutHandler}>Log out</MenuItem>

            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth={'1px'}>
            Search Users
          </DrawerHeader>
          <DrawerBody>
            <Box
              display={'flex'}
              pb={2}>
              <Input
                placeholder='Search name or email'
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (<ChatLoading />)
              :
              (searchResult && searchResult.map(u => (
                <UserListItem
                  key={u._id}
                  user={u}
                  handleFunction={() => accessChat(u._id)}
                />
              )))
            }
            {loadingChat && <Spinner ml='auto' display={'flex'} />}
          </DrawerBody>
        </DrawerContent>

      </Drawer>
    </>
  )
}

export default SideDrawer;