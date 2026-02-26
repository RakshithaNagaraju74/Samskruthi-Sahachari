// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { checkUserType } = require('../middlewares/checkUserType');

// ============================================
// USER MESSAGE ROUTES
// ============================================

// Get user's conversations
router.get('/conversations', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const conversations = await Message.getUserConversations(userId);
        
        res.json({
            success: true,
            data: conversations
        });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch conversations'
        });
    }
});

// Get or create conversation with enterprise
router.post('/conversations/start', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { enterpriseId, siteId, subject } = req.body;
        
        if (!enterpriseId) {
            return res.status(400).json({
                success: false,
                message: 'Enterprise ID is required'
            });
        }
        
        const conversation = await Message.getOrCreateConversation(
            userId, 
            enterpriseId, 
            siteId || null, 
            subject || 'Inquiry about heritage site'
        );
        
        res.json({
            success: true,
            data: conversation
        });
    } catch (error) {
        console.error('Error starting conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start conversation'
        });
    }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', authMiddleware, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        
        // Verify user has access to this conversation
        const conversation = await Message.getConversationById(conversationId);
        
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }
        
        if (conversation.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        
        const messages = await Message.getMessages(conversationId, parseInt(limit), parseInt(offset));
        
        // Mark messages as read
        await Message.markAsRead(conversationId, req.user.id);
        
        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages'
        });
    }
});

// Send a message
// routes/messageRoutes.js
router.post('/conversations/:conversationId/messages', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    // Check if conversation exists and user has access
    const conversation = await Message.getConversationById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (conversation.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const newMessage = await Message.sendMessage(
      conversationId,
      userId,
      'user',
      message
    );

    res.json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Mark messages as read
router.put('/conversations/:conversationId/read', authMiddleware, async (req, res) => {
    try {
        const { conversationId } = req.params;
        
        const conversation = await Message.getConversationById(conversationId);
        
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }
        
        if (conversation.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        
        await Message.markAsRead(conversationId, req.user.id);
        
        res.json({
            success: true,
            message: 'Messages marked as read'
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark messages as read'
        });
    }
});

// Archive conversation
router.put('/conversations/:conversationId/archive', authMiddleware, async (req, res) => {
    try {
        const { conversationId } = req.params;
        
        // Verify user has access to this conversation
        const conversation = await Message.getConversationById(conversationId);
        
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }
        
        if (conversation.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        
        const archived = await Message.archiveConversation(conversationId);
        
        res.json({
            success: true,
            data: archived,
            message: 'Conversation archived'
        });
    } catch (error) {
        console.error('Error archiving conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to archive conversation'
        });
    }
});

// ============================================
// ENTERPRISE MESSAGE ROUTES
// ============================================

// Get enterprise conversations
router.get('/enterprise/conversations', authMiddleware, async (req, res) => {
    try {
        // Check if user has enterprise_id in their profile
        // You'll need to add enterprise_id to users table or have a separate mapping
        const enterpriseId = req.user.enterprise_id; // Assuming this exists
        
        if (!enterpriseId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No enterprise associated with this account'
            });
        }
        
        const conversations = await Message.getEnterpriseConversations(enterpriseId);
        
        res.json({
            success: true,
            data: conversations
        });
    } catch (error) {
        console.error('Error fetching enterprise conversations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch conversations'
        });
    }
});

// Send message as enterprise
router.post('/enterprise/conversations/:conversationId/messages', authMiddleware, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { message, attachments } = req.body;
        const enterpriseId = req.user.enterprise_id;
        
        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message cannot be empty'
            });
        }
        
        // Verify enterprise has access to this conversation
        const conversation = await Message.getConversationById(conversationId);
        
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }
        
        if (conversation.enterprise_id !== enterpriseId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        
        const newMessage = await Message.sendMessage(
            conversationId,
            enterpriseId,
            'enterprise',
            message,
            attachments
        );
        
        res.json({
            success: true,
            data: newMessage
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message'
        });
    }
});

// Mark messages as read (enterprise)
router.put('/enterprise/conversations/:conversationId/read', authMiddleware, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const enterpriseId = req.user.enterprise_id;
        
        const conversation = await Message.getConversationById(conversationId);
        
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }
        
        if (conversation.enterprise_id !== enterpriseId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        
        await Message.markEnterpriseAsRead(conversationId, enterpriseId);
        
        res.json({
            success: true,
            message: 'Messages marked as read'
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark messages as read'
        });
    }
});

// Get tourist details
router.get('/tourist/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Only enterprises can view tourist details
        if (req.user.role !== 'enterprise' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }
        
        const details = await Message.getTouristDetails(userId);
        
        if (!details) {
            return res.status(404).json({
                success: false,
                message: 'Tourist not found'
            });
        }
        
        res.json({
            success: true,
            data: details
        });
    } catch (error) {
        console.error('Error fetching tourist details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tourist details'
        });
    }
});

module.exports = router;