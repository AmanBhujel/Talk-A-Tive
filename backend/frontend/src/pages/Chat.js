import React, { useState } from 'react'
import { Box } from '@chakra-ui/react'
import { ChatState } from '../Context/ChatProvider.js'
import SideDrawer from '../components/miscellaneous/SideDrawer.js';
import MyChats from '../components/miscellaneous/MyChats.js';
import ChatBox from '../components/miscellaneous/ChatBox.js';

const Chat = () => {
  const { user } = ChatState();
  const [fetchAgain,setFetchAgain]= useState(false);
  return (
    <div style={{ width: '100%' }}>
      {user && <SideDrawer/>}
      <Box 
      d='flex'
      justifyContent='space-between'
      w='100%'
      h='91.5vh'
      p='10px'
      >
        {user && <MyChats fetchAgain={fetchAgain}  />}
        {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}

      </Box>
    </div>
  )
}

export default Chat;