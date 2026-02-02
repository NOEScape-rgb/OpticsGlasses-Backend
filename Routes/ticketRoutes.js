const express = require("express");
const router = express.Router();
const {
    createTicketController,
    getAllTicketsController,
    getTicketByIdController,
    updateTicketController,
    addMessageController,
    deleteTicketController,
} = require("../controllers/ticketController");
const { verifyToken } = require("../middleware/authMiddleware");

/**
 * @route   GET /api/tickets
 * @desc    Get all tickets with filtering, sorting, and pagination
 * @access  Private (Admin or Authenticated User)
 */
// TODO: Consider separating admin view (all tickets) vs user view (own tickets)
router.get("/", verifyToken, getAllTicketsController);

/**
 * @route   GET /api/tickets/:id
 * @desc    Get single ticket details
 * @access  Private
 */
router.get("/:id", verifyToken, getTicketByIdController);

/**
 * @route   POST /api/tickets
 * @desc    Create a new ticket
 * @access  Public (Can be created by guests too, if email provided) or Private
 */
// Depending on requirements, this might not need verifyToken if guests can submit tickets
router.post("/", createTicketController);

/**
 * @route   PATCH /api/tickets/:id
 * @desc    Update ticket status or priority
 * @access  Private (Admin or Owner)
 */
router.patch("/:id", verifyToken, updateTicketController);

/**
 * @route   POST /api/tickets/:id/message
 * @desc    Add a message/reply to the ticket
 * @access  Private (Admin or Owner)
 */
router.post("/:id/message", verifyToken, addMessageController);

/**
 * @route   DELETE /api/tickets/:id
 * @desc    Delete a ticket
 * @access  Private (Admin)
 */
router.delete("/:id", verifyToken, deleteTicketController);

module.exports = router;
