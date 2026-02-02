const ticketServices = require("../services/ticketServices");

// Create Ticket
const createTicketController = async (req, res) => {
    try {
        const ticket = await ticketServices.createTicket(req.body);
        res.status(201).json({
            isStatus: true,
            msg: "Ticket created successfully",
            data: ticket,
        });
    } catch (error) {
        res.status(400).json({
            isStatus: false,
            msg: error.message || "Bad Request",
            data: null,
        });
    }
};

// Get All Tickets
const getAllTicketsController = async (req, res) => {
    try {
        const tickets = await ticketServices.getAllTickets(req.query);
        res.status(200).json({
            isStatus: true,
            results: tickets.length,
            msg: "Tickets retrieved successfully",
            data: tickets,
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || "Internal Server Error",
            data: null,
        });
    }
};

// Get Single Ticket
const getTicketByIdController = async (req, res) => {
    try {
        const ticket = await ticketServices.getTicketById(req.params.id);
        res.status(200).json({
            isStatus: true,
            msg: "Ticket retrieved successfully",
            data: ticket,
        });
    } catch (error) {
        if (error.message === "Ticket not found") {
            return res.status(404).json({
                isStatus: false,
                msg: "Ticket not found",
                data: null,
            });
        }
        res.status(500).json({
            isStatus: false,
            msg: error.message || "Internal Server Error",
            data: null,
        });
    }
};

// Update Ticket
const updateTicketController = async (req, res) => {
    try {
        const ticket = await ticketServices.updateTicket(req.params.id, req.body);
        res.status(200).json({
            isStatus: true,
            msg: "Ticket updated successfully",
            data: ticket,
        });
    } catch (error) {
        if (error.message === "Ticket not found") {
            return res.status(404).json({
                isStatus: false,
                msg: "Ticket not found",
                data: null,
            });
        }
        res.status(400).json({
            isStatus: false,
            msg: error.message || "Bad Request",
            data: null,
        });
    }
};

// Add Message
const addMessageController = async (req, res) => {
    try {
        const ticket = await ticketServices.addMessageToTicket(req.params.id, req.body);
        res.status(200).json({
            isStatus: true,
            msg: "Message added successfully",
            data: ticket,
        });
    } catch (error) {
        if (error.message === "Ticket not found") {
            return res.status(404).json({
                isStatus: false,
                msg: "Ticket not found",
                data: null,
            });
        }
        res.status(400).json({
            isStatus: false,
            msg: error.message || "Bad Request",
            data: null,
        });
    }
};

// Delete Ticket
const deleteTicketController = async (req, res) => {
    try {
        await ticketServices.deleteTicket(req.params.id);
        res.status(200).json({
            isStatus: true,
            msg: "Ticket deleted successfully",
            data: null,
        });
    } catch (error) {
        if (error.message === "Ticket not found") {
            return res.status(404).json({
                isStatus: false,
                msg: "Ticket not found",
                data: null,
            });
        }
        res.status(500).json({
            isStatus: false,
            msg: error.message || "Internal Server Error",
            data: null,
        });
    }
};

module.exports = {
    createTicketController,
    getAllTicketsController,
    getTicketByIdController,
    updateTicketController,
    addMessageController,
    deleteTicketController,
};
