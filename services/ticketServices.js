const Ticket = require("../models/Ticket");

// Create a new ticket
const createTicket = async (ticketData) => {
    const ticket = await Ticket.create(ticketData);
    return ticket;
};

// Get all tickets with filtering, sorting, and pagination
const getAllTickets = async (queryString) => {
    // 1. Filtering
    const queryObj = { ...queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Ticket.find(JSON.parse(queryStr));

    // 2. Sorting
    if (queryString.sort) {
        const sortBy = queryString.sort.split(",").join(" ");
        query = query.sort(sortBy);
    } else {
        query = query.sort("-createdAt");
    }

    // 3. Field Limiting
    if (queryString.fields) {
        const fields = queryString.fields.split(",").join(" ");
        query = query.select(fields);
    } else {
        query = query.select("-__v");
    }

    // 4. Pagination
    const page = queryString.page * 1 || 1;
    const limit = queryString.limit * 1 || 20;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const tickets = await query;
    return tickets;
};

// Get single ticket by ID
const getTicketById = async (id) => {
    const ticket = await Ticket.findById(id);
    if (!ticket) {
        throw new Error("Ticket not found");
    }
    return ticket;
};

// Update ticket (e.g., status, priority)
const updateTicket = async (id, updateData) => {
    const ticket = await Ticket.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
    if (!ticket) {
        throw new Error("Ticket not found");
    }
    return ticket;
};

// Add a message to the ticket
const addMessageToTicket = async (id, messageData) => {
    const ticket = await Ticket.findById(id);
    if (!ticket) {
        throw new Error("Ticket not found");
    }
    ticket.messages.push(messageData);
    await ticket.save();
    return ticket;
};

// Delete ticket
const deleteTicket = async (id) => {
    const ticket = await Ticket.findByIdAndDelete(id);
    if (!ticket) {
        throw new Error("Ticket not found");
    }
    return ticket;
};

module.exports = {
    createTicket,
    getAllTickets,
    getTicketById,
    updateTicket,
    addMessageToTicket,
    deleteTicket,
};
