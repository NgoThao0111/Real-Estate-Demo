import express from 'express';

import {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  markMessagesRead,
  addParticipant
} from '../controllers/chat.controller.js';

const router = express.Router();

router.post('/', createConversation);
router.get('/', getConversations);
router.get('/:id/messages', getMessages);
router.put('/:id/read', markMessagesRead);
router.post('/:id/participants', addParticipant);
router.post('/:id/messages', sendMessage);

export default router;